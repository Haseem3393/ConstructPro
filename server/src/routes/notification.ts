import { Router } from 'express'
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../controllers/notificationController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, getNotifications)
router.put('/read-all', authenticate, markAllNotificationsRead)
router.put('/:id/read', authenticate, markNotificationRead)

export default router
