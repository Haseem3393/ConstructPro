import api from '../lib/api'

export const settingsService = {
  getCompanySettings: async (): Promise<any> => {
    const response = await api.get('/settings/company')
    return response.data
  },

  updateCompanySettings: async (data: any): Promise<any> => {
    const response = await api.put('/settings/company', data)
    return response.data
  },

  getCategories: async (): Promise<any[]> => {
    const response = await api.get<any[]>('/settings/categories')
    return response.data
  },

  createCategory: async (data: { type: string; name: string }): Promise<any> => {
    const response = await api.post('/settings/categories', data)
    return response.data
  },

  deleteCategory: async (id: string): Promise<any> => {
    const response = await api.delete(`/settings/categories/${id}`)
    return response.data
  },

  getRolePermissions: async (): Promise<any[]> => {
    const response = await api.get<any[]>('/settings/roles')
    return response.data
  },

  updateRolePermissions: async (data: { role: string; permissions: any }): Promise<any> => {
    const response = await api.put('/settings/roles', data)
    return response.data
  }
}
