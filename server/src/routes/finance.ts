import { Router } from 'express'
import {
  getExpenses,
  createExpense,
  getBudgets,
  getBudgetDetails,
  getPayables,
  createPayable,
  getCheques,
  createCheque,
  updateChequeStatus
} from '../controllers/financeController'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

// Expenses
router.get('/expenses', authenticate, getExpenses)
router.post('/expenses', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), createExpense)

// Budgets
router.get('/budget', authenticate, getBudgets)
router.get('/budget/:projectId', authenticate, getBudgetDetails)

// Payables
router.get('/payables', authenticate, getPayables)
router.post('/payables', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), createPayable)

// Cheques
router.get('/cheques', authenticate, getCheques)
router.post('/cheques', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), createCheque)
router.put('/cheques/:id/status', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), updateChequeStatus)

export default router
