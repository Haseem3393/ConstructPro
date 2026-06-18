import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { timesheetService } from '../services/timesheetService'

export const useTimesheets = (filters?: { projectId?: string; status?: string }) => {
  return useQuery({
    queryKey: ['timesheets', filters],
    queryFn: () => timesheetService.getTimesheets(filters),
  })
}

export const useTimesheetDetails = (id: string) => {
  return useQuery({
    queryKey: ['timesheet', id],
    queryFn: () => timesheetService.getTimesheetById(id),
    enabled: !!id,
  })
}

export const useCreateTimesheet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { projectId: string; startDate: string }) =>
      timesheetService.createTimesheet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] })
    },
  })
}

export const useSubmitTimesheet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => timesheetService.submitTimesheet(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] })
      queryClient.invalidateQueries({ queryKey: ['timesheet', id] })
    },
  })
}

export const useApproveTimesheet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => timesheetService.approveTimesheet(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] })
      queryClient.invalidateQueries({ queryKey: ['timesheet', id] })
      queryClient.invalidateQueries({ queryKey: ['reports', 'financial'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
    },
  })
}

export const useRejectTimesheet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      timesheetService.rejectTimesheet(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] })
      queryClient.invalidateQueries({ queryKey: ['timesheet', variables.id] })
    },
  })
}
