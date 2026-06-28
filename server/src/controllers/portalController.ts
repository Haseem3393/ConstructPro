import { Request, Response } from 'express'
import prisma from '../config/database'

// Helper to get client project context
const getClientProject = async (clientId: string) => {
  return await prisma.project.findFirst({
    where: { clientId },
    include: {
      milestones: { orderBy: { dueDate: 'asc' } },
      payments: {
        include: { milestone: { select: { name: true } } },
        orderBy: { dueDate: 'asc' }
      }
    }
  })
}

export const getClientPortalData = async (req: Request, res: Response) => {
  try {
    const user = req.user

    if (!user || user.role !== 'CLIENT') {
      return res.status(403).json({ error: 'Access denied. Client role required.' })
    }

    const project = await getClientProject(user.id)
    if (!project) {
      return res.status(404).json({ error: 'No project found for this client.' })
    }

    // Milestones status
    const milestonesCompleted = project.milestones.filter(m => m.completed).length
    const milestonesTotal = project.milestones.length

    // Payments made
    const paymentsMade = project.payments.filter(p => p.status === 'PAID').length
    const paymentsTotal = project.payments.length

    // Days remaining
    const today = new Date()
    const endDate = new Date(project.endDate)
    const timeDiff = endDate.getTime() - today.getTime()
    const daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)))

    res.json({
      clientName: user.name,
      project: {
        id: project.id,
        name: project.name,
        location: project.location,
        description: project.description,
        progress: project.progress,
        status: project.status,
        endDate: project.endDate,
        expectedCompletion: project.endDate,
      },
      stats: {
        milestonesCompleted,
        milestonesTotal,
        paymentsMade,
        paymentsTotal,
        daysRemaining
      }
    })
  } catch (error) {
    console.error('Error fetching client portal data:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getClientPortalProgress = async (req: Request, res: Response) => {
  try {
    const user = req.user
    if (!user || user.role !== 'CLIENT') {
      return res.status(403).json({ error: 'Access denied. Client role required.' })
    }

    const project = await getClientProject(user.id)
    if (!project) {
      return res.status(404).json({ error: 'No project found for this client.' })
    }

    const milestones = project.milestones.map(m => ({
      id: m.id,
      title: m.name,
      expectedDate: m.dueDate,
      completed: m.completed
    }))

    // Seed/mock site photos and daily log summaries as requested by prompt
    const mockPhotos = [
      { id: '1', title: 'Foundation Excavation Complete', url: '/mock-photos/foundation.jpg', date: new Date(Date.now() - 3600000 * 24 * 10).toISOString() },
      { id: '2', title: 'Column Concrete Pouring', url: '/mock-photos/columns.jpg', date: new Date(Date.now() - 3600000 * 24 * 3).toISOString() }
    ]

    const mockDailyLogs = [
      { id: '1', date: new Date(Date.now() - 3600000 * 2).toISOString(), summary: 'Bricklaying commenced on ground level walls. Structural columns passed inspection.' },
      { id: '2', date: new Date(Date.now() - 3600000 * 24).toISOString(), summary: 'Formwork completed for first floor beam layout. Concrete batching plant inspected.' }
    ]

    res.json({
      progress: project.progress,
      milestones,
      photos: mockPhotos,
      dailyLogs: mockDailyLogs
    })
  } catch (error) {
    console.error('Error fetching client portal progress:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getClientPortalPayments = async (req: Request, res: Response) => {
  try {
    const user = req.user
    if (!user || user.role !== 'CLIENT') {
      return res.status(403).json({ error: 'Access denied. Client role required.' })
    }

    const project = await getClientProject(user.id)
    if (!project) {
      return res.status(404).json({ error: 'No project found for this client.' })
    }

    const contractValue = project.budget
    const totalPaid = project.payments
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0)
    
    const outstandingBalance = Math.max(0, contractValue - totalPaid)

    const paymentSchedule = project.payments.map(p => ({
      id: p.id,
      milestone: p.milestone?.name || 'Payment Stage',
      amount: p.amount,
      status: p.status,
      dueDate: p.dueDate,
      paidDate: p.paidDate
    }))

    res.json({
      contractValue,
      totalPaid,
      outstandingBalance,
      paymentSchedule
    })
  } catch (error) {
    console.error('Error fetching client portal payments:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getClientPortalDocuments = async (req: Request, res: Response) => {
  try {
    const user = req.user
    if (!user || user.role !== 'CLIENT') {
      return res.status(403).json({ error: 'Access denied. Client role required.' })
    }

    const project = await prisma.project.findFirst({
      where: { clientId: user.id },
    })

    if (!project) {
      return res.status(404).json({ error: 'No project found for this client.' })
    }

    // Query Document table for shared ones
    let documents = await prisma.document.findMany({
      where: {
        projectId: project.id,
        sharedWithClient: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Seed dummy documents if empty for demo
    if (documents.length === 0) {
      const initialSeed = [
        {
          name: 'Ground Level Architectural Plan',
          type: 'PDF',
          url: '/files/ground_plan.pdf',
          sharedWithClient: true,
          projectId: project.id
        },
        {
          name: 'Main Structural Contract Binder',
          type: 'Contract',
          url: '/files/contract_binder.pdf',
          sharedWithClient: true,
          projectId: project.id
        }
      ]

      await prisma.document.createMany({
        data: initialSeed
      })

      documents = await prisma.document.findMany({
        where: {
          projectId: project.id,
          sharedWithClient: true
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    res.json(documents)
  } catch (error) {
    console.error('Error fetching client portal documents:', error)
    res.status(500).json({ error: 'Server error' })
  }
}
