import { Router } from 'express'
import { getAuditLogs } from '../controllers/auditLogController'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, authorize('ADMIN'), getAuditLogs)

export default router
