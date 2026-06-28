import { Request, Response } from 'express'
import prisma from '../config/database'
import { PaymentStatus } from '@prisma/client'
import { logAudit } from '../utils/audit'

export const getPayments = async (req: Request, res: Response) => {
  try {
    const { projectId, status } = req.query

    const whereClause: any = {}
    if (projectId) {
      whereClause.projectId = projectId as string
    }
    if (status) {
      whereClause.status = status as PaymentStatus
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        project: { select: { name: true } },
        contract: { select: { id: true, clientName: true, value: true, type: true } },
      },
      orderBy: { dueDate: 'asc' },
    })

    // Total due amount = sum of PENDING or DUE payments
    const dueList = await prisma.payment.findMany({
      where: {
        status: { in: ['PENDING', 'DUE'] },
      },
    })
    const totalDue = dueList.reduce((sum, p) => sum + p.amount, 0)

    res.json({ payments, totalDue })
  } catch (error) {
    console.error('Error fetching payments:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        project: { select: { name: true } },
        contract: true,
        cheque: { select: { id: true, chequeNo: true, bank: true } },
        paidBy: { select: { name: true } },
      },
    })

    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found' })
    }

    res.json(payment)
  } catch (error) {
    console.error('Error fetching payment details:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const markPaymentPaid = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { method, chequeId, receiptUrl } = req.body
    const user = req.user

    if (!method) {
      return res.status(400).json({ error: 'Payment method is required' })
    }

    const payment = await prisma.payment.findUnique({
      where: { id },
    })

    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found' })
    }

    if (payment.status === 'PAID') {
      return res.status(400).json({ error: 'Payment milestone is already paid' })
    }

    // Verify linked cheque if method is CHEQUE
    if (method === 'Cheque' && chequeId) {
      const cheque = await prisma.cheque.findUnique({
        where: { id: chequeId },
      })
      if (!cheque) {
        return res.status(400).json({ error: 'Linked cheque not found' })
      }
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: {
        status: 'PAID',
        paidDate: new Date(),
        paidAt: new Date(),
        paidById: user?.id || null,
        method,
        chequeId: method === 'Cheque' ? chequeId || null : null,
        receiptUrl: receiptUrl || null,
      },
    })

    await logAudit(user?.id, user?.name || 'System', 'UPDATE', 'Payment', `Marked payment ID ${id} of amount ${updated.amount} as PAID via ${method}`)

    res.json(updated)
  } catch (error) {
    console.error('Error marking payment as paid:', error)
    res.status(500).json({ error: 'Server error' })
  }
}
