import api from '../lib/api'
import type { Project } from '../types'

export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    const response = await api.get<Project[]>('/projects')
    return response.data
  },

  getProjectById: async (id: string): Promise<Project & { tasks: any[]; milestones: any[]; expenses: any[]; payments: any[] }> => {
    const response = await api.get<any>(`/projects/${id}`)
    return response.data
  },

  createProject: async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'status'> & { managerId?: string; clientId?: string }): Promise<Project> => {
    const response = await api.post<Project>('/projects', data)
    return response.data
  },

  updateProject: async (id: string, data: Partial<Project> & { managerId?: string; clientId?: string }): Promise<Project> => {
    const response = await api.put<Project>(`/projects/${id}`, data)
    return response.data
  },

  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`)
  },

  createMilestone: async (id: string, data: { name: string; description?: string; dueDate: string }): Promise<any> => {
    const response = await api.post<any>(`/projects/${id}/milestones`, data)
    return response.data
  },

  createMember: async (id: string, data: { userId: string; role?: string }): Promise<any> => {
    const response = await api.post<any>(`/projects/${id}/members`, data)
    return response.data
  },

  createExpense: async (id: string, data: { amount: number; category: string; description?: string; date: string }): Promise<any> => {
    const response = await api.post<any>(`/projects/${id}/expenses`, data)
    return response.data
  },

  getProjectPayments: async (id: string): Promise<any[]> => {
    const response = await api.get<any[]>(`/projects/${id}/payments`)
    return response.data
  },

  updatePaymentStatus: async (id: string, paymentId: string, status: string): Promise<any> => {
    const response = await api.put<any>(`/projects/${id}/payments/${paymentId}`, { status })
    return response.data
  },
}
