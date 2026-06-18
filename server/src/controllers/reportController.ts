import { Request, Response } from 'express'
import prisma from '../config/database'

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
        spentByCategory[e.category] += e.amount
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
