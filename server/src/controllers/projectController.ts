import { Request, Response } from 'express'
import prisma from '../config/database'
import { logAudit } from '../utils/audit'

export const getProjects = async (req: Request, res: Response) => {
  try {
    const user = req.user
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    let whereClause = {}

    if (user.role === 'PROJECT_MANAGER') {
      whereClause = { managerId: user.id }
    } else if (user.role === 'SUPERVISOR') {
      whereClause = {
        members: {
          some: {
            userId: user.id,
          },
        },
      }
    } else if (user.role === 'CLIENT') {
      whereClause = { clientId: user.id }
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        manager: {
          select: { id: true, name: true, email: true },
        },
        client: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const user = req.user
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        manager: {
          select: { id: true, name: true, email: true },
        },
        client: {
          select: { id: true, name: true, email: true },
        },
        tasks: {
          orderBy: { dueDate: 'asc' },
        },
        milestones: {
          orderBy: { dueDate: 'asc' },
        },
        expenses: {
          orderBy: { date: 'desc' },
        },
        payments: {
          orderBy: { createdAt: 'asc' },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
      },
    })

    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    // Check authorization/access control
    if (user.role === 'PROJECT_MANAGER' && project.managerId !== user.id) {
      return res.status(403).json({ error: 'Access denied' })
    }
    if (user.role === 'CLIENT' && project.clientId !== user.id) {
      return res.status(403).json({ error: 'Access denied' })
    }
    if (user.role === 'SUPERVISOR') {
      const isMember = project.members.some((m) => m.userId === user.id)
      if (!isMember) {
        return res.status(403).json({ error: 'Access denied' })
      }
    }

    res.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, location, description, budget, startDate, endDate, managerId, clientId } = req.body

    if (!name || !location || !budget || !startDate || !endDate) {
      return res.status(400).json({ error: 'Required fields: name, location, budget, startDate, endDate' })
    }

    const project = await prisma.project.create({
      data: {
        name,
        location,
        description,
        budget: parseFloat(budget),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        managerId: managerId || null,
        clientId: clientId || null,
      },
    })

    await logAudit(req.user?.id, req.user?.name || 'System', 'CREATE', 'Project', `Created project: ${project.name}`)

    res.status(201).json(project)
  } catch (error) {
    console.error('Error creating project:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, location, description, budget, startDate, endDate, status, progress, managerId, clientId } = req.body

    const project = await prisma.project.update({
      where: { id },
      data: {
        name,
        location,
        description,
        budget: budget ? parseFloat(budget) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status,
        progress: progress ? parseFloat(progress) : undefined,
        managerId,
        clientId,
      },
    })

    await logAudit(req.user?.id, req.user?.name || 'System', 'UPDATE', 'Project', `Updated project: ${project.name}`)

    res.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    await prisma.project.delete({
      where: { id },
    })

    await logAudit(req.user?.id, req.user?.name || 'System', 'DELETE', 'Project', `Deleted project with ID: ${id}`)

    res.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Error deleting project:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const createMilestone = async (req: Request, res: Response) => {
  try {
    const { id } = req.params // projectId
    const { name, description, dueDate } = req.body
    if (!name || !dueDate) {
      return res.status(400).json({ error: 'Name and due date are required' })
    }
    const milestone = await prisma.milestone.create({
      data: {
        name,
        description,
        dueDate: new Date(dueDate),
        projectId: id,
      },
    })
    await logAudit(req.user?.id, req.user?.name || 'System', 'CREATE', 'Milestone', `Created milestone: ${milestone.name} for project ID: ${id}`)
    res.status(201).json(milestone)
  } catch (error) {
    console.error('Error creating milestone:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const createMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params // projectId
    const { userId, role } = req.body
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }
    const member = await prisma.projectMember.create({
      data: {
        projectId: id,
        userId,
        role,
      },
    })
    await logAudit(req.user?.id, req.user?.name || 'System', 'CREATE', 'ProjectMember', `Added member: ${member.userId} to project ID: ${id}`)
    res.status(201).json(member)
  } catch (error) {
    console.error('Error adding project member:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const createExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params // projectId
    const { amount, category, description, date } = req.body
    const userId = req.user?.id
    if (!amount || !category || !date) {
      return res.status(400).json({ error: 'Amount, category, and date are required' })
    }
    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        category,
        description,
        date: new Date(date),
        projectId: id,
        createdById: userId || null,
      },
    })
    await logAudit(req.user?.id, req.user?.name || 'System', 'CREATE', 'Expense', `Created expense: ${expense.amount} under ${expense.category} for project ID: ${id}`)
    res.status(201).json(expense)
  } catch (error) {
    console.error('Error creating project expense:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getProjectPayments = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id

    const payments = await prisma.payment.findMany({
      where: { projectId },
      include: {
        milestone: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    res.json(payments)
  } catch (error) {
    console.error('Error fetching project payments:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { id, paymentId } = req.params
    const { status } = req.body

    if (!['PENDING', 'DUE', 'PAID'].includes(status)) {
      return res.status(400).json({ error: 'Invalid payment status value' })
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { id: paymentId },
    })

    if (!existingPayment || existingPayment.projectId !== id) {
      return res.status(404).json({ error: 'Payment record not found for this project' })
    }

    const paidDate = status === 'PAID' ? new Date() : null

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        paidDate,
      },
    })

    await logAudit(req.user?.id, req.user?.name || 'System', 'UPDATE', 'Payment', `Updated payment ${paymentId} status to ${status} for project ID: ${id}`)

    res.json(updatedPayment)
  } catch (error) {
    console.error('Error updating payment status:', error)
    res.status(500).json({ error: 'Server error' })
  }
}
