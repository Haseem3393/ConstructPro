import { Router } from 'express'
import { login, getCurrentUser, forgotPassword, resetPassword } from '../controllers/authController'
import { authenticate } from '../middleware/auth'

const router = Router()

// Public routes
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

// Protected routes
router.get('/me', authenticate, getCurrentUser)

export default router
