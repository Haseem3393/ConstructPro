import { Router } from 'express'
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  createMilestone,
  createMember,
  createExpense,
  getProjectPayments,
  updatePaymentStatus,
} from '../controllers/projectController'
import {
  getProjectMaterials,
  createProjectMaterial,
  recordStockIn,
  recordStockOut,
  updateProjectMaterial,
  deleteProjectMaterial,
} from '../controllers/materialController'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

// All project routes require authentication
router.get('/', authenticate, getProjects)
router.get('/:id', authenticate, getProjectById)

// CRUD requires manager or admin rights
router.post('/', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), createProject)
router.put('/:id', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), updateProject)
router.delete('/:id', authenticate, authorize('ADMIN'), deleteProject)

// Sub-resource creation (milestones, members, expenses)
router.post('/:id/milestones', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), createMilestone)
router.post('/:id/members', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), createMember)
router.post('/:id/expenses', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), createExpense)

// Inventory/Materials sub-resources
router.get('/:id/materials', authenticate, getProjectMaterials)
router.post('/:id/materials', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), createProjectMaterial)
router.post('/:id/materials/:materialId/stock-in', authenticate, authorize('ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'), recordStockIn)
router.post('/:id/materials/:materialId/stock-out', authenticate, authorize('ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'), recordStockOut)
router.put('/:id/materials/:materialId', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), updateProjectMaterial)
router.delete('/:id/materials/:materialId', authenticate, authorize('ADMIN'), deleteProjectMaterial)

// Project Payments Milestone Billing
router.get('/:id/payments', authenticate, getProjectPayments)
router.put('/:id/payments/:paymentId', authenticate, authorize('ADMIN', 'PROJECT_MANAGER'), updatePaymentStatus)

export default router
