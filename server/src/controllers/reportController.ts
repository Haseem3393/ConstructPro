import { Request, Response } from 'express'
import prisma from '../config/database'

// Legacy Endpoints
export const getFinancialReport = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { name: 'asc' },
    })

    const report = []

    for (const project of projects) {
      const expenses = await prisma.expense.findMany({
        where: { projectId: project.id },
      })

      const spent = expenses.reduce((sum, e) => sum + e.amount, 0)
      
      const spentByCategory = {
        LABOUR: 0,
        MATERIAL: 0,
        EQUIPMENT: 0,
        OTHER: 0,
      }

      expenses.forEach((e) => {
        // Safe check for category match
        const cat = e.category as string
        if (cat === 'LABOUR' || cat === 'MATERIAL' || cat === 'EQUIPMENT') {
          spentByCategory[cat] += e.amount
        } else {
          spentByCategory['OTHER'] += e.amount
        }
      })

      report.push({
        projectId: project.id,
        name: project.name,
        budget: project.budget,
        spent,
        remaining: project.budget - spent,
        utilizationRate: project.budget > 0 ? (spent / project.budget) * 100 : 0,
        spentByCategory,
        progress: project.progress,
      })
    }

    res.json(report)
  } catch (error) {
    console.error('Error compiling financial report:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getLabourReport = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { name: 'asc' },
    })

    const report = []

    for (const project of projects) {
      const attendance = await prisma.attendance.findMany({
        where: { projectId: project.id },
      })

      const totalLabourPayout = attendance.reduce((sum, a) => sum + a.totalPay, 0)
      const totalManDays = attendance.filter((a) => a.present).length
      const totalOvertimeHours = attendance.reduce((sum, a) => sum + a.overtimeHours, 0)

      report.push({
        projectId: project.id,
        name: project.name,
        totalLabourPayout,
        totalManDays,
        totalOvertimeHours,
      })
    }

    res.json(report)
  } catch (error) {
    console.error('Error compiling labour report:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getInventoryReport = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { name: 'asc' },
    })

    const report = []

    for (const project of projects) {
      const materials = await prisma.material.findMany({
        where: { projectId: project.id },
      })

      const lowStockItems = materials.filter((m) => m.currentStock <= m.minimumLevel)
      const lowStockCount = lowStockItems.length

      report.push({
        projectId: project.id,
        name: project.name,
        totalMaterials: materials.length,
        lowStockCount,
        lowStockItems: lowStockItems.map((m) => ({
          id: m.id,
          name: m.name,
          currentStock: m.currentStock,
          minimumLevel: m.minimumLevel,
          unit: m.unit,
          supplier: m.supplier,
        })),
      })
    }

    res.json(report)
  } catch (error) {
    console.error('Error compiling inventory report:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

// ==========================================
// New Module 11 Report Endpoints
// ==========================================

export const getSummaryStats = async (req: Request, res: Response) => {
  try {
    const activeProjectsCount = await prisma.project.count({
      where: { status: 'ONGOING' }
    })
    const totalBudgetResult = await prisma.project.aggregate({
      _sum: { budget: true }
    })
    const totalSpentResult = await prisma.expense.aggregate({
      _sum: { amount: true }
    })
    const activeWorkersCount = await prisma.worker.count({
      where: { active: true }
    })
    const activeContractsCount = await prisma.contract.count({
      where: { status: 'ACTIVE' }
    })
    const activeMachineryCount = await prisma.machinery.count({
      where: { status: 'ACTIVE' }
    })

    // Count materials below minimumLevel
    const materials = await prisma.material.findMany({
      select: { currentStock: true, minimumLevel: true }
    })
    const lowStockCount = materials.filter(m => m.currentStock < m.minimumLevel).length

    res.json({
      activeProjects: activeProjectsCount,
      totalBudget: totalBudgetResult._sum.budget || 0,
      totalSpent: totalSpentResult._sum.amount || 0,
      activeWorkers: activeWorkersCount,
      activeContracts: activeContractsCount,
      activeMachinery: activeMachineryCount,
      lowStockMaterials: lowStockCount
    })
  } catch (error) {
    console.error('Error fetching summary stats:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getProjectSummaryReport = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query
    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' })
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId as string },
      include: {
        tasks: true,
        milestones: true,
        members: {
          include: { user: { select: { name: true, role: true } } }
        }
      }
    })

    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    const tasksCompleted = project.tasks.filter(t => t.status === 'DONE').length
    const tasksPending = project.tasks.length - tasksCompleted
    const milestonesCompleted = project.milestones.filter(m => m.completed).length
    const milestonesTotal = project.milestones.length
    const teamSize = project.members.length

    // Timeline status: DELAYED if endDate is in past and progress < 100 or any task is overdue and incomplete
    const today = new Date()
    let timelineStatus = 'ON_TIME'
    if (new Date(project.endDate) < today && project.progress < 100) {
      timelineStatus = 'DELAYED'
    } else if (project.tasks.some(t => t.status !== 'DONE' && new Date(t.dueDate) < today)) {
      timelineStatus = 'DELAYED'
    }

    res.json({
      id: project.id,
      name: project.name,
      progress: project.progress,
      tasksCompleted,
      tasksPending,
      milestonesCompleted,
      milestonesTotal,
      teamSize,
      timelineStatus,
      startDate: project.startDate,
      endDate: project.endDate,
      tasks: project.tasks,
      milestones: project.milestones,
      members: project.members
    })
  } catch (error) {
    console.error('Error fetching project summary report:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getExpenseReport = async (req: Request, res: Response) => {
  try {
    const { projectId, category, startDate, endDate } = req.query

    const whereClause: any = {}
    if (projectId) whereClause.projectId = projectId as string
    if (category) whereClause.category = category as any
    if (startDate || endDate) {
      whereClause.date = {}
      if (startDate) whereClause.date.gte = new Date(startDate as string)
      if (endDate) whereClause.date.lte = new Date(endDate as string)
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      include: {
        project: { select: { name: true } },
        createdBy: { select: { name: true } }
      },
      orderBy: { date: 'desc' }
    })

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0)

    // Fetch payables to calculate unpaid balance
    const payablesWhereClause: any = {}
    if (projectId) payablesWhereClause.projectId = projectId as string
    if (startDate || endDate) {
      payablesWhereClause.dueDate = {}
      if (startDate) payablesWhereClause.dueDate.gte = new Date(startDate as string)
      if (endDate) payablesWhereClause.dueDate.lte = new Date(endDate as string)
    }

    const payables = await prisma.payable.findMany({
      where: payablesWhereClause
    })

    // Unpaid balance is sum of PENDING or OVERDUE payables
    const unpaidBalance = payables
      .filter(p => p.status === 'PENDING')
      .reduce((sum, p) => sum + p.amount, 0)

    const paid = Math.max(0, totalAmount - unpaidBalance)

    res.json({
      totalAmount,
      paid,
      balance: unpaidBalance,
      expenses
    })
  } catch (error) {
    console.error('Error fetching expense report:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getPayrollReport = async (req: Request, res: Response) => {
  try {
    const { month, projectId } = req.query
    if (!month) {
      return res.status(400).json({ error: 'month parameter (YYYY-MM) is required' })
    }

    const [year, monthStr] = (month as string).split('-')
    const startOfPeriod = new Date(parseInt(year), parseInt(monthStr) - 1, 1)
    const endOfPeriod = new Date(parseInt(year), parseInt(monthStr), 0, 23, 59, 59, 999)

    const attendanceWhereClause: any = {
      date: {
        gte: startOfPeriod,
        lte: endOfPeriod
      }
    }
    if (projectId) {
      attendanceWhereClause.projectId = projectId as string
    }

    const attendanceRecords = await prisma.attendance.findMany({
      where: attendanceWhereClause,
      include: {
        worker: true,
        project: { select: { name: true } }
      }
    })

    // Aggregate by worker
    const payrollMap: { [key: string]: any } = {}
    attendanceRecords.forEach((record) => {
      if (!record.worker) return
      const wId = record.workerId
      if (!payrollMap[wId]) {
        payrollMap[wId] = {
          workerId: wId,
          workerName: record.worker.name,
          trade: record.worker.trade,
          days: 0,
          basic: 0,
          overtime: 0,
          total: 0,
          projects: new Set<string>()
        }
      }

      payrollMap[wId].projects.add(record.project?.name || '')
      if (record.present) {
        payrollMap[wId].days += 1
        const dailyBasic = record.dailyWage
        const hourlyRate = dailyBasic / 8
        const otPay = record.overtimeHours * hourlyRate * 1.5
        
        payrollMap[wId].basic += dailyBasic
        payrollMap[wId].overtime += otPay
        payrollMap[wId].total += (dailyBasic + otPay)
      }
    })

    const payrollList = Object.values(payrollMap).map((p: any) => ({
      ...p,
      projects: Array.from(p.projects).join(', ')
    }))

    const grandTotal = payrollList.reduce((sum, p) => sum + p.total, 0)

    res.json({
      payroll: payrollList,
      grandTotal
    })
  } catch (error) {
    console.error('Error fetching payroll report:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getAttendanceReport = async (req: Request, res: Response) => {
  try {
    const { projectId, startDate, endDate } = req.query

    const whereClause: any = {}
    if (projectId) whereClause.projectId = projectId as string
    if (startDate || endDate) {
      whereClause.date = {}
      if (startDate) whereClause.date.gte = new Date(startDate as string)
      if (endDate) whereClause.date.lte = new Date(endDate as string)
    }

    const attendanceRecords = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        worker: true,
        project: { select: { name: true } }
      },
      orderBy: { date: 'asc' }
    })

    // Get all active workers
    const workers = await prisma.worker.findMany({
      where: { active: true }
    })

    // Group by worker to compute attendance rates
    const workerStats: { [key: string]: any } = {}
    workers.forEach(w => {
      workerStats[w.id] = {
        workerId: w.id,
        name: w.name,
        trade: w.trade,
        present: 0,
        absent: 0,
        total: 0
      }
    })

    attendanceRecords.forEach(record => {
      const wId = record.workerId
      if (!workerStats[wId]) {
        workerStats[wId] = {
          workerId: wId,
          name: record.worker?.name || 'Unknown',
          trade: record.worker?.trade || 'General',
          present: 0,
          absent: 0,
          total: 0
        }
      }
      workerStats[wId].total += 1
      if (record.present) {
        workerStats[wId].present += 1
      } else {
        workerStats[wId].absent += 1
      }
    })

    const workerTable = Object.values(workerStats).map((ws: any) => ({
      ...ws,
      rate: ws.total > 0 ? (ws.present / ws.total) * 100 : 0
    }))

    // Calculate attendance rate % per project
    const projectStats: { [key: string]: { present: number, total: number } } = {}
    attendanceRecords.forEach(record => {
      const pId = record.projectId
      if (!projectStats[pId]) {
        projectStats[pId] = { present: 0, total: 0 }
      }
      projectStats[pId].total += 1
      if (record.present) projectStats[pId].present += 1
    })

    const projectRates = Object.keys(projectStats).map(pId => {
      const stats = projectStats[pId]
      return {
        projectId: pId,
        rate: stats.total > 0 ? (stats.present / stats.total) * 100 : 0
      }
    })

    // Absence pattern analysis: find workers who are frequently absent
    const absenceAnalysis = workerTable
      .filter((w: any) => w.rate < 85 && w.total > 0)
      .map((w: any) => ({
        workerId: w.workerId,
        name: w.name,
        trade: w.trade,
        absenceRate: 100 - w.rate,
        impact: w.rate < 50 ? 'CRITICAL' : w.rate < 75 ? 'HIGH' : 'MEDIUM'
      }))

    // Chart: daily attendance trend
    const dailyTrendMap: { [key: string]: { date: string, present: number, absent: number } } = {}
    attendanceRecords.forEach(record => {
      const dateStr = record.date.toISOString().split('T')[0]
      if (!dailyTrendMap[dateStr]) {
        dailyTrendMap[dateStr] = { date: dateStr, present: 0, absent: 0 }
      }
      if (record.present) {
        dailyTrendMap[dateStr].present += 1
      } else {
        dailyTrendMap[dateStr].absent += 1
      }
    })
    const dailyTrend = Object.values(dailyTrendMap).sort((a, b) => a.date.localeCompare(b.date))

    res.json({
      projectRates,
      workerTable,
      absenceAnalysis,
      dailyTrend
    })
  } catch (error) {
    console.error('Error fetching attendance report:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getMaterialUsageReport = async (req: Request, res: Response) => {
  try {
    const { projectId, startDate, endDate } = req.query

    const whereClause: any = {
      type: 'STOCK_OUT'
    }
    if (projectId) whereClause.projectId = projectId as string
    if (startDate || endDate) {
      whereClause.date = {}
      if (startDate) whereClause.date.gte = new Date(startDate as string)
      if (endDate) whereClause.date.lte = new Date(endDate as string)
    }

    const transactions = await prisma.materialTransaction.findMany({
      where: whereClause,
      include: {
        material: true
      }
    })

    // Aggregate by material
    const usageMap: { [key: string]: any } = {}
    transactions.forEach(tx => {
      const matId = tx.materialId
      const matName = tx.material?.name || 'Unknown'
      const unit = tx.material?.unit || 'bags'
      const key = `${matId}`
      if (!usageMap[key]) {
        usageMap[key] = {
          materialId: matId,
          name: matName,
          unit,
          usedQty: 0,
          totalCost: 0
        }
      }
      usageMap[key].usedQty += tx.quantity
      usageMap[key].totalCost += tx.quantity * tx.unitPrice
    })

    const materialUsage = Object.values(usageMap).map((m: any) => {
      const avgPrice = m.usedQty > 0 ? (m.totalCost / m.usedQty) : 0
      return {
        materialId: m.materialId,
        name: m.name,
        usedQty: m.usedQty,
        unit: m.unit,
        avgPrice,
        totalCost: m.totalCost
      }
    })

    // Most used chart (top 5 by cost)
    const mostUsed = [...materialUsage]
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 5)

    // Wastage analysis: simulate wastage as 3.5% of totalCost
    const totalMaterialCost = materialUsage.reduce((sum, m) => sum + m.totalCost, 0)
    const wastageRate = 0.035
    const wastageCost = totalMaterialCost * wastageRate
    
    const wastageAnalysis = materialUsage.map((m: any) => {
      const wastageQty = m.usedQty * wastageRate
      const wCost = m.totalCost * wastageRate
      return {
        name: m.name,
        usedQty: m.usedQty,
        unit: m.unit,
        wastageQty,
        wastageCost: wCost,
        status: wCost > 10000 ? 'HIGH' : wCost > 3000 ? 'MEDIUM' : 'NORMAL'
      }
    })

    res.json({
      materialUsage,
      mostUsed,
      wastageAnalysis,
      totalMaterialCost,
      wastageCost
    })
  } catch (error) {
    console.error('Error fetching material usage report:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getBudgetComparisonReport = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        expenses: { select: { amount: true } }
      }
    })

    const budgetReport = projects.map(p => {
      const actual = p.expenses.reduce((sum, e) => sum + e.amount, 0)
      const variance = p.budget - actual
      const percentUsed = p.budget > 0 ? (actual / p.budget) * 100 : 0
      return {
        projectId: p.id,
        projectName: p.name,
        budget: p.budget,
        actual,
        variance,
        percentUsed,
        overspent: variance < 0
      }
    })

    // Sort by variance (worst first, i.e., most overspent first / negative variance first)
    budgetReport.sort((a, b) => a.variance - b.variance)

    res.json(budgetReport)
  } catch (error) {
    console.error('Error fetching budget comparison report:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getMachineryUsageReport = async (req: Request, res: Response) => {
  try {
    const machinery = await prisma.machinery.findMany({
      include: {
        usages: {
          include: { project: { select: { name: true } } }
        }
      }
    })

    const report = machinery.map(m => {
      const hoursUsed = m.usages.reduce((sum, u) => sum + (u.hoursUsed || 0), 0)
      const daysUsed = m.usages.reduce((sum, u) => sum + (u.daysUsed || 0), 0)
      const cost = m.usages.reduce((sum, u) => sum + u.totalCost, 0)
      
      const projects = Array.from(new Set(m.usages.map(u => u.project?.name || ''))).filter(Boolean)

      return {
        id: m.id,
        name: m.name,
        brand: m.brand,
        ownership: m.ownership,
        hoursUsed: m.paymentType === 'HOUR' ? hoursUsed : daysUsed * 8, // normalize to hours
        cost,
        projects: projects.join(', ')
      }
    })

    // Owned vs Hired Cost
    const owned = report.filter(m => m.ownership === 'OWNED')
    const hired = report.filter(m => m.ownership === 'HIRED')

    const ownedCost = owned.reduce((sum, m) => sum + m.cost, 0)
    const hiredCost = hired.reduce((sum, m) => sum + m.cost, 0)

    const ownedHours = owned.reduce((sum, m) => sum + m.hoursUsed, 0)
    const hiredHours = hired.reduce((sum, m) => sum + m.hoursUsed, 0)

    res.json({
      machinery: report,
      ownedCost,
      hiredCost,
      ownedHours,
      hiredHours
    })
  } catch (error) {
    console.error('Error fetching machinery usage report:', error)
    res.status(500).json({ error: 'Server error' })
  }
}
