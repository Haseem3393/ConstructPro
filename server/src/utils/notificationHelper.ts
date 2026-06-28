import prisma from '../config/database'

export const createNotification = async (
  type: 'BUDGET_EXCEEDED' | 'BUDGET_WARNING' | 'TASK_OVERDUE' | 'LOW_STOCK' | 'MILESTONE_COMPLETED' | 'PAYMENT_DUE',
  message: string,
  userId?: string | null
) => {
  try {
    await prisma.notification.create({
      data: {
        type,
        message,
        read: false,
        userId: userId || null,
      },
    })
  } catch (error) {
    console.error('Failed to create system notification:', error)
  }
}
