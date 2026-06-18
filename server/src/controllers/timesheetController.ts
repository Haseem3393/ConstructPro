import { Request, Response } from 'express'
import prisma from '../config/database'
import { TimesheetStatus } from '@prisma/client'

export const getTimesheets = async (req: Request, res: Response) => {
  try {
    const { projectId, status } = req.query

    const whereClause: any = {}
    if (projectId) whereClause.projectId = projectId as string
    if (status) whereClause.status = status as any

    const timesheets = await prisma.timesheet.findMany({
      where: whereClause,
      include: {
        project: { select: { name: true, location: true } },
        submittedBy: { select: { name: true } },
        approvedBy: { select: { name: true } },
      },
      orderBy: { startDate: 'desc' },
    })

    res.json(timesheets)
  } catch (error) {
    console.error('Error fetching timesheets:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getTimesheetById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const timesheet = await prisma.timesheet.findUnique({
      where: { id },
      include: {
        project: { select: { name: true, location: true } },
        submittedBy: { select: { name: true } },
        approvedBy: { select: { name: true } },
        rows: {
          include: {
            worker: { select: { name: true, trade: true, dailyWage: true } },
          },
        },
      },
    })

    if (!timesheet) {
      return res.status(404).json({ error: 'Timesheet not found' })
    }

    res.json(timesheet)
  } catch (error) {
    console.error('Error fetching timesheet details:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const createTimesheet = async (req: Request, res: Response) => {
  try {
    const { projectId, startDate } = req.body
    const user = req.user

    if (!projectId || !startDate) {
      return res.status(400).json({ error: 'projectId and startDate (Monday) are required' })
    }

    const start = new Date(startDate)
    start.setUTCHours(0, 0, 0, 0)
    
    // Ensure startDate is a Monday
    const dayOfWeek = start.getUTCDay()
    if (dayOfWeek !== 1) {
      return res.status(400).json({ error: 'Timesheet start date must be a Monday.' })
    }

    const end = new Date(start)
    end.setUTCDate(start.getUTCDate() + 6)
    end.setUTCHours(23, 59, 59, 999)

    // Check if timesheet already exists
    const existing = await prisma.timesheet.findFirst({
      where: {
        projectId,
        startDate: start,
      },
    })

    if (existing) {
      return res.status(400).json({ error: 'A timesheet for this project and week already exists.' })
    }

    // Find all workers who have active check-ins on this project in the week
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        projectId,
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        worker: true,
      },
    })

    // Get unique workers
    const workerMap = new Map<string, any>()
    attendanceRecords.forEach((a) => {
      workerMap.set(a.workerId, a.worker)
    })

    const workers = Array.from(workerMap.values())

    // If no records found, fetch active workers on site members or all active workers to populate empty timesheet
    if (workers.length === 0) {
      const activeWorkers = await prisma.worker.findMany({
        where: { active: true },
      })
      workers.push(...activeWorkers)
    }

    // Create timesheet
    const timesheet = await prisma.timesheet.create({
      data: {
        projectId,
        startDate: start,
        endDate: end,
        status: 'DRAFT',
        submittedById: user?.id || null,
      },
    })

    let grandTotalHours = 0

    // Compile Mon-Sun hours for each worker
    for (const worker of workers) {
      const dailyHours = [0, 0, 0, 0, 0, 0, 0] // Mon-Sun (0-6)

      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(start)
        checkDate.setUTCDate(start.getUTCDate() + i)
        checkDate.setUTCHours(0, 0, 0, 0)

        const log = attendanceRecords.find(
          (a) => a.workerId === worker.id && a.date.getTime() === checkDate.getTime()
        )

        if (log && log.present) {
          dailyHours[i] = 8 + (log.overtimeHours || 0)
        }
      }

      const totalHours = dailyHours.reduce((sum, h) => sum + h, 0)
      grandTotalHours += totalHours

      await prisma.timesheetRow.create({
        data: {
          timesheetId: timesheet.id,
          workerId: worker.id,
          mondayHours: dailyHours[0],
          tuesdayHours: dailyHours[1],
          wednesdayHours: dailyHours[2],
          thursdayHours: dailyHours[3],
          fridayHours: dailyHours[4],
          saturdayHours: dailyHours[5],
          sundayHours: dailyHours[6],
          totalHours,
        },
      })
    }

    // Update timesheet total hours
    const updated = await prisma.timesheet.update({
      where: { id: timesheet.id },
      data: { totalHours: grandTotalHours },
      include: {
        rows: {
          include: {
            worker: { select: { name: true, trade: true } },
          },
        },
      },
    })

    res.json(updated)
  } catch (error) {
    console.error('Error creating timesheet:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const submitTimesheet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const user = req.user

    const timesheet = await prisma.timesheet.findUnique({
      where: { id },
    })

    if (!timesheet) {
      return res.status(404).json({ error: 'Timesheet not found' })
    }

    if (timesheet.status === 'APPROVED') {
      return res.status(400).json({ error: 'Timesheet is already approved and locked' })
    }

    const updated = await prisma.timesheet.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submittedById: user?.id || null,
        rejectionReason: null,
      },
    })

    res.json(updated)
  } catch (error) {
    console.error('Error submitting timesheet:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const approveTimesheet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const user = req.user

    const timesheet = await prisma.timesheet.findUnique({
      where: { id },
      include: {
        rows: {
          include: {
            worker: true,
          },
        },
      },
    })

    if (!timesheet) {
      return res.status(404).json({ error: 'Timesheet not found' })
    }

    if (timesheet.status === 'APPROVED') {
      return res.status(400).json({ error: 'Timesheet is already approved' })
    }

    const updated = await prisma.timesheet.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedById: user?.id || null,
      },
    })

    // Generate payroll records & calculate overall labor costs
    let totalLaborCost = 0
    for (const row of timesheet.rows) {
      // Calculate pay for the weekly hours
      const dailyWage = row.worker.dailyWage
      const hourlyRate = dailyWage / 8

      // Mon-Sun hours
      const hours = [
        row.mondayHours,
        row.tuesdayHours,
        row.wednesdayHours,
        row.thursdayHours,
        row.fridayHours,
        row.saturdayHours,
        row.sundayHours,
      ]

      let weeklyPay = 0
      hours.forEach((h) => {
        if (h > 0) {
          // Present. dailyWage + overtime
          const overtime = Math.max(0, h - 8)
          weeklyPay += dailyWage + overtime * 1.5 * hourlyRate
        }
      })

      totalLaborCost += weeklyPay

      await prisma.payroll.create({
        data: {
          workerId: row.workerId,
          amount: weeklyPay,
          hours: row.totalHours,
          date: new Date(),
          status: 'APPROVED',
        },
      })
    }

    // Post to project expense as weekly labor costs
    if (totalLaborCost > 0) {
      await prisma.expense.create({
        data: {
          projectId: timesheet.projectId,
          category: 'LABOUR',
          amount: totalLaborCost,
          description: `Weekly timesheet payroll expense (Period: ${timesheet.startDate.toLocaleDateString()} to ${timesheet.endDate.toLocaleDateString()})`,
          date: new Date(),
          createdById: user?.id || null,
          isAuto: true,
        },
      })
    }

    res.json(updated)
  } catch (error) {
    console.error('Error approving timesheet:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const rejectTimesheet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { reason } = req.body
    const user = req.user

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' })
    }

    const timesheet = await prisma.timesheet.findUnique({
      where: { id },
    })

    if (!timesheet) {
      return res.status(404).json({ error: 'Timesheet not found' })
    }

    if (timesheet.status === 'APPROVED') {
      return res.status(400).json({ error: 'Approved timesheets cannot be rejected' })
    }

    const updated = await prisma.timesheet.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        approvedById: user?.id || null,
      },
    })

    res.json(updated)
  } catch (error) {
    console.error('Error rejecting timesheet:', error)
    res.status(500).json({ error: 'Server error' })
  }
}
