import { Request, Response } from 'express'
import prisma from '../config/database'

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const { userId, moduleName, startDate, endDate, search } = req.query

    const whereClause: any = {}

    if (userId) {
      whereClause.userId = userId as string
    }

    if (moduleName) {
      whereClause.module = moduleName as string
    }

    if (startDate || endDate) {
      whereClause.timestamp = {}
      if (startDate) {
        whereClause.timestamp.gte = new Date(startDate as string)
      }
      if (endDate) {
        whereClause.timestamp.lte = new Date(endDate as string)
      }
    }

    if (search) {
      whereClause.OR = [
        { userName: { contains: search as string, mode: 'insensitive' } },
        { details: { contains: search as string, mode: 'insensitive' } },
        { action: { contains: search as string, mode: 'insensitive' } },
      ]
    }

    const logs = await prisma.auditLog.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      take: 200, // limit to last 200 logs to prevent memory pressure
    })

    res.json(logs)
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    res.status(500).json({ error: 'Server error' })
  }
}
