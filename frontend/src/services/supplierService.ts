import api from '../lib/api'

export interface Supplier {
  id: string
  name: string
  shortName: string
  phone?: string
  email?: string
  vatNo?: string
  address?: string
  paymentTerms?: string
  createdAt: string
  updatedAt: string
  materials?: Array<{
    id: string
    name: string
    category: string
    unit: string
    currentStock: number
  }>
  purchaseOrders?: Array<{
    id: string
    poNumber: string
    totalAmount: number
    paidAmount: number
    status: string
    createdAt: string
    project: {
      name: string
    }
  }>
  stats?: {
    totalPurchased: number
    outstandingPayables: number
    poCount: number
  }
}

export interface CreateSupplierInput {
  name: string
  shortName: string
  phone?: string
  email?: string
  vatNo?: string
  address?: string
  paymentTerms?: string
}

export const supplierService = {
  getSuppliers: async (params?: { search?: string }): Promise<Supplier[]> => {
    const response = await api.get<Supplier[]>('/suppliers', { params })
    return response.data
  },

  getSupplierById: async (id: string): Promise<Supplier> => {
    const response = await api.get<Supplier>(`/suppliers/${id}`)
    return response.data
  },

  createSupplier: async (data: CreateSupplierInput): Promise<Supplier> => {
    const response = await api.post<Supplier>('/suppliers', data)
    return response.data
  },
}
