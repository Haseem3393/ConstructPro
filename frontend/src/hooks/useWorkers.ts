import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workerService } from '../services/workerService'
import type { CreateWorkerInput, UpdateWorkerInput } from '../services/workerService'

export const useWorkersList = () => {
  return useQuery({
    queryKey: ['workers'],
    queryFn: workerService.getWorkers,
  })
}

export const useWorkerDetails = (id: string) => {
  return useQuery({
    queryKey: ['worker', id],
    queryFn: () => workerService.getWorkerById(id),
    enabled: !!id,
  })
}

export const useWorkerAttendance = (id: string) => {
  return useQuery({
    queryKey: ['workerAttendance', id],
    queryFn: () => workerService.getWorkerAttendanceHistory(id),
    enabled: !!id,
  })
}

export const useCreateWorker = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateWorkerInput) => workerService.createWorker(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
      queryClient.invalidateQueries({ queryKey: ['workforceOverview'] })
    },
  })
}

export const useUpdateWorker = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkerInput }) => workerService.updateWorker(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workers'] })
      queryClient.invalidateQueries({ queryKey: ['worker', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
      queryClient.invalidateQueries({ queryKey: ['workforceOverview'] })
    },
  })
}

export const useDeleteWorker = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => workerService.deleteWorker(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
      queryClient.invalidateQueries({ queryKey: ['workforceOverview'] })
    },
  })
}
