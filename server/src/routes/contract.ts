import { Router } from 'express'
import { getContracts, getContractById, createContract } from '../controllers/contractController'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, getContracts)
router.get('/:id', authenticate, getContractById)
router.post('/', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), createContract)

export default router
