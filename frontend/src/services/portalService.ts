import api from '../lib/api'

export const portalService = {
  getPortalProject: async (): Promise<any> => {
    const response = await api.get('/portal/project')
    return response.data
  },

  getPortalProgress: async (): Promise<any> => {
    const response = await api.get('/portal/progress')
    return response.data
  },

  getPortalPayments: async (): Promise<any> => {
    const response = await api.get('/portal/payments')
    return response.data
  },

  getPortalDocuments: async (): Promise<any[]> => {
    const response = await api.get<any[]>('/portal/documents')
    return response.data
  }
}
