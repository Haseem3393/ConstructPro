import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { machineryService } from '../services/machineryService'
import type { 
  CreateMachineryInput, 
  LogMachineryUsageInput, 
  LogMachineryMaintenanceInput 
} from '../services/machineryService'

export const useMachineryList = () => {
  return useQuery({
    queryKey: ['machineries'],
    queryFn: () => machineryService.getMachineries(),
  })
}

export const useMachineryDetails = (id: string) => {
  return useQuery({
    queryKey: ['machinery', id],
    queryFn: () => machineryService.getMachineryById(id),
    enabled: !!id,
  })
}

export const useCreateMachinery = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateMachineryInput) => machineryService.createMachinery(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machineries'] })
    },
  })
}

export const useLogMachineryUsage = (machineryId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LogMachineryUsageInput) => machineryService.logUsage(machineryId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['machineries'] })
      queryClient.invalidateQueries({ queryKey: ['machinery', machineryId] })
      queryClient.invalidateQueries({ queryKey: ['projectExpenses', variables.projectId] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
    },
  })
}

export const useLogMachineryMaintenance = (machineryId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LogMachineryMaintenanceInput) => machineryService.logMaintenance(machineryId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['machineries'] })
      queryClient.invalidateQueries({ queryKey: ['machinery', machineryId] })
      queryClient.invalidateQueries({ queryKey: ['projectExpenses', variables.projectId] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
    },
  })
}

export const useUpdateMachineryStatus = (machineryId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (status: string) => machineryService.updateStatus(machineryId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machineries'] })
      queryClient.invalidateQueries({ queryKey: ['machinery', machineryId] })
    },
  })
}
