import { Router } from 'express'
import { getSuppliers, getSupplierById, createSupplier } from '../controllers/supplierController'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, getSuppliers)
router.get('/:id', authenticate, getSupplierById)
router.post('/', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), createSupplier)

export default router
