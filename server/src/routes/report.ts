import { Router } from 'express'
import { getFinancialReport, getLabourReport, getInventoryReport } from '../controllers/reportController'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

// All reports are restricted to ADMIN and PROJECT_MANAGER
router.get('/financial', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), getFinancialReport)
router.get('/labour', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), getLabourReport)
router.get('/inventory', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), getInventoryReport)

export default router
