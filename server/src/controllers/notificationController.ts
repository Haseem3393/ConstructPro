import { Request, Response } from 'express'
import prisma from '../config/database'

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const user = req.user

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: user?.id },
          { userId: null }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    const unreadCount = await prisma.notification.count({
      where: {
        read: false,
        OR: [
          { userId: user?.id },
          { userId: null }
        ]
      }
    })

    res.json({ notifications, unreadCount })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const markAllNotificationsRead = async (req: Request, res: Response) => {
  try {
    const user = req.user

    await prisma.notification.updateMany({
      where: {
        read: false,
        OR: [
          { userId: user?.id },
          { userId: null }
        ]
      },
      data: { read: true }
    })

    res.json({ message: 'All notifications marked as read' })
  } catch (error) {
    console.error('Error marking notifications read:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    await prisma.notification.update({
      where: { id },
      data: { read: true }
    })

    res.json({ message: 'Notification marked as read' })
  } catch (error) {
    console.error('Error marking notification read:', error)
    res.status(500).json({ error: 'Server error' })
  }
}
