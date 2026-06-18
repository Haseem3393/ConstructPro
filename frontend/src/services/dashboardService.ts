import api from '../lib/api'
import type { DashboardData, Project } from '../types'

export const dashboardService = {
  getStats: async (): Promise<DashboardData> => {
    const response = await api.get<DashboardData>('/dashboard/stats')
    return response.data
  },

  getPortfolio: async (): Promise<Project[]> => {
    const response = await api.get<Project[]>('/dashboard/portfolio')
    return response.data
  },

  getFinancials: async (): Promise<any> => {
    const response = await api.get<any>('/dashboard/financials')
    return response.data
  },

  getWorkforce: async (): Promise<any> => {
    const response = await api.get<any>('/dashboard/workforce')
    return response.data
  },
}
