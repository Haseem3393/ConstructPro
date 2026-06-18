import { Request, Response } from 'express'
import prisma from '../config/database'

export const getAttendanceByDate = async (req: Request, res: Response) => {
  try {
    const { projectId, date } = req.query

    if (!projectId || !date) {
      return res.status(400).json({ error: 'projectId and date query parameters are required' })
    }

    const targetDate = new Date(date as string)
    targetDate.setUTCHours(0, 0, 0, 0)

    const workers = await prisma.worker.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    })

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        projectId: projectId as string,
        date: targetDate,
      },
    })

    const mergedRecords = workers.map((worker) => {
      const attendance = attendanceRecords.find((a) => a.workerId === worker.id)
      return {
        workerId: worker.id,
        name: worker.name,
        trade: worker.trade,
        dailyWage: worker.dailyWage,
        present: attendance ? attendance.present : false,
        overtimeHours: attendance ? attendance.overtimeHours : 0,
        totalPay: attendance ? attendance.totalPay : 0,
        attendanceId: attendance ? attendance.id : null,
      }
    })

    res.json(mergedRecords)
  } catch (error) {
    console.error('Error fetching attendance:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const saveAttendance = async (req: Request, res: Response) => {
  try {
    const { projectId, date, records } = req.body
    const user = req.user

    if (!projectId || !date || !Array.isArray(records)) {
      return res.status(400).json({ error: 'projectId, date, and records (array) are required' })
    }

    const targetDate = new Date(date)
    targetDate.setUTCHours(0, 0, 0, 0)

    // Check future date block
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    if (targetDate.getTime() > today.getTime()) {
      return res.status(400).json({ error: 'Cannot log attendance for future dates.' })
    }

    const savedRecords = []

    for (const record of records) {
      const { workerId, present, overtimeHours, dailyWage } = record

      let totalPay = 0
      if (present) {
        const hourlyRate = dailyWage / 8
        const overtimePay = overtimeHours ? (hourlyRate * 1.5 * overtimeHours) : 0
        totalPay = dailyWage + overtimePay
      }

      const attendanceRecord = await prisma.attendance.upsert({
        where: {
          projectId_workerId_date: {
            projectId,
            workerId,
            date: targetDate,
          },
        },
        update: {
          present,
          overtimeHours: overtimeHours || 0,
          dailyWage,
          totalPay,
          recordedById: user?.id || null,
        },
        create: {
          projectId,
          workerId,
          date: targetDate,
          present,
          overtimeHours: overtimeHours || 0,
          dailyWage,
          totalPay,
          recordedById: user?.id || null,
        },
      })

      savedRecords.push(attendanceRecord)
    }

    // Sync to Expense ledger
    const totalLaborCost = savedRecords.reduce((sum, r) => sum + r.totalPay, 0)
    if (totalLaborCost > 0) {
      const existingExpense = await prisma.expense.findFirst({
        where: {
          projectId,
          category: 'LABOUR',
          date: targetDate,
        },
      })

      if (existingExpense) {
        await prisma.expense.update({
          where: { id: existingExpense.id },
          data: {
            amount: totalLaborCost,
            description: `Labour expense update for date ${date}`,
          },
        })
      } else {
        await prisma.expense.create({
          data: {
            projectId,
            category: 'LABOUR',
            amount: totalLaborCost,
            description: `Labour expense for date ${date}`,
            date: targetDate,
            createdById: user?.id || null,
            isAuto: true,
          },
        })
      }
    }

    res.json({ message: 'Attendance saved successfully', records: savedRecords })
  } catch (error) {
    console.error('Error saving attendance:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getAttendanceHistory = async (req: Request, res: Response) => {
  try {
    const { projectId, workerId, startDate, endDate } = req.query

    const whereClause: any = {}

    if (projectId) whereClause.projectId = projectId as string
    if (workerId) whereClause.workerId = workerId as string
    
    if (startDate || endDate) {
      whereClause.date = {}
      if (startDate) {
        const start = new Date(startDate as string)
        start.setUTCHours(0, 0, 0, 0)
        whereClause.date.gte = start
      }
      if (endDate) {
        const end = new Date(endDate as string)
        end.setUTCHours(23, 59, 59, 999)
        whereClause.date.lte = end
      }
    }

    const records = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        project: { select: { name: true } },
        worker: { select: { name: true, trade: true } },
      },
      orderBy: { date: 'desc' },
    })

    const formatted = records.map((r) => ({
      id: r.id,
      date: r.date,
      projectId: r.projectId,
      projectName: r.project.name,
      workerId: r.workerId,
      workerName: r.worker.name,
      trade: r.worker.trade,
      present: r.present,
      overtimeHours: r.overtimeHours,
      totalPay: r.totalPay,
    }))

    res.json(formatted)
  } catch (error) {
    console.error('Error fetching attendance history:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getAttendanceSummary = async (req: Request, res: Response) => {
  try {
    const { projectId, startDate, endDate } = req.query

    const whereClause: any = {}
    if (projectId) whereClause.projectId = projectId as string

    if (startDate || endDate) {
      whereClause.date = {}
      if (startDate) {
        const start = new Date(startDate as string)
        start.setUTCHours(0, 0, 0, 0)
        whereClause.date.gte = start
      }
      if (endDate) {
        const end = new Date(endDate as string)
        end.setUTCHours(23, 59, 59, 999)
        whereClause.date.lte = end
      }
    }

    const records = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        worker: { select: { name: true } },
        project: { select: { name: true } },
      },
    })

    // Aggregate by Worker
    const workerAggregates: { [key: string]: any } = {}
    records.forEach((r) => {
      if (!workerAggregates[r.workerId]) {
        workerAggregates[r.workerId] = {
          workerId: r.workerId,
          name: r.worker.name,
          presentDays: 0,
          absentDays: 0,
          overtimeHours: 0,
          totalPay: 0,
        }
      }

      if (r.present) {
        workerAggregates[r.workerId].presentDays += 1
      } else {
        workerAggregates[r.workerId].absentDays += 1
      }
      workerAggregates[r.workerId].overtimeHours += r.overtimeHours
      workerAggregates[r.workerId].totalPay += r.totalPay
    })

    // Aggregate by Project
    const projectAggregates: { [key: string]: any } = {}
    records.forEach((r) => {
      if (!projectAggregates[r.projectId]) {
        projectAggregates[r.projectId] = {
          projectId: r.projectId,
          name: r.project.name,
          totalPay: 0,
          presentCount: 0,
          totalCount: 0,
        }
      }
      projectAggregates[r.projectId].totalPay += r.totalPay
      projectAggregates[r.projectId].totalCount += 1
      if (r.present) {
        projectAggregates[r.projectId].presentCount += 1
      }
    })

    const workerSummaries = Object.values(workerAggregates)
    const projectCosts = Object.values(projectAggregates).map((p: any) => ({
      projectId: p.projectId,
      name: p.name,
      totalLabourCost: p.totalPay,
      attendanceRate: p.totalCount > 0 ? (p.presentCount / p.totalCount) * 100 : 0,
    }))

    res.json({
      workerSummaries,
      projectCosts,
    })
  } catch (error) {
    console.error('Error compiling attendance summary:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const updateAttendanceRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { present, overtimeHours, dailyWage } = req.body
    const user = req.user

    const existing = await prisma.attendance.findUnique({
      where: { id },
    })

    if (!existing) {
      return res.status(404).json({ error: 'Attendance record not found' })
    }

    // Role verification
    if (user?.role === 'SUPERVISOR') {
      return res.status(403).json({ error: 'Supervisors are not permitted to edit attendance history' })
    }

    if (user?.role === 'PROJECT_MANAGER') {
      const today = new Date()
      today.setUTCHours(0, 0, 0, 0)
      const recordDate = new Date(existing.date)
      recordDate.setUTCHours(0, 0, 0, 0)

      const diffTime = today.getTime() - recordDate.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays > 3) {
        return res.status(403).json({ error: 'Project Managers can only edit attendance records from the last 3 days' })
      }
    }

    let totalPay = 0
    if (present) {
      const hourlyRate = dailyWage / 8
      const overtimePay = overtimeHours ? (hourlyRate * 1.5 * overtimeHours) : 0
      totalPay = dailyWage + overtimePay
    }

    const updated = await prisma.attendance.update({
      where: { id },
      data: {
        present,
        overtimeHours: overtimeHours || 0,
        dailyWage,
        totalPay,
      },
    })

    // Recalculate expense ledger total
    const dayRecords = await prisma.attendance.findMany({
      where: {
        projectId: existing.projectId,
        date: existing.date,
      },
    })

    const totalLaborCost = dayRecords.reduce((sum, r) => sum + r.totalPay, 0)

    const existingExpense = await prisma.expense.findFirst({
      where: {
        projectId: existing.projectId,
        category: 'LABOUR',
        date: existing.date,
      },
    })

    if (existingExpense) {
      await prisma.expense.update({
        where: { id: existingExpense.id },
        data: {
          amount: totalLaborCost,
        },
      })
    }

    res.json({ message: 'Attendance record updated successfully', record: updated })
  } catch (error) {
    console.error('Error updating attendance record:', error)
    res.status(500).json({ error: 'Server error' })
  }
}
