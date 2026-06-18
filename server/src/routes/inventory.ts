import { Router } from 'express'
import {
  getInventoryOverview,
  getOpeningStock,
  createOpeningStock,
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  getUsageLogs,
  getTransfers,
  createTransfer,
  approveTransfer
} from '../controllers/inventoryController'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

router.get('/overview', authenticate, getInventoryOverview)
router.get('/opening-stock', authenticate, getOpeningStock)
router.post('/opening-stock', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), createOpeningStock)

router.get('/purchases', authenticate, getPurchaseOrders)
router.get('/purchases/:id', authenticate, getPurchaseOrderById)
router.post('/purchases', authenticate, authorize('ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'), createPurchaseOrder)
router.put('/purchases/:id/status', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), updatePurchaseOrderStatus)

router.get('/usage', authenticate, getUsageLogs)

router.get('/transfers', authenticate, getTransfers)
router.post('/transfers', authenticate, authorize('ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'), createTransfer)
router.put('/transfers/:id/approve', authenticate, authorize('ADMIN'), approveTransfer)

export default router
