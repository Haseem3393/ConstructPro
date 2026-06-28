export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'SUPERVISOR' | 'CLIENT'
  permissions?: any
  createdAt: string
  updatedAt?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
  redirect: string
}

export interface Project {
  id: string
  name: string
  location: string
  description?: string
  budget: number
  startDate: string
  endDate: string
  status: 'PLANNING' | 'ONGOING' | 'COMPLETED' | 'OVERDUE'
  progress: number
  manager?: {
    name: string
    email: string
  }
  managerId?: string
  client?: {
    name: string
    email: string
  }
  clientId?: string
  members?: any[]
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  description?: string
  dueDate: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'OVERDUE'
  priority?: string
  projectId: string
  assignedTo?: User
  createdBy?: User
  createdAt: string
  updatedAt: string
}

export interface Worker {
  id: string
  name: string
  trade: string
  dailyWage: number
  phone?: string
  address?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Attendance {
  id: string
  date: string
  present: boolean
  overtimeHours: number
  dailyWage: number
  totalPay: number
  projectId: string
  workerId: string
  createdAt: string
  updatedAt: string
}

export interface Material {
  id: string
  name: string
  unit: string
  category?: string
  itemType?: string
  stockIn: number
  stockOut: number
  currentStock: number
  minimumLevel: number
  supplier?: string
  supplierId?: string
  supplierRef?: any
  projectId: string
  project?: Project
  transactions?: any[]
  createdAt: string
  updatedAt: string
}

export interface Expense {
  id: string
  amount: number
  category: 'LABOUR' | 'MATERIAL' | 'EQUIPMENT' | 'OTHER'
  description?: string
  date: string
  projectId: string
  createdBy?: User
  createdAt: string
  updatedAt: string
}

export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  overdueProjects: number
  totalBudget: number
  totalSpent: number
  budgetUtilization: number
}

export interface DashboardData {
  stats: DashboardStats
  recentActivity: Array<{
    id: string
    type: string
    description: string
    category: string
    project: string
    user: string
    date: string
  }>
  projectsOverview: Project[]
}
