import { Router } from 'express'
import { 
  getDashboardStats, 
  getPortfolioData, 
  getFinancialStats, 
  getWorkforceOverview 
} from '../controllers/dashboardController'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

// All dashboard routes require authentication and admin role
router.get('/stats', authenticate, authorize('ADMIN'), getDashboardStats)
router.get('/portfolio', authenticate, authorize('ADMIN'), getPortfolioData)
router.get('/financials', authenticate, authorize('ADMIN'), getFinancialStats)
router.get('/workforce', authenticate, authorize('ADMIN'), getWorkforceOverview)

export default router
