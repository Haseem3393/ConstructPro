import api from '../lib/api'

export interface Machinery {
  id: string
  name: string
  brand?: string
  ownership: 'OWNED' | 'HIRED'
  hireSource?: string
  paymentType: 'HOUR' | 'DAY'
  rate: number
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'
  createdAt: string
  updatedAt: string
  currentProject?: string
  usages?: MachineryUsage[]
  maintenances?: MachineryMaintenance[]
  stats?: {
    totalUsageThisMonth: number
    totalCostThisMonth: number
  }
}

export interface MachineryUsage {
  id: string
  machineryId: string
  projectId: string
  project: {
    name: string
  }
  date: string
  hoursUsed?: number
  daysUsed?: number
  operatorName?: string
  totalCost: number
  createdAt: string
}

export interface MachineryMaintenance {
  id: string
  machineryId: string
  projectId: string
  project: {
    name: string
  }
  date: string
  description: string
  cost: number
  doneBy?: string
  createdAt: string
}

export interface CreateMachineryInput {
  name: string
  brand?: string
  ownership: string
  hireSource?: string
  paymentType: string
  rate: number
  status?: string
}

export interface LogMachineryUsageInput {
  projectId: string
  date: string
  hoursUsed?: number
  daysUsed?: number
  operatorName?: string
}

export interface LogMachineryMaintenanceInput {
  projectId: string
  date: string
  description: string
  cost: number
  doneBy?: string
  setStatusMaintenance?: boolean
}

export const machineryService = {
  getMachineries: async (): Promise<Machinery[]> => {
    const response = await api.get<Machinery[]>('/machinery')
    return response.data
  },

  getMachineryById: async (id: string): Promise<Machinery> => {
    const response = await api.get<Machinery>(`/machinery/${id}`)
    return response.data
  },

  createMachinery: async (data: CreateMachineryInput): Promise<Machinery> => {
    const response = await api.post<Machinery>('/machinery', data)
    return response.data
  },

  logUsage: async (id: string, data: LogMachineryUsageInput): Promise<any> => {
    const response = await api.post(`/machinery/${id}/usage`, data)
    return response.data
  },

  logMaintenance: async (id: string, data: LogMachineryMaintenanceInput): Promise<any> => {
    const response = await api.post(`/machinery/${id}/maintenance`, data)
    return response.data
  },

  updateStatus: async (id: string, status: string): Promise<Machinery> => {
    const response = await api.put<Machinery>(`/machinery/${id}/status`, { status })
    return response.data
  },
}
