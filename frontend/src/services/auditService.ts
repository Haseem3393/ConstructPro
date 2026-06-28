import api from '../lib/api'

export const auditService = {
  getAuditLogs: async (params: { userId?: string; moduleName?: string; startDate?: string; endDate?: string; search?: string }): Promise<any[]> => {
    const response = await api.get<any[]>('/audit-logs', { params })
    return response.data
  }
}
