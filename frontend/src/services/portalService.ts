import api from '../lib/api'

export interface ClientPortalPayload {
  project: {
    id: string
    name: string
    location: string
    description?: string
    progress: number
    contractValue: number
    startDate: string
    expectedCompletion: string
  }
  milestones: Array<{
    id: string
    name: string
    description?: string
    percentage: number
    status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'OVERDUE'
    dueDate: string
  }>
  payments: Array<{
    id: string
    milestone: string
    amount: number
    percentage: number
    status: 'PENDING' | 'DUE' | 'PAID'
    dueDate?: string
    paidDate?: string
  }>
}

export const portalService = {
  getPortalData: async (): Promise<ClientPortalPayload> => {
    const response = await api.get<ClientPortalPayload>('/portal/project')
    return response.data
  },
}
