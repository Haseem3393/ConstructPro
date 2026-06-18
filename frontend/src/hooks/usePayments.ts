import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectService } from '../services/projectService'

export const useProjectPayments = (projectId: string) => {
  return useQuery({
    queryKey: ['projectPayments', projectId],
    queryFn: () => projectService.getProjectPayments(projectId),
    enabled: !!projectId,
  })
}

export const useUpdatePaymentStatus = (projectId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ paymentId, status }: { paymentId: string; status: string }) =>
      projectService.updatePaymentStatus(projectId, paymentId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projectPayments', projectId] })
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
      queryClient.invalidateQueries({ queryKey: ['reports', 'financial'] })
      queryClient.invalidateQueries({ queryKey: ['portalData'] })
    },
  })
}
