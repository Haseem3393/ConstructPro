import { Router } from 'express'
import { 
  getFinancialReport, 
  getLabourReport, 
  getInventoryReport,
  getSummaryStats,
  getProjectSummaryReport,
  getExpenseReport,
  getPayrollReport,
  getAttendanceReport,
  getMaterialUsageReport,
  getBudgetComparisonReport,
  getMachineryUsageReport
} from '../controllers/reportController'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

// All reports are restricted to ADMIN and PROJECT_MANAGER
router.get('/financial', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), getFinancialReport)
router.get('/labour', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), getLabourReport)
router.get('/inventory', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), getInventoryReport)

// New Module 11 Reports
router.get('/stats', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), getSummaryStats)
router.get('/project', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), getProjectSummaryReport)
router.get('/expense', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), getExpenseReport)
router.get('/payroll', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), getPayrollReport)
router.get('/attendance', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), getAttendanceReport)
router.get('/material', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), getMaterialUsageReport)
router.get('/budget', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), getBudgetComparisonReport)
router.get('/machinery', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), getMachineryUsageReport)

export default router
