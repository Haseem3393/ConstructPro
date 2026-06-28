import { Router } from 'express'
import {
  getCompanySettings,
  updateCompanySettings,
  getCategories,
  createCategorySetting,
  deleteCategorySetting,
  getRolePermissions,
  updateRolePermissions,
} from '../controllers/settingsController'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

// All settings actions require authentication and ADMIN status
router.get('/company', authenticate, authorize('ADMIN'), getCompanySettings)
router.put('/company', authenticate, authorize('ADMIN'), updateCompanySettings)

router.get('/categories', authenticate, authorize('ADMIN'), getCategories)
router.post('/categories', authenticate, authorize('ADMIN'), createCategorySetting)
router.delete('/categories/:id', authenticate, authorize('ADMIN'), deleteCategorySetting)

router.get('/roles', authenticate, authorize('ADMIN'), getRolePermissions)
router.put('/roles', authenticate, authorize('ADMIN'), updateRolePermissions)

export default router
