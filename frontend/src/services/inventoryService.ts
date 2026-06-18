import api from '../lib/api'

export interface InventoryOverview {
  totalMaterials: number
  lowStockCount: number
  outOfStockCount: number
  totalValue: number
  projectSummaries: Array<{
    projectId: string
    projectName: string
    location: string
    materialsCount: number
    lowStockCount: number
    totalValue: number
  }>
}

export interface OpeningStock {
  id: string
  projectName: string
  materialName: string
  unit: string
  quantity: number
  unitPrice: number
  total: number
  date: string
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  supplierId: string
  supplier: {
    name: string
    shortName: string
  }
  projectId: string
  project: {
    name: string
  }
  totalAmount: number
  paidAmount: number
  status: 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED'
  deliveryDateExpected?: string
  notes?: string
  items: PurchaseOrderItem[]
  createdAt: string
  updatedAt: string
}

export interface PurchaseOrderItem {
  id: string
  purchaseOrderId: string
  materialId: string
  material: {
    name: string
    unit: string
  }
  quantity: number
  unitPrice: number
  total: number
}

export interface UsageLog {
  id: string
  projectName: string
  materialName: string
  quantity: number
  unit: string
  date: string
  description?: string
  recordedBy: string
}

export interface MaterialTransfer {
  id: string
  fromProjectId: string
  fromProject: {
    name: string
  }
  toProjectId: string
  toProject: {
    name: string
  }
  materialId: string
  material: {
    name: string
    unit: string
  }
  quantity: number
  date: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  approvedBy?: {
    name: string
  }
  createdAt: string
}

export interface CreatePOInput {
  supplierId: string
  projectId: string
  deliveryDateExpected?: string
  notes?: string
  items: Array<{
    materialId: string
    quantity: number
    unitPrice: number
  }>
  status?: string
}

export const inventoryService = {
  getOverview: async (): Promise<InventoryOverview> => {
    const response = await api.get<InventoryOverview>('/inventory/overview')
    return response.data
  },

  getOpeningStock: async (params?: { projectId?: string }): Promise<OpeningStock[]> => {
    const response = await api.get<OpeningStock[]>('/inventory/opening-stock', { params })
    return response.data
  },

  createOpeningStock: async (data: {
    projectId: string
    materialId: string
    quantity: number
    unitPrice: number
  }): Promise<any> => {
    const response = await api.post('/inventory/opening-stock', data)
    return response.data
  },

  getPurchaseOrders: async (params?: { supplierId?: string; status?: string }): Promise<PurchaseOrder[]> => {
    const response = await api.get<PurchaseOrder[]>('/inventory/purchases', { params })
    return response.data
  },

  getPurchaseOrderById: async (id: string): Promise<PurchaseOrder> => {
    const response = await api.get<PurchaseOrder>(`/inventory/purchases/${id}`)
    return response.data
  },

  createPurchaseOrder: async (data: CreatePOInput): Promise<PurchaseOrder> => {
    const response = await api.post<PurchaseOrder>('/inventory/purchases', data)
    return response.data
  },

  updatePOStatus: async (id: string, data: { status?: string; paidAmount?: number }): Promise<PurchaseOrder> => {
    const response = await api.put<PurchaseOrder>(`/inventory/purchases/${id}/status`, data)
    return response.data
  },

  getUsageLogs: async (params?: { projectId?: string }): Promise<UsageLog[]> => {
    const response = await api.get<UsageLog[]>('/inventory/usage', { params })
    return response.data
  },

  getTransfers: async (): Promise<MaterialTransfer[]> => {
    const response = await api.get<MaterialTransfer[]>('/inventory/transfers')
    return response.data
  },

  createTransfer: async (data: {
    fromProjectId: string
    toProjectId: string
    materialId: string
    quantity: number
  }): Promise<MaterialTransfer> => {
    const response = await api.post<MaterialTransfer>('/inventory/transfers', data)
    return response.data
  },

  approveTransfer: async (id: string): Promise<MaterialTransfer> => {
    const response = await api.put<MaterialTransfer>(`/inventory/transfers/${id}/approve`)
    return response.data
  },
}
