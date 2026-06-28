import { Request, Response } from 'express'
import prisma from '../config/database'
import { ChangeOrderStatus } from '@prisma/client'
import { logAudit } from '../utils/audit'

export const getChangeOrders = async (req: Request, res: Response) => {
  try {
    const { projectId, status } = req.query

    const whereClause: any = {}
    if (projectId) {
      whereClause.projectId = projectId as string
    }
    if (status) {
      whereClause.status = status as ChangeOrderStatus
    }

    const changeOrders = await prisma.changeOrder.findMany({
      where: whereClause,
      include: {
        project: { select: { name: true } },
        contract: { select: { id: true, clientName: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(changeOrders)
  } catch (error) {
    console.error('Error fetching change orders:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const createChangeOrder = async (req: Request, res: Response) => {
  try {
    const { projectId, contractId, description, reason, costImpact, timeImpact, requestedBy } = req.body

    if (!projectId || !contractId || !description || costImpact === undefined || timeImpact === undefined || !requestedBy) {
      return res.status(400).json({ error: 'projectId, contractId, description, costImpact, timeImpact, and requestedBy are required' })
    }

    const costVal = parseFloat(costImpact)
    const timeVal = parseInt(timeImpact, 10)

    if (isNaN(costVal)) {
      return res.status(400).json({ error: 'Cost impact must be a number' })
    }
    if (isNaN(timeVal)) {
      return res.status(400).json({ error: 'Time impact must be an integer' })
    }

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
    })
    if (!contract || contract.projectId !== projectId) {
      return res.status(404).json({ error: 'Contract not found in this project context' })
    }

    const changeOrder = await prisma.changeOrder.create({
      data: {
        projectId,
        contractId,
        description,
        reason: reason || null,
        costImpact: costVal,
        timeImpact: timeVal,
        requestedBy,
        status: 'PENDING',
      },
    })

    await logAudit(req.user?.id, req.user?.name || 'System', 'CREATE', 'ChangeOrder', `Created change order: ${changeOrder.description} with cost impact: ${costVal} and time impact: ${timeVal}`)

    res.status(201).json(changeOrder)
  } catch (error) {
    console.error('Error creating change order:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const approveChangeOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const changeOrder = await prisma.changeOrder.findUnique({
      where: { id },
    })

    if (!changeOrder) {
      return res.status(404).json({ error: 'Change order not found' })
    }

    if (changeOrder.status !== 'PENDING') {
      return res.status(400).json({ error: 'Change order has already been processed' })
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Approve Change Order
      const approved = await tx.changeOrder.update({
        where: { id },
        data: { status: 'APPROVED' },
      })

      // 2. Fetch linked contract
      const contract = await tx.contract.findUnique({
        where: { id: approved.contractId },
      })

      if (contract) {
        await tx.contract.update({
          where: { id: contract.id },
          data: {
            value: { increment: approved.costImpact },
          },
        })
      }

      // 3. Fetch linked project
      const project = await tx.project.findUnique({
        where: { id: approved.projectId },
      })

      if (project) {
        const currentEndDate = new Date(project.endDate)
        const extendedEndDate = new Date(currentEndDate.getTime() + approved.timeImpact * 24 * 60 * 60 * 1000)

        await tx.project.update({
          where: { id: project.id },
          data: {
            budget: { increment: approved.costImpact },
            endDate: extendedEndDate,
          },
        })
      }

      return approved
    })

    await logAudit(req.user?.id, req.user?.name || 'System', 'UPDATE', 'ChangeOrder', `Approved change order ID: ${id} (increased budget by ${result.costImpact})`)

    res.json(result)
  } catch (error) {
    console.error('Error approving change order:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const rejectChangeOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const changeOrder = await prisma.changeOrder.findUnique({
      where: { id },
    })

    if (!changeOrder) {
      return res.status(404).json({ error: 'Change order not found' })
    }

    if (changeOrder.status !== 'PENDING') {
      return res.status(400).json({ error: 'Change order has already been processed' })
    }

    const rejected = await prisma.changeOrder.update({
      where: { id },
      data: { status: 'REJECTED' },
    })

    await logAudit(req.user?.id, req.user?.name || 'System', 'UPDATE', 'ChangeOrder', `Rejected change order ID: ${id}`)

    res.json(rejected)
  } catch (error) {
    console.error('Error rejecting change order:', error)
    res.status(500).json({ error: 'Server error' })
  }
}
