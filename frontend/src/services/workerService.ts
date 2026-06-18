import api from '../lib/api'
import type { Worker, Attendance } from '../types'

export interface CreateWorkerInput {
  name: string
  trade: string
  dailyWage: number
  phone?: string
  address?: string
}

export interface UpdateWorkerInput {
  name?: string
  trade?: string
  dailyWage?: number
  phone?: string
  address?: string
  active?: boolean
}

export interface WorkerAttendanceRecord extends Attendance {
  project: {
    name: string
  }
}

export const workerService = {
  getWorkers: async (): Promise<Worker[]> => {
    const response = await api.get<Worker[]>('/workers')
    return response.data
  },

  getWorkerById: async (id: string): Promise<Worker> => {
    const response = await api.get<Worker>(`/workers/${id}`)
    return response.data
  },

  createWorker: async (data: CreateWorkerInput): Promise<Worker> => {
    const response = await api.post<Worker>('/workers', data)
    return response.data
  },

  updateWorker: async (id: string, data: UpdateWorkerInput): Promise<Worker> => {
    const response = await api.put<Worker>(`/workers/${id}`, data)
    return response.data
  },

  deleteWorker: async (id: string): Promise<void> => {
    await api.delete(`/workers/${id}`)
  },

  getWorkerAttendanceHistory: async (id: string): Promise<WorkerAttendanceRecord[]> => {
    const response = await api.get<WorkerAttendanceRecord[]>(`/workers/${id}/attendance`)
    return response.data
  },
}
