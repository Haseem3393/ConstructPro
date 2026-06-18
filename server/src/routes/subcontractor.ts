import { Router } from 'express'
import { getSubcontractors, createSubcontractor } from '../controllers/subcontractorController'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, getSubcontractors)
router.post('/', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), createSubcontractor)

export default router
