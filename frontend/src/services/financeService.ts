import api from '../lib/api'

export interface Expense {
  id: string
  amount: number
  category: 'LABOUR' | 'MATERIAL' | 'EQUIPMENT' | 'SUBCONTRACTOR' | 'TRANSPORT' | 'OTHER'
  description?: string
  date: string
  isAuto: boolean
  reference?: string
  receiptUrl?: string
  projectId: string
  project?: {
    name: string
  }
  createdById?: string
  createdBy?: {
    name: string
  }
  createdAt: string
}

export interface BudgetOverviewItem {
  id: string
  name: string
  budget: number
  spent: number
  remaining: number
  percentUsed: number
  status: 'ON_TRACK' | 'WARNING' | 'CRITICAL' | 'OVERSPENT'
}

export interface BudgetDetails {
  project: {
    id: string
    name: string
    budget: number
  }
  spent: number
  remaining: number
  progressPercent: number
  categoryBreakdown: {
    category: string
    amount: number
    percent: number
  }[]
  monthlyTrend: {
    month: string
    amount: number
  }[]
}

export interface Subcontractor {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  createdAt: string
}

export interface Payable {
  id: string
  amount: number
  dueDate: string
  description?: string
  reference?: string
  status: 'PENDING' | 'PAID' | 'OVERDUE'
  projectId: string
  project?: {
    name: string
  }
  supplierId?: string
  supplier?: {
    name: string
  }
  subcontractorId?: string
  subcontractor?: {
    name: string
  }
  createdAt: string
}

export interface Cheque {
  id: string
  chequeNo: string
  bank: string
  payee: string
  amount: number
  issueDate: string
  notes?: string
  status: 'ISSUED' | 'CLEARED' | 'BOUNCED' | 'CANCELLED'
  payableId?: string
  payable?: {
    id: string
    reference?: string
    description?: string
  }
  createdAt: string
}

export interface CreateExpenseInput {
  projectId: string
  category: string
  amount: number
  date: string
  description?: string
  reference?: string
  receiptUrl?: string
}

export interface CreatePayableInput {
  projectId: string
  supplierId?: string
  subcontractorId?: string
  amount: number
  dueDate: string
  description?: string
  reference?: string
}

export interface CreateChequeInput {
  chequeNo: string
  bank: string
  payee: string
  amount: number
  issueDate: string
  payableId?: string
  notes?: string
}

export const financeService = {
  // Expenses
  getExpenses: async (filters?: {
    projectId?: string
    category?: string
    startDate?: string
    endDate?: string
  }): Promise<{ expenses: Expense[]; totalAmount: number }> => {
    const response = await api.get<{ expenses: Expense[]; totalAmount: number }>('/finance/expenses', {
      params: filters,
    })
    return response.data
  },

  createExpense: async (data: CreateExpenseInput): Promise<Expense> => {
    const response = await api.post<Expense>('/finance/expenses', data)
    return response.data
  },

  // Budgets
  getBudgets: async (): Promise<BudgetOverviewItem[]> => {
    const response = await api.get<BudgetOverviewItem[]>('/finance/budget')
    return response.data
  },

  getBudgetDetails: async (projectId: string): Promise<BudgetDetails> => {
    const response = await api.get<BudgetDetails>(`/finance/budget/${projectId}`)
    return response.data
  },

  // Payables
  getPayables: async (status?: string): Promise<{ payables: Payable[]; totalOutstanding: number }> => {
    const response = await api.get<{ payables: Payable[]; totalOutstanding: number }>('/finance/payables', {
      params: { status },
    })
    return response.data
  },

  createPayable: async (data: CreatePayableInput): Promise<Payable> => {
    const response = await api.post<Payable>('/finance/payables', data)
    return response.data
  },

  // Cheques
  getCheques: async (filters?: { status?: string; bank?: string }): Promise<Cheque[]> => {
    const response = await api.get<Cheque[]>('/finance/cheques', { params: filters })
    return response.data
  },

  createCheque: async (data: CreateChequeInput): Promise<Cheque> => {
    const response = await api.post<Cheque>('/finance/cheques', data)
    return response.data
  },

  updateChequeStatus: async (id: string, status: string): Promise<Cheque> => {
    const response = await api.put<Cheque>(`/finance/cheques/${id}/status`, { status })
    return response.data
  },

  // Subcontractors
  getSubcontractors: async (): Promise<Subcontractor[]> => {
    const response = await api.get<Subcontractor[]>('/subcontractors')
    return response.data
  },

  createSubcontractor: async (data: {
    name: string
    phone?: string
    email?: string
    address?: string
  }): Promise<Subcontractor> => {
    const response = await api.post<Subcontractor>('/subcontractors', data)
    return response.data
  },
}
