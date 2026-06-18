import { Request, Response } from 'express'
import prisma from '../config/database'

export const getClientPortalData = async (req: Request, res: Response) => {
  try {
    const user = req.user

    if (!user || user.role !== 'CLIENT') {
      return res.status(403).json({ error: 'Access denied. Client role required.' })
    }

    // Find the first project assigned to this client
    const project = await prisma.project.findFirst({
      where: { clientId: user.id },
      include: {
        milestones: {
          orderBy: { dueDate: 'asc' },
        },
        payments: {
          include: {
            milestone: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!project) {
      return res.status(404).json({ error: 'No project found for this client.' })
    }

    // Format milestones for response
    const formattedMilestones = project.milestones.map((m) => {
      // Map completion state to status string
      let status = 'PENDING'
      if (m.completed) {
        status = 'COMPLETED'
      } else if (new Date(m.dueDate) < new Date() && !m.completed) {
        status = 'OVERDUE'
      }
      
      // Let's determine percentage of contract. We can match milestone to payments
      const matchingPayment = project.payments.find((p) => p.milestoneId === m.id)
      let percentage = 0
      if (matchingPayment) {
        switch (matchingPayment.percentage) {
          case 'FOUNDATION_25': percentage = 25; break
          case 'STRUCTURE_35': percentage = 35; break
          case 'ROOFING_25': percentage = 25; break
          case 'HANDOVER_15': percentage = 15; break
        }
      }

      return {
        id: m.id,
        name: m.name,
        description: m.description,
        percentage,
        status,
        dueDate: m.dueDate,
      }
    })

    // Format payments for response
    const formattedPayments = project.payments.map((p) => {
      let percentage = 0
      switch (p.percentage) {
        case 'FOUNDATION_25': percentage = 25; break
        case 'STRUCTURE_35': percentage = 35; break
        case 'ROOFING_25': percentage = 25; break
        case 'HANDOVER_15': percentage = 15; break
      }

      return {
        id: p.id,
        milestone: p.milestone?.name || 'Payment Milestone',
        amount: p.amount,
        percentage,
        status: p.status,
        dueDate: p.dueDate,
        paidDate: p.paidDate,
      }
    })

    res.json({
      project: {
        id: project.id,
        name: project.name,
        location: project.location,
        description: project.description,
        progress: project.progress,
        contractValue: project.budget,
        startDate: project.startDate,
        expectedCompletion: project.endDate,
      },
      milestones: formattedMilestones,
      payments: formattedPayments,
    })
  } catch (error) {
    console.error('Error fetching client portal data:', error)
    res.status(500).json({ error: 'Server error' })
  }
}
