import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../config/database'

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { role, search } = req.query

    let whereClause: any = {}

    if (role) {
      whereClause.role = role
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ]
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: 'asc' },
    })

    res.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, phone } = req.body

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Required fields: name, email, password, role' })
    }

    // Check duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Store phone and active status inside permissions metadata JSON
    const permissionsJson = {
      phone: phone || '',
      active: true,
      modules: {
        projects: { view: true, edit: role !== 'CLIENT', delete: role === 'ADMIN' },
        finance: { view: role === 'ADMIN' || role === 'PROJECT_MANAGER', edit: role === 'ADMIN' },
        reports: { view: role !== 'CLIENT' },
      }
    }

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        permissions: permissionsJson,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
        createdAt: true,
      },
    })

    res.status(201).json(user)
  } catch (error) {
    console.error('Error creating user:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
        createdAt: true,
        updatedAt: true,
        managedProjects: {
          select: { id: true, name: true, location: true, status: true },
        },
        clientProjects: {
          select: { id: true, name: true, location: true, status: true },
        },
        assignedProjects: {
          include: {
            project: {
              select: { id: true, name: true, location: true, status: true },
            },
          },
        },
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, role, phone, active } = req.body

    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Merge metadata in permissions JSON
    const currentPermissions = (existingUser.permissions as any) || {}
    const updatedPermissions = {
      ...currentPermissions,
      phone: phone !== undefined ? phone : currentPermissions.phone || '',
      active: active !== undefined ? active : (currentPermissions.active !== undefined ? currentPermissions.active : true),
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        role,
        permissions: updatedPermissions,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
      },
    })

    res.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const updatePermissions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { modules } = req.body

    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    const currentPermissions = (existingUser.permissions as any) || {}
    const updatedPermissions = {
      ...currentPermissions,
      modules: modules || currentPermissions.modules || {},
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        permissions: updatedPermissions,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
      },
    })

    res.json(user)
  } catch (error) {
    console.error('Error updating permissions:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const { name, phone } = req.body

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    const currentPermissions = (existingUser.permissions as any) || {}
    const updatedPermissions = {
      ...currentPermissions,
      phone: phone !== undefined ? phone : currentPermissions.phone || '',
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        permissions: updatedPermissions,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
      },
    })

    res.json(user)
  } catch (error) {
    console.error('Error updating profile:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const { currentPassword, newPassword } = req.body

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Incorrect current password' })
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    res.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Error changing password:', error)
    res.status(500).json({ error: 'Server error' })
  }
}
