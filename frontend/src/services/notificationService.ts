import api from '../lib/api'

export const notificationService = {
  getNotifications: async (): Promise<any> => {
    const response = await api.get('/notifications')
    return response.data
  },

  markAllRead: async (): Promise<any> => {
    const response = await api.put('/notifications/read-all')
    return response.data
  },

  markSingleRead: async (id: string): Promise<any> => {
    const response = await api.put(`/notifications/${id}/read`)
    return response.data
  }
}
