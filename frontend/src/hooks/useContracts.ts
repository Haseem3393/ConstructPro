import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contractService } from '../services/contractService'
import type {
  CreateContractInput,
  PayMilestoneInput,
  CreateChangeOrderInput
} from '../services/contractService'

export const useContractsList = (filters?: { projectId?: string; status?: string }) => {
  return useQuery({
    queryKey: ['contracts', filters],
    queryFn: () => contractService.getContracts(filters),
  })
}

export const useContractDetails = (id: string) => {
  return useQuery({
    queryKey: ['contract', id],
    queryFn: () => contractService.getContractById(id),
    enabled: !!id,
  })
}

export const useCreateContract = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateContractInput) => contractService.createContract(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
    },
  })
}

export const usePaymentsList = (filters?: { projectId?: string; status?: string }) => {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: () => contractService.getPayments(filters),
  })
}

export const usePaymentDetails = (id: string) => {
  return useQuery({
    queryKey: ['payment', id],
    queryFn: () => contractService.getPaymentById(id),
    enabled: !!id,
  })
}

export const useMarkPaymentPaid = (paymentId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PayMilestoneInput) => contractService.markPaymentPaid(paymentId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['payment', paymentId] })
      if (data.contractId) {
        queryClient.invalidateQueries({ queryKey: ['contract', data.contractId] })
      }
      queryClient.invalidateQueries({ queryKey: ['cheques'] })
    },
  })
}

export const useChangeOrdersList = (filters?: { projectId?: string; status?: string }) => {
  return useQuery({
    queryKey: ['changeOrders', filters],
    queryFn: () => contractService.getChangeOrders(filters),
  })
}

export const useCreateChangeOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateChangeOrderInput) => contractService.createChangeOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changeOrders'] })
    },
  })
}

export const useApproveChangeOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => contractService.approveChangeOrder(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['changeOrders'] })
      queryClient.invalidateQueries({ queryKey: ['contract', data.contractId] })
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', data.projectId] })
      queryClient.invalidateQueries({ queryKey: ['budgetOverview'] })
      queryClient.invalidateQueries({ queryKey: ['budgetDetails', data.projectId] })
    },
  })
}

export const useRejectChangeOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => contractService.rejectChangeOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changeOrders'] })
    },
  })
}
