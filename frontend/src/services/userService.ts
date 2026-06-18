import api from '../lib/api'
import type { User } from '../types'

export interface CreateUserInput {
  name: string
  email: string
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'SUPERVISOR' | 'CLIENT'
  phone?: string
  password?: string
}

export interface UpdateProfileInput {
  name: string
  phone: string
}

export const userService = {
  getUsers: async (role?: string, search?: string): Promise<User[]> => {
    const response = await api.get<User[]>('/users', {
      params: { role, search },
    })
    return response.data
  },

  getUserById: async (id: string): Promise<User & { managedProjects: any[]; clientProjects: any[]; assignedProjects: any[] }> => {
    const response = await api.get<any>(`/users/${id}`)
    return response.data
  },

  createUser: async (data: CreateUserInput): Promise<User> => {
    const response = await api.post<User>('/users', data)
    return response.data
  },

  updateUser: async (id: string, data: { name?: string; role?: string; phone?: string; active?: boolean }): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, data)
    return response.data
  },

  updatePermissions: async (id: string, modules: any): Promise<User> => {
    const response = await api.put<User>(`/users/${id}/permissions`, { modules })
    return response.data
  },

  updateProfile: async (data: UpdateProfileInput): Promise<User> => {
    const response = await api.put<User>('/users/profile', data)
    return response.data
  },

  changePassword: async (data: any): Promise<void> => {
    await api.put('/users/profile/password', data)
  },

  forgotPassword: async (email: string): Promise<{ token?: string; message: string }> => {
    const response = await api.post<any>('/auth/forgot-password', { email })
    return response.data
  },

  resetPassword: async (data: any): Promise<void> => {
    await api.post('/auth/reset-password', data)
  },
}
