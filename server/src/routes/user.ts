import { Router } from 'express'
import {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  updatePermissions,
  updateProfile,
  changePassword,
} from '../controllers/userController'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

// Common profiles routes (requires authentication)
router.put('/profile', authenticate, updateProfile)
router.put('/profile/password', authenticate, changePassword)

// Admin user management routes
router.get('/', authenticate, authorize('ADMIN'), getUsers)
router.post('/', authenticate, authorize('ADMIN'), createUser)
router.get('/:id', authenticate, getUserById)
router.put('/:id', authenticate, authorize('ADMIN'), updateUser)
router.put('/:id/permissions', authenticate, authorize('ADMIN'), updatePermissions)

export default router
