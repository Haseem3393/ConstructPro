import prisma from '../config/database'

export const logAudit = async (
  userId: string | undefined | null,
  userName: string,
  action: string,
  module: string,
  details: string
) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        userName: userName || 'System',
        action,
        module,
        details,
      },
    })
  } catch (error) {
    console.error('Failed to log audit activity:', error)
  }
}
