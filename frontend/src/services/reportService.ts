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

  // New Module 11 Reports
  getSummaryStats: async (): Promise<any> => {
    const response = await api.get<any>('/reports/stats')
    return response.data
  },

  getProjectReport: async (projectId: string): Promise<any> => {
    const response = await api.get<any>('/reports/project', {
      params: { projectId }
    })
    return response.data
  },

  getExpenseReport: async (params: { projectId?: string; category?: string; startDate?: string; endDate?: string }): Promise<any> => {
    const response = await api.get<any>('/reports/expense', { params })
    return response.data
  },

  getPayrollReport: async (params: { month: string; projectId?: string }): Promise<any> => {
    const response = await api.get<any>('/reports/payroll', { params })
    return response.data
  },

  getAttendanceReport: async (params: { projectId?: string; startDate?: string; endDate?: string }): Promise<any> => {
    const response = await api.get<any>('/reports/attendance', { params })
    return response.data
  },

  getMaterialReport: async (params: { projectId?: string; startDate?: string; endDate?: string }): Promise<any> => {
    const response = await api.get<any>('/reports/material', { params })
    return response.data
  },

  getBudgetReport: async (): Promise<any[]> => {
    const response = await api.get<any[]>('/reports/budget')
    return response.data
  },

  getMachineryReport: async (): Promise<any> => {
    const response = await api.get<any>('/reports/machinery')
    return response.data
  }
}
