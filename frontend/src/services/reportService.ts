import api from '../lib/api'

export const reportService = {
  getFinancialReport: async (): Promise<any[]> => {
    const response = await api.get<any[]>('/reports/financial')
    return response.data
  },

  getLabourReport: async (): Promise<any[]> => {
    const response = await api.get<any[]>('/reports/labour')
    return response.data
  },

  getInventoryReport: async (): Promise<any[]> => {
    const response = await api.get<any[]>('/reports/inventory')
    return response.data
  },
}
