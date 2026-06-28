import { Request, Response } from 'express'
import prisma from '../config/database'
import { ExpenseCategory, PayableStatus, ChequeStatus } from '@prisma/client'
import { logAudit } from '../utils/audit'

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const { projectId, category, startDate, endDate } = req.query

    const whereClause: any = {}

    if (projectId) {
      whereClause.projectId = projectId as string
    }

    if (category) {
      whereClause.category = category as ExpenseCategory
    }

    if (startDate || endDate) {
      whereClause.date = {}
      if (startDate) {
        whereClause.date.gte = new Date(startDate as string)
      }
      if (endDate) {
        whereClause.date.lte = new Date(endDate as string)
      }
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      include: {
        project: { select: { name: true } },
        createdBy: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
    })

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0)

    res.json({ expenses, totalAmount })
  } catch (error) {
    console.error('Error fetching expenses:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const createExpense = async (req: Request, res: Response) => {
  try {
    const { projectId, category, amount, date, description, reference, receiptUrl } = req.body
    const user = req.user

    if (!projectId || !category || !amount || !date) {
      return res.status(400).json({ error: 'projectId, category, amount, and date are required' })
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ error: 'Expense amount must be greater than zero' })
    }

    const expenseDate = new Date(date)
    if (expenseDate > new Date()) {
      return res.status(400).json({ error: 'Expense date cannot be in the future' })
    }

    const expense = await prisma.expense.create({
      data: {
        projectId,
        category: category as ExpenseCategory,
        amount: amountNum,
        date: expenseDate,
        description: description || null,
        reference: reference || null,
        receiptUrl: receiptUrl || null,
        createdById: user?.id || null,
        isAuto: false, // Manually entered
      },
    })

    await logAudit(user?.id, user?.name || 'System', 'CREATE', 'Expense', `Created expense: ${expense.amount} under category ${expense.category} in project ID: ${projectId}`)

    res.status(201).json(expense)
  } catch (error) {
    console.error('Error creating expense:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getBudgets = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        expenses: { select: { amount: true } },
      },
      orderBy: { name: 'asc' },
    })

    const budgetList = projects.map((p) => {
      const spent = p.expenses.reduce((sum, e) => sum + e.amount, 0)
      const remaining = p.budget - spent
      const percentUsed = p.budget > 0 ? (spent / p.budget) * 100 : 0

      let status = 'ON_TRACK'
      if (percentUsed > 100) {
        status = 'OVERSPENT'
      } else if (percentUsed >= 80) {
        status = 'CRITICAL'
      } else if (percentUsed >= 50) {
        status = 'WARNING'
      }

      return {
        id: p.id,
        name: p.name,
        budget: p.budget,
        spent,
        remaining,
        percentUsed,
        status,
      }
    })

    res.json(budgetList)
  } catch (error) {
    console.error('Error fetching budgets:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getBudgetDetails = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        expenses: {
          include: { createdBy: { select: { name: true } } },
          orderBy: { date: 'desc' },
        },
      },
    })

    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    const spent = project.expenses.reduce((sum, e) => sum + e.amount, 0)
    const remaining = project.budget - spent
    const progressPercent = project.budget > 0 ? (spent / project.budget) * 100 : 0

    // Category breakdown
    const categories: ExpenseCategory[] = ['LABOUR', 'MATERIAL', 'EQUIPMENT', 'SUBCONTRACTOR', 'TRANSPORT', 'OTHER']
    const categoryBreakdown = categories.map((cat) => {
      const amount = project.expenses
        .filter((e) => e.category === cat)
        .reduce((sum, e) => sum + e.amount, 0)
      const percent = spent > 0 ? (amount / spent) * 100 : 0

      return {
        category: cat,
        amount,
        percent,
      }
    })

    // Monthly spending trend
    // Group by Year-Month
    const monthlyGroups: { [key: string]: number } = {}
    project.expenses.forEach((e) => {
      const d = new Date(e.date)
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      monthlyGroups[yearMonth] = (monthlyGroups[yearMonth] || 0) + e.amount
    })

    const monthlyTrend = Object.keys(monthlyGroups)
      .sort()
      .map((ym) => ({
        month: ym,
        amount: monthlyGroups[ym],
      }))

    res.json({
      project: {
        id: project.id,
        name: project.name,
        budget: project.budget,
      },
      spent,
      remaining,
      progressPercent,
      categoryBreakdown,
      monthlyTrend,
    })
  } catch (error) {
    console.error('Error fetching budget details:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getPayables = async (req: Request, res: Response) => {
  try {
    const { status } = req.query

    const whereClause: any = {}
    if (status) {
      // If client requests PENDING or OVERDUE
      if (status === 'OVERDUE') {
        whereClause.status = 'PENDING'
        whereClause.dueDate = { lt: new Date() }
      } else if (status === 'PENDING') {
        whereClause.status = 'PENDING'
        whereClause.dueDate = { gte: new Date() }
      } else {
        whereClause.status = status as PayableStatus
      }
    }

    const payablesList = await prisma.payable.findMany({
      where: whereClause,
      include: {
        project: { select: { name: true } },
        supplier: { select: { name: true } },
        subcontractor: { select: { name: true } },
      },
      orderBy: { dueDate: 'asc' },
    })

    // Map payables to dynamically set OVERDUE if unpaid and past due date
    const today = new Date()
    const payables = payablesList.map((p) => {
      let currentStatus = p.status as string
      if (p.status === 'PENDING' && new Date(p.dueDate) < today) {
        currentStatus = 'OVERDUE'
      }
      return {
        ...p,
        status: currentStatus,
      }
    })

    // Outstanding total = sum of PENDING or OVERDUE (unpaid) payables
    const outstandingList = await prisma.payable.findMany({
      where: { status: 'PENDING' },
    })
    const totalOutstanding = outstandingList.reduce((sum, p) => sum + p.amount, 0)

    res.json({ payables, totalOutstanding })
  } catch (error) {
    console.error('Error fetching payables:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const createPayable = async (req: Request, res: Response) => {
  try {
    const { projectId, supplierId, subcontractorId, amount, dueDate, description, reference } = req.body

    if (!projectId || !amount || !dueDate) {
      return res.status(400).json({ error: 'projectId, amount, and dueDate are required' })
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ error: 'Payable amount must be greater than zero' })
    }

    if (!supplierId && !subcontractorId) {
      return res.status(400).json({ error: 'Payable must link to a Supplier or Subcontractor' })
    }

    const payable = await prisma.payable.create({
      data: {
        projectId,
        supplierId: supplierId || null,
        subcontractorId: subcontractorId || null,
        amount: amountNum,
        dueDate: new Date(dueDate),
        description: description || null,
        reference: reference || null,
        status: 'PENDING',
      },
    })

    await logAudit(req.user?.id, req.user?.name || 'System', 'CREATE', 'Payable', `Created payable of ${payable.amount} with due date ${dueDate} in project ID: ${projectId}`)

    res.status(201).json(payable)
  } catch (error) {
    console.error('Error creating payable:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getCheques = async (req: Request, res: Response) => {
  try {
    const { status, bank } = req.query

    const whereClause: any = {}
    if (status) {
      whereClause.status = status as ChequeStatus
    }
    if (bank) {
      whereClause.bank = bank as string
    }

    const cheques = await prisma.cheque.findMany({
      where: whereClause,
      include: {
        payable: {
          select: {
            id: true,
            reference: true,
            description: true,
          },
        },
      },
      orderBy: { issueDate: 'desc' },
    })

    res.json(cheques)
  } catch (error) {
    console.error('Error fetching cheques:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const createCheque = async (req: Request, res: Response) => {
  try {
    const { chequeNo, bank, payee, amount, issueDate, payableId, notes } = req.body

    if (!chequeNo || !bank || !payee || !amount || !issueDate) {
      return res.status(400).json({ error: 'chequeNo, bank, payee, amount, and issueDate are required' })
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ error: 'Cheque amount must be greater than zero' })
    }

    // Check unique chequeNo + bank
    const existing = await prisma.cheque.findUnique({
      where: {
        chequeNo_bank: {
          chequeNo,
          bank,
        },
      },
    })

    if (existing) {
      return res.status(400).json({ error: 'Cheque with this number and bank already registered' })
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Cheque
      const cheque = await tx.cheque.create({
        data: {
          chequeNo,
          bank,
          payee,
          amount: amountNum,
          issueDate: new Date(issueDate),
          payableId: payableId || null,
          notes: notes || null,
          status: 'ISSUED',
        },
      })

      // 2. Link & update payable status
      if (payableId) {
        await tx.payable.update({
          where: { id: payableId },
          data: { status: 'PAID' },
        })
      }

      return cheque
    })

    await logAudit(req.user?.id, req.user?.name || 'System', 'CREATE', 'Cheque', `Created cheque ${chequeNo} for bank ${bank} of amount ${amountNum}`)

    res.status(201).json(result)
  } catch (error) {
    console.error('Error creating cheque:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const updateChequeStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ error: 'Cheque status is required' })
    }

    const chequeExists = await prisma.cheque.findUnique({
      where: { id },
    })

    if (!chequeExists) {
      return res.status(404).json({ error: 'Cheque not found' })
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update Cheque Status
      const updatedCheque = await tx.cheque.update({
        where: { id },
        data: { status: status as ChequeStatus },
      })

      // If bounced, mark payable status as PENDING (unpaid) again
      if (status === 'BOUNCED' && updatedCheque.payableId) {
        await tx.payable.update({
          where: { id: updatedCheque.payableId },
          data: { status: 'PENDING' },
        })
      }

      return updatedCheque
    })

    await logAudit(req.user?.id, req.user?.name || 'System', 'UPDATE', 'Cheque', `Updated cheque status of ID ${id} to ${status}`)

    res.json(result)
  } catch (error) {
    console.error('Error updating cheque status:', error)
    res.status(500).json({ error: 'Server error' })
  }
}
