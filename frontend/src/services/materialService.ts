import api from '../lib/api'
import type { Material } from '../types'

export interface CreateMaterialInput {
  name: string
  unit: string
  category?: string
  itemType?: string
  minimumLevel: number
  supplier?: string
  supplierId?: string
}

export interface UpdateMaterialInput {
  name?: string
  unit?: string
  category?: string
  itemType?: string
  minimumLevel?: number
  supplier?: string
  supplierId?: string
}

export interface StockInInput {
  quantity: number
  cost?: number
  date?: string
  description?: string
  supplierId?: string
  invoiceNumber?: string
  autoExpense?: boolean
}

export interface StockOutInput {
  quantity: number
  date?: string
  description?: string
}

export const materialService = {
  getMaterials: async (params?: { projectId?: string; category?: string; search?: string }): Promise<Material[]> => {
    const response = await api.get<Material[]>('/materials', { params })
    return response.data
  },

  getMaterialById: async (id: string): Promise<Material> => {
    const response = await api.get<Material>(`/materials/${id}`)
    return response.data
  },

  getProjectMaterials: async (projectId: string): Promise<Material[]> => {
    const response = await api.get<Material[]>(`/projects/${projectId}/materials`)
    return response.data
  },

  createMaterial: async (projectId: string, data: CreateMaterialInput): Promise<Material> => {
    const response = await api.post<Material>(`/projects/${projectId}/materials`, data)
    return response.data
  },

  recordStockIn: async (
    projectId: string,
    materialId: string,
    data: StockInInput
  ): Promise<{ material: Material; transaction: any; expense: any }> => {
    const response = await api.post<any>(`/projects/${projectId}/materials/${materialId}/stock-in`, data)
    return response.data
  },

  recordStockOut: async (
    projectId: string,
    materialId: string,
    data: StockOutInput
  ): Promise<{ material: Material; transaction: any }> => {
    const response = await api.post<any>(`/projects/${projectId}/materials/${materialId}/stock-out`, data)
    return response.data
  },

  updateMaterial: async (
    projectId: string,
    materialId: string,
    data: UpdateMaterialInput
  ): Promise<Material> => {
    const response = await api.put<Material>(`/projects/${projectId}/materials/${materialId}`, data)
    return response.data
  },

  deleteMaterial: async (projectId: string, materialId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}/materials/${materialId}`)
  },
}
