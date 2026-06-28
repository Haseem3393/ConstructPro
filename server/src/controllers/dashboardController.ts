import { Request, Response } from 'express'
import prisma from '../config/database'

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Get total projects count
    const totalProjects = await prisma.project.count()

    // Get active projects count
    const activeProjects = await prisma.project.count({
      where: { status: 'ONGOING' },
    })

    // Get completed projects count
    const completedProjects = await prisma.project.count({
      where: { status: 'COMPLETED' },
    })

    // Get delayed/overdue projects count
    const overdueProjects = await prisma.project.count({
      where: { status: 'OVERDUE' },
    })

    // Get total budget across all projects
    const projects = await prisma.project.findMany({
      select: { budget: true },
    })
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0)

    // Get total spent across all projects (from expenses)
    const expenses = await prisma.expense.findMany({
      select: { amount: true },
    })
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)

    // Get recent activity (last 10 actions across different entities)
    // For now, we'll return recent expenses as activity
    const recentActivity = await prisma.expense.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          select: { name: true },
        },
        createdBy: {
          select: { name: true },
        },
      },
    })

    // Format activity feed
    const activityFeed = recentActivity.map(expense => ({
      id: expense.id,
      type: 'EXPENSE',
      description: `Expense of ${expense.amount} LKR recorded for ${expense.project.name}`,
      category: expense.category,
      project: expense.project.name,
      user: expense.createdBy?.name || 'Unknown',
      date: expense.createdAt,
    }))

    // Get projects overview
    const projectsOverview = await prisma.project.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        location: true,
        status: true,
        progress: true,
        startDate: true,
        endDate: true,
        budget: true,
        manager: {
          select: { name: true, email: true },
        },
      },
    })

    res.json({
      stats: {
        totalProjects,
        activeProjects,
        completedProjects,
        overdueProjects,
        totalBudget,
        totalSpent,
        budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
      },
      recentActivity: activityFeed,
      projectsOverview,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({ error: 'Server error fetching dashboard data' })
  }
}

export const getPortfolioData = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        manager: {
          select: { name: true, email: true },
        },
      },
    })
    res.json(projects)
  } catch (error) {
    console.error('Error fetching portfolio:', error)
    res.status(500).json({ error: 'Server error fetching portfolio data' })
  }
}

export const getFinancialStats = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({ select: { budget: true } })
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0)

    const expenses = await prisma.expense.findMany({
      include: {
        project: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
    })

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)

    const categories = { LABOUR: 0, MATERIAL: 0, EQUIPMENT: 0, OTHER: 0 }
    expenses.forEach(e => {
      const cat = e.category as string
      if (cat === 'LABOUR' || cat === 'MATERIAL' || cat === 'EQUIPMENT') {
        categories[cat as keyof typeof categories] += e.amount
      } else {
        categories.OTHER += e.amount
      }
    })

    const categoryData = Object.keys(categories).map(cat => ({
      category: cat,
      amount: categories[cat as keyof typeof categories],
    }))

    res.json({
      totalBudget,
      totalSpent,
      budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
      categoryData,
      recentExpenses: expenses.slice(0, 10),
    })
  } catch (error) {
    console.error('Error fetching financial stats:', error)
    res.status(500).json({ error: 'Server error fetching financial stats' })
  }
}

export const getWorkforceOverview = async (req: Request, res: Response) => {
  try {
    const activeWorkers = await prisma.worker.findMany({
      where: { active: true },
    })

    const totalWorkers = activeWorkers.length
    const totalDailyWageLiability = activeWorkers.reduce((sum, w) => sum + w.dailyWage, 0)
    const averageDailyWage = totalWorkers > 0 ? totalDailyWageLiability / totalWorkers : 0

    const tradeCounts: Record<string, number> = {}
    activeWorkers.forEach(w => {
      tradeCounts[w.trade] = (tradeCounts[w.trade] || 0) + 1
    })

    const tradeData = Object.keys(tradeCounts).map(trade => ({
      trade,
      count: tradeCounts[trade],
    }))

    res.json({
      totalWorkers,
      totalDailyWageLiability,
      averageDailyWage,
      tradeData,
      workers: activeWorkers,
    })
  } catch (error) {
    console.error('Error fetching workforce overview:', error)
    res.status(500).json({ error: 'Server error fetching workforce overview' })
  }
}
