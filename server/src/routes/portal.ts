import { Router } from 'express'
import {
  getClientPortalData,
  getClientPortalProgress,
  getClientPortalPayments,
  getClientPortalDocuments,
} from '../controllers/portalController'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

// All routes here are restricted to CLIENT role
router.get('/project', authenticate, authorize('CLIENT'), getClientPortalData)
router.get('/progress', authenticate, authorize('CLIENT'), getClientPortalProgress)
router.get('/payments', authenticate, authorize('CLIENT'), getClientPortalPayments)
router.get('/documents', authenticate, authorize('CLIENT'), getClientPortalDocuments)

export default router
