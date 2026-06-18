import api from '../lib/api'

export interface Timesheet {
  id: string
  startDate: string
  endDate: string
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  totalHours: number
  rejectionReason?: string
  projectId: string
  project?: {
    name: string
    location: string
  }
  submittedBy?: {
    name: string
  }
  approvedBy?: {
    name: string
  }
  rows?: TimesheetRow[]
  createdAt: string
  updatedAt: string
}

export interface TimesheetRow {
  id: string
  timesheetId: string
  workerId: string
  worker: {
    name: string
    trade: string
    dailyWage: number
  }
  mondayHours: number
  tuesdayHours: number
  wednesdayHours: number
  thursdayHours: number
  fridayHours: number
  saturdayHours: number
  sundayHours: number
  totalHours: number
}

export const timesheetService = {
  getTimesheets: async (params?: { projectId?: string; status?: string }): Promise<Timesheet[]> => {
    const response = await api.get<Timesheet[]>('/timesheets', { params })
    return response.data
  },

  getTimesheetById: async (id: string): Promise<Timesheet> => {
    const response = await api.get<Timesheet>(`/timesheets/${id}`)
    return response.data
  },

  createTimesheet: async (data: { projectId: string; startDate: string }): Promise<Timesheet> => {
    const response = await api.post<Timesheet>('/timesheets', data)
    return response.data
  },

  submitTimesheet: async (id: string): Promise<Timesheet> => {
    const response = await api.put<Timesheet>(`/timesheets/${id}/submit`)
    return response.data
  },

  approveTimesheet: async (id: string): Promise<Timesheet> => {
    const response = await api.put<Timesheet>(`/timesheets/${id}/approve`)
    return response.data
  },

  rejectTimesheet: async (id: string, reason: string): Promise<Timesheet> => {
    const response = await api.put<Timesheet>(`/timesheets/${id}/reject`, { reason })
    return response.data
  },
}
