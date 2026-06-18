import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../config/database'
import { generateToken, JWTPayload } from '../utils/jwt'

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate JWT token
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }
    const token = generateToken(payload)

    // Determine redirect based on role
    let redirectPath = '/dashboard'
    switch (user.role) {
      case 'ADMIN':
        redirectPath = '/dashboard'
        break
      case 'PROJECT_MANAGER':
        redirectPath = '/projects'
        break
      case 'SUPERVISOR':
        redirectPath = '/attendance'
        break
      case 'CLIENT':
        redirectPath = '/portal'
        break
    }

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      redirect: redirectPath,
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Server error during login' })
  }
}

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Get current user error:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      return res.status(404).json({ error: 'User with this email does not exist' })
    }

    // Generate token
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const expiry = new Date(Date.now() + 3600000) // 1 hour

    const currentPermissions = (user.permissions as any) || {}
    await prisma.user.update({
      where: { id: user.id },
      data: {
        permissions: {
          ...currentPermissions,
          resetToken: token,
          resetTokenExpiry: expiry.toISOString(),
        },
      },
    })

    console.log(`🔑 Password Reset Token for ${user.email}: ${token}`)
    console.log(`🔗 Reset Link: http://localhost:5173/reset-password?token=${token}`)

    res.json({ 
      message: 'Password reset link generated. Check server logs for the link!',
      token 
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' })
    }

    // Find user with this reset token
    const user = await prisma.user.findFirst({
      where: {
        permissions: {
          path: ['resetToken'],
          equals: token,
        },
      },
    })

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' })
    }

    const permissions = (user.permissions as any) || {}
    const expiryStr = permissions.resetTokenExpiry
    if (!expiryStr || new Date(expiryStr) < new Date()) {
      return res.status(400).json({ error: 'Reset token has expired' })
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Clear reset token fields
    const updatedPermissions = { ...permissions }
    delete updatedPermissions.resetToken
    delete updatedPermissions.resetTokenExpiry

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        permissions: updatedPermissions,
      },
    })

    res.json({ message: 'Password has been reset successfully' })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ error: 'Server error' })
  }
}
