import api from '../lib/api'

export interface AttendanceRecordInput {
  workerId: string
  present: boolean
  overtimeHours: number
  dailyWage: number
}

export interface AttendanceGridItem {
  workerId: string
  name: string
  trade: string
  dailyWage: number
  present: boolean
  overtimeHours: number
  totalPay: number
  attendanceId: string | null
}

export const attendanceService = {
  getAttendance: async (projectId: string, date: string): Promise<AttendanceGridItem[]> => {
    const response = await api.get<AttendanceGridItem[]>('/attendance', {
      params: { projectId, date },
    })
    return response.data
  },

  saveAttendance: async (projectId: string, date: string, records: AttendanceRecordInput[]): Promise<any> => {
    const response = await api.post('/attendance', { projectId, date, records })
    return response.data
  },

  getAttendanceHistory: async (params?: { projectId?: string; workerId?: string; startDate?: string; endDate?: string }): Promise<any[]> => {
    const response = await api.get<any[]>('/attendance/history', { params })
    return response.data
  },

  getAttendanceSummary: async (params?: { projectId?: string; startDate?: string; endDate?: string }): Promise<any> => {
    const response = await api.get<any>('/attendance/summary', { params })
    return response.data
  },

  updateAttendance: async (id: string, data: { present: boolean; overtimeHours: number; dailyWage: number }): Promise<any> => {
    const response = await api.put<any>(`/attendance/${id}`, data)
    return response.data
  },
}
