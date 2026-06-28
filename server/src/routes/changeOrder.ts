import { Router } from 'express'
import {
  getChangeOrders,
  createChangeOrder,
  approveChangeOrder,
  rejectChangeOrder
} from '../controllers/changeOrderController'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, getChangeOrders)
router.post('/', authenticate, createChangeOrder)
router.put('/:id/approve', authenticate, authorize('ADMIN'), approveChangeOrder)
router.put('/:id/reject', authenticate, authorize('ADMIN'), rejectChangeOrder)

export default router
