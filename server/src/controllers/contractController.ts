import { Request, Response } from 'express'
import prisma from '../config/database'
import { ContractStatus, ContractType, PaymentPercentage } from '@prisma/client'

export const getContracts = async (req: Request, res: Response) => {
  try {
    const { projectId, status } = req.query

    const whereClause: any = {}
    if (projectId) {
      whereClause.projectId = projectId as string
    }
    if (status) {
      whereClause.status = status as ContractStatus
    }

    const contracts = await prisma.contract.findMany({
      where: whereClause,
      include: {
        project: { select: { name: true } },
        subcontractor: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(contracts)
  } catch (error) {
    console.error('Error fetching contracts:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getContractById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        project: { select: { name: true } },
        subcontractor: { select: { name: true } },
        payments: {
          orderBy: { dueDate: 'asc' },
        },
        changeOrders: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' })
    }

    const totalReceived = contract.payments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0)

    const totalOutstanding = contract.value - totalReceived

    res.json({
      ...contract,
      totalReceived,
      totalOutstanding,
    })
  } catch (error) {
    console.error('Error fetching contract details:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const createContract = async (req: Request, res: Response) => {
  try {
    const {
      projectId,
      type,
      clientName,
      subcontractorId,
      value,
      startDate,
      endDate,
      paymentTerms,
      scope,
      documentUrl,
    } = req.body

    if (!projectId || !clientName || value === undefined || !startDate || !endDate) {
      return res.status(400).json({ error: 'projectId, clientName, value, startDate, and endDate are required' })
    }

    const valNum = parseFloat(value)
    if (isNaN(valNum) || valNum <= 0) {
      return res.status(400).json({ error: 'Contract value must be a positive number' })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    if (start >= end) {
      return res.status(400).json({ error: 'Start date must be before end date' })
    }

    // One main contract per project check
    if (type === 'MAIN') {
      const existingMain = await prisma.contract.findFirst({
        where: {
          projectId,
          type: 'MAIN',
          status: { in: ['ACTIVE', 'COMPLETED'] },
        },
      })
      if (existingMain) {
        return res.status(400).json({ error: 'An active MAIN contract already exists for this project site.' })
      }
    }

    const durationMs = end.getTime() - start.getTime()
    const getMilestoneDueDate = (fraction: number) => {
      return new Date(start.getTime() + durationMs * fraction)
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Contract
      const contract = await tx.contract.create({
        data: {
          projectId,
          type: (type as ContractType) || 'MAIN',
          clientName,
          subcontractorId: subcontractorId || null,
          value: valNum,
          startDate: start,
          endDate: end,
          paymentTerms: paymentTerms || null,
          scope: scope || null,
          documentUrl: documentUrl || null,
          status: 'ACTIVE',
        },
      })

      // 2. Auto-create 4 standard payment schedule milestones
      const milestones = [
        { percentage: 'FOUNDATION_25' as PaymentPercentage, fraction: 0.25, pct: 0.25 },
        { percentage: 'STRUCTURE_35' as PaymentPercentage, fraction: 0.50, pct: 0.35 },
        { percentage: 'ROOFING_25' as PaymentPercentage, fraction: 0.75, pct: 0.25 },
        { percentage: 'HANDOVER_15' as PaymentPercentage, fraction: 1.00, pct: 0.15 },
      ]

      for (const m of milestones) {
        await tx.payment.create({
          data: {
            projectId,
            contractId: contract.id,
            contractValue: valNum,
            percentage: m.percentage,
            amount: valNum * m.pct,
            status: 'PENDING',
            dueDate: getMilestoneDueDate(m.fraction),
          },
        })
      }

      return contract
    })

    res.status(201).json(result)
  } catch (error) {
    console.error('Error creating contract:', error)
    res.status(500).json({ error: 'Server error' })
  }
}
