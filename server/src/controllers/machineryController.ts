import { Request, Response } from 'express'
import prisma from '../config/database'

export const getMachineries = async (req: Request, res: Response) => {
  try {
    const machineries = await prisma.machinery.findMany({
      orderBy: { name: 'asc' },
    })
    res.json(machineries)
  } catch (error) {
    console.error('Error fetching machineries:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getMachineryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const machinery = await prisma.machinery.findUnique({
      where: { id },
      include: {
        usages: {
          include: { project: { select: { name: true } } },
          orderBy: { date: 'desc' },
        },
        maintenances: {
          include: { project: { select: { name: true } } },
          orderBy: { date: 'desc' },
        },
      },
    })

    if (!machinery) {
      return res.status(404).json({ error: 'Machinery not found' })
    }

    // Current project assignment: project of the latest usage log
    const latestUsage = machinery.usages[0]
    const currentProject = latestUsage ? latestUsage.project.name : 'Unassigned'

    // Compute monthly stats (current calendar month)
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    const thisMonthUsages = machinery.usages.filter((u) => {
      const uDate = new Date(u.date)
      return uDate >= startOfMonth && uDate <= endOfMonth
    })

    const totalUsageThisMonth = thisMonthUsages.reduce((sum, u) => {
      const amount = machinery.paymentType === 'HOUR' ? (u.hoursUsed || 0) : (u.daysUsed || 0)
      return sum + amount
    }, 0)

    const totalCostThisMonth = thisMonthUsages.reduce((sum, u) => sum + u.totalCost, 0)

    res.json({
      ...machinery,
      currentProject,
      stats: {
        totalUsageThisMonth,
        totalCostThisMonth,
      },
    })
  } catch (error) {
    console.error('Error fetching machinery details:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const createMachinery = async (req: Request, res: Response) => {
  try {
    const { name, brand, ownership, hireSource, paymentType, rate, status } = req.body

    if (!name || !ownership || !paymentType || rate === undefined) {
      return res.status(400).json({ error: 'Name, ownership, paymentType, and rate are required' })
    }

    const rateNum = parseFloat(rate)
    if (isNaN(rateNum) || rateNum <= 0) {
      return res.status(400).json({ error: 'Payment rate must be a positive number' })
    }

    if (ownership === 'HIRED' && !hireSource) {
      return res.status(400).json({ error: 'Hire source is required for hired machinery' })
    }

    const machinery = await prisma.machinery.create({
      data: {
        name,
        brand: brand || null,
        ownership,
        hireSource: ownership === 'HIRED' ? hireSource : null,
        paymentType,
        rate: rateNum,
        status: status || 'ACTIVE',
      },
    })

    res.status(201).json(machinery)
  } catch (error) {
    console.error('Error creating machinery:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const logUsage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { projectId, date, hoursUsed, daysUsed, operatorName } = req.body
    const user = req.user

    if (!projectId || !date) {
      return res.status(400).json({ error: 'projectId and date are required' })
    }

    const machinery = await prisma.machinery.findUnique({
      where: { id },
    })

    if (!machinery) {
      return res.status(404).json({ error: 'Machinery not found' })
    }

    // Verify machine is not locked in maintenance or inactive
    if (machinery.status === 'MAINTENANCE') {
      return res.status(400).json({ error: 'Machinery is currently in maintenance and cannot be logged for usage.' })
    }
    if (machinery.status === 'INACTIVE') {
      return res.status(400).json({ error: 'Machinery is inactive.' })
    }

    // Calculate usage cost
    const qty = machinery.paymentType === 'HOUR' ? parseFloat(hoursUsed) : parseFloat(daysUsed)
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Usage hours/days must be a positive number' })
    }

    const totalCost = qty * machinery.rate
    const targetDate = new Date(date)

    const result = await prisma.$transaction(async (tx) => {
      // 1. Log machinery usage
      const usage = await tx.machineryUsage.create({
        data: {
          machineryId: id,
          projectId,
          date: targetDate,
          hoursUsed: machinery.paymentType === 'HOUR' ? qty : null,
          daysUsed: machinery.paymentType === 'DAY' ? qty : null,
          operatorName: operatorName || null,
          totalCost,
        },
      })

      // 2. Create project expense under category EQUIPMENT
      await tx.expense.create({
        data: {
          projectId,
          category: 'EQUIPMENT',
          amount: totalCost,
          description: `Usage cost of ${machinery.name} (${qty} ${machinery.paymentType.toLowerCase()}s)`,
          date: targetDate,
          createdById: user?.id || null,
          isAuto: true,
        },
      })


      return usage
    })

    res.status(201).json(result)
  } catch (error) {
    console.error('Error logging machinery usage:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const logMaintenance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { projectId, date, description, cost, doneBy, setStatusMaintenance } = req.body
    const user = req.user

    if (!projectId || !date || !description || cost === undefined) {
      return res.status(400).json({ error: 'projectId, date, description, and cost are required' })
    }

    const costNum = parseFloat(cost)
    if (isNaN(costNum) || costNum < 0) {
      return res.status(400).json({ error: 'Maintenance cost must be a non-negative number' })
    }

    const machinery = await prisma.machinery.findUnique({
      where: { id },
    })

    if (!machinery) {
      return res.status(404).json({ error: 'Machinery not found' })
    }

    const targetDate = new Date(date)

    const result = await prisma.$transaction(async (tx) => {
      // 1. Log maintenance
      const maintenance = await tx.machineryMaintenance.create({
        data: {
          machineryId: id,
          projectId,
          date: targetDate,
          description,
          cost: costNum,
          doneBy: doneBy || null,
        },
      })

      // 2. If status change is requested
      if (setStatusMaintenance === true) {
        await tx.machinery.update({
          where: { id },
          data: { status: 'MAINTENANCE' },
        })
      }

      // 3. Post cost to EQUIPMENT expense
      if (costNum > 0) {
        await tx.expense.create({
          data: {
            projectId,
            category: 'EQUIPMENT',
            amount: costNum,
            description: `Maintenance of ${machinery.name}: ${description}`,
            date: targetDate,
            createdById: user?.id || null,
            isAuto: true,
          },
        })
      }


      return maintenance
    })

    res.status(201).json(result)
  } catch (error) {
    console.error('Error logging maintenance:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ error: 'Status is required' })
    }

    const updated = await prisma.machinery.update({
      where: { id },
      data: { status },
    })

    res.json(updated)
  } catch (error) {
    console.error('Error updating machinery status:', error)
    res.status(500).json({ error: 'Server error' })
  }
}
