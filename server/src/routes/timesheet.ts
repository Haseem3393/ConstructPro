import { Router } from 'express'
import {
  getTimesheets,
  getTimesheetById,
  createTimesheet,
  submitTimesheet,
  approveTimesheet,
  rejectTimesheet
} from '../controllers/timesheetController'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, authorize('ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'), getTimesheets)
router.get('/:id', authenticate, authorize('ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'), getTimesheetById)
router.post('/', authenticate, authorize('ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'), createTimesheet)
router.put('/:id/submit', authenticate, authorize('ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'), submitTimesheet)
router.put('/:id/approve', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), approveTimesheet)
router.put('/:id/reject', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), rejectTimesheet)

export default router
