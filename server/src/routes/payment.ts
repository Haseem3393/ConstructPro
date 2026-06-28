import { Router } from 'express'
import { getPayments, getPaymentById, markPaymentPaid } from '../controllers/paymentController'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, getPayments)
router.get('/:id', authenticate, getPaymentById)
router.put('/:id/pay', authenticate, authorize('ADMIN'), markPaymentPaid)

export default router
