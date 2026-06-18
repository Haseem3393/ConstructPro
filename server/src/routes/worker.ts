import { Router } from 'express'
import { 
  getWorkers, 
  createWorker, 
  getWorkerById, 
  updateWorker, 
  deleteWorker, 
  getWorkerAttendanceHistory 
} from '../controllers/workerController'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, getWorkers)
router.post('/', authenticate, authorize('ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'), createWorker)
router.get('/:id', authenticate, getWorkerById)
router.put('/:id', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), updateWorker)
router.delete('/:id', authenticate, authorize('ADMIN'), deleteWorker)
router.get('/:id/attendance', authenticate, getWorkerAttendanceHistory)

export default router
