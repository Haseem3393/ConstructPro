import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { attendanceService } from '../services/attendanceService'
import type { AttendanceRecordInput } from '../services/attendanceService'

export const useAttendance = (projectId: string, date: string) => {
  return useQuery({
    queryKey: ['attendance', projectId, date],
    queryFn: () => attendanceService.getAttendance(projectId, date),
    enabled: !!projectId && !!date,
  })
}

export const useSaveAttendance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      date,
      records,
    }: {
      projectId: string
      date: string
      records: AttendanceRecordInput[]
    }) => attendanceService.saveAttendance(projectId, date, records),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
    },
  })
}

export const useAttendanceHistory = (filters?: { projectId?: string; workerId?: string; startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ['attendanceHistory', filters],
    queryFn: () => attendanceService.getAttendanceHistory(filters),
  })
}

export const useAttendanceSummary = (filters?: { projectId?: string; startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ['attendanceSummary', filters],
    queryFn: () => attendanceService.getAttendanceSummary(filters),
  })
}

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { present: boolean; overtimeHours: number; dailyWage: number } }) =>
      attendanceService.updateAttendance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      queryClient.invalidateQueries({ queryKey: ['attendanceHistory'] })
      queryClient.invalidateQueries({ queryKey: ['attendanceSummary'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
      queryClient.invalidateQueries({ queryKey: ['reports', 'financial'] })
    },
  })
}
