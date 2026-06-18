import { Request, Response, NextFunction } from 'express'
import { verifyToken, JWTPayload } from '../utils/jwt'
import prisma from '../config/database'

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload & { id: string }
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const decoded = verifyToken(token)
    
    // Get full user details from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    req.user = { ...decoded, id: user.id }
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Not authorized to access this resource',
        requiredRoles: roles,
        userRole: req.user.role
      })
    }

    next()
  }
}
