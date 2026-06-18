import { Router } from 'express'
import { 
  getAttendanceByDate, 
  saveAttendance, 
  getAttendanceHistory, 
  getAttendanceSummary, 
  updateAttendanceRecord 
} from '../controllers/attendanceController'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, authorize('ADMIN', 'SUPERVISOR'), getAttendanceByDate)
router.post('/', authenticate, authorize('ADMIN', 'SUPERVISOR'), saveAttendance)
router.get('/history', authenticate, authorize('ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'), getAttendanceHistory)
router.get('/summary', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), getAttendanceSummary)
router.put('/:id', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), updateAttendanceRecord)

export default router
