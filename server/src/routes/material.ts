import { Router } from 'express'
import { getMaterials, getMaterialById } from '../controllers/materialController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, getMaterials)
router.get('/:id', authenticate, getMaterialById)

export default router
