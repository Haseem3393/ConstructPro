import { Router } from 'express'
import {
  getMachineries,
  getMachineryById,
  createMachinery,
  logUsage,
  logMaintenance,
  updateStatus
} from '../controllers/machineryController'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, getMachineries)
router.get('/:id', authenticate, getMachineryById)
router.post('/', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), createMachinery)
router.post('/:id/usage', authenticate, authorize('ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'), logUsage)
router.post('/:id/maintenance', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), logMaintenance)
router.put('/:id/status', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), updateStatus)

export default router
