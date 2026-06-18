import { Router } from 'express'
import { getClientPortalData } from '../controllers/portalController'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

router.get('/project', authenticate, authorize('CLIENT'), getClientPortalData)

export default router
