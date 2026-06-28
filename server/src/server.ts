import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import dashboardRoutes from './routes/dashboard'
import projectRoutes from './routes/project'
import workerRoutes from './routes/worker'
import attendanceRoutes from './routes/attendance'
import portalRoutes from './routes/portal'
import userRoutes from './routes/user'
import reportRoutes from './routes/report'
import timesheetRoutes from './routes/timesheet'
import materialRoutes from './routes/material'
import inventoryRoutes from './routes/inventory'
import supplierRoutes from './routes/supplier'
import machineryRoutes from './routes/machinery'
import financeRoutes from './routes/finance'
import subcontractorRoutes from './routes/subcontractor'
import contractRoutes from './routes/contract'
import paymentRoutes from './routes/payment'
import changeOrderRoutes from './routes/changeOrder'
import settingsRoutes from './routes/settings'
import auditLogRoutes from './routes/auditLog'
import notificationRoutes from './routes/notification'
import prisma from './config/database'



dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'ConstructPro API is running' })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/workers', workerRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/portal', portalRoutes)
app.use('/api/users', userRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/timesheets', timesheetRoutes)
app.use('/api/materials', materialRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/suppliers', supplierRoutes)
app.use('/api/machinery', machineryRoutes)
app.use('/api/finance', financeRoutes)
app.use('/api/subcontractors', subcontractorRoutes)
app.use('/api/contracts', contractRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/change-orders', changeOrderRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/audit-logs', auditLogRoutes)
app.use('/api/notifications', notificationRoutes)



// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Server error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

const seedSubcontractors = async () => {
  try {
    const count = await prisma.subcontractor.count()
    if (count === 0) {
      await prisma.subcontractor.createMany({
        data: [
          { name: 'Senok Piling Ltd', phone: '+94112334455', email: 'info@senok.lk', address: 'Colombo 03' },
          { name: 'Super Steel Fabricators', phone: '+94115443322', email: 'steel@super.lk', address: 'Wattala' },
          { name: 'ElectroMech Services', phone: '+94771234567', email: 'repair@electromech.lk', address: 'Kandy' },
          { name: 'Fine Wood Carpentry', phone: '+94719876543', email: 'carpentry@finewood.lk', address: 'Moratuwa' },
        ]
      })
      console.log('🌱 Seeded default subcontractors successfully.')
    }
  } catch (err) {
    console.error('Error seeding subcontractors:', err)
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔗 API URL: http://localhost:${PORT}`)
  // await seedSubcontractors()
})

