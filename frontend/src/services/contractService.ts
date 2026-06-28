import api from '../lib/api'

export interface Contract {
  id: string
  projectId: string
  project?: {
    name: string
  }
  type: 'MAIN' | 'SUBCONTRACTOR'
  clientName: string
  subcontractorId?: string
  subcontractor?: {
    name: string
  }
  value: number
  startDate: string
  endDate: string
  paymentTerms?: string
  scope?: string
  documentUrl?: string
  status: 'ACTIVE' | 'COMPLETED' | 'TERMINATED'
  payments?: PaymentItem[]
  changeOrders?: ChangeOrderItem[]
  totalReceived?: number
  totalOutstanding?: number
  createdAt: string
  updatedAt: string
}

export interface PaymentItem {
  id: string
  contractValue: number
  percentage: string // e.g. FOUNDATION_25
  amount: number
  status: 'PENDING' | 'DUE' | 'PAID'
  dueDate?: string
  paidDate?: string
  milestoneId?: string
  projectId: string
  project?: {
    name: string
  }
  contractId?: string
  contract?: {
    id: string
    clientName: string
    value: number
    type: string
  }
  paidAt?: string
  paidById?: string
  paidBy?: {
    name: string
  }
  method?: string // Cash, Cheque, Transfer
  chequeId?: string
  cheque?: {
    id: string
    chequeNo: string
    bank: string
  }
  receiptUrl?: string
  createdAt: string
}

export interface ChangeOrderItem {
  id: string
  projectId: string
  project?: {
    name: string
  }
  contractId: string
  contract?: {
    id: string
    clientName: string
  }
  description: string
  reason?: string
  costImpact: number
  timeImpact: number // Extra days
  requestedBy: string // Client / PM
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
}

export interface CreateContractInput {
  projectId: string
  type: 'MAIN' | 'SUBCONTRACTOR'
  clientName: string
  subcontractorId?: string
  value: number
  startDate: string
  endDate: string
  paymentTerms?: string
  scope?: string
  documentUrl?: string
}

export interface PayMilestoneInput {
  method: 'Cash' | 'Cheque' | 'Transfer'
  chequeId?: string
  receiptUrl?: string
}

export interface CreateChangeOrderInput {
  projectId: string
  contractId: string
  description: string
  reason?: string
  costImpact: number
  timeImpact: number
  requestedBy: string
}

export const contractService = {
  // Contracts
  getContracts: async (filters?: { projectId?: string; status?: string }): Promise<Contract[]> => {
    const response = await api.get<Contract[]>('/contracts', { params: filters })
    return response.data
  },

  getContractById: async (id: string): Promise<Contract> => {
    const response = await api.get<Contract>(`/contracts/${id}`)
    return response.data
  },

  createContract: async (data: CreateContractInput): Promise<Contract> => {
    const response = await api.post<Contract>('/contracts', data)
    return response.data
  },

  // Payments
  getPayments: async (filters?: { projectId?: string; status?: string }): Promise<{ payments: PaymentItem[]; totalDue: number }> => {
    const response = await api.get<{ payments: PaymentItem[]; totalDue: number }>('/payments', { params: filters })
    return response.data
  },

  getPaymentById: async (id: string): Promise<PaymentItem> => {
    const response = await api.get<PaymentItem>(`/payments/${id}`)
    return response.data
  },

  markPaymentPaid: async (id: string, data: PayMilestoneInput): Promise<PaymentItem> => {
    const response = await api.put<PaymentItem>(`/payments/${id}/pay`, data)
    return response.data
  },

  // Change Orders
  getChangeOrders: async (filters?: { projectId?: string; status?: string }): Promise<ChangeOrderItem[]> => {
    const response = await api.get<ChangeOrderItem[]>('/change-orders', { params: filters })
    return response.data
  },

  createChangeOrder: async (data: CreateChangeOrderInput): Promise<ChangeOrderItem> => {
    const response = await api.post<ChangeOrderItem>('/change-orders', data)
    return response.data
  },

  approveChangeOrder: async (id: string): Promise<ChangeOrderItem> => {
    const response = await api.put<ChangeOrderItem>(`/change-orders/${id}/approve`)
    return response.data
  },

  rejectChangeOrder: async (id: string): Promise<ChangeOrderItem> => {
    const response = await api.put<ChangeOrderItem>(`/change-orders/${id}/reject`)
    return response.data
  },
}
