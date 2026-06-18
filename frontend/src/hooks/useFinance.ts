import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { financeService } from '../services/financeService'
import type {
  CreateExpenseInput,
  CreatePayableInput,
  CreateChequeInput
} from '../services/financeService'

export const useExpensesList = (filters?: {
  projectId?: string
  category?: string
  startDate?: string
  endDate?: string
}) => {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => financeService.getExpenses(filters),
  })
}

export const useCreateExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateExpenseInput) => financeService.createExpense(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['budget'] })
      queryClient.invalidateQueries({ queryKey: ['budgetDetails', variables.projectId] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
    },
  })
}

export const useBudgetOverview = () => {
  return useQuery({
    queryKey: ['budgetOverview'],
    queryFn: () => financeService.getBudgets(),
  })
}

export const useBudgetDetails = (projectId: string) => {
  return useQuery({
    queryKey: ['budgetDetails', projectId],
    queryFn: () => financeService.getBudgetDetails(projectId),
    enabled: !!projectId,
  })
}

export const usePayablesList = (status?: string) => {
  return useQuery({
    queryKey: ['payables', status],
    queryFn: () => financeService.getPayables(status),
  })
}

export const useCreatePayable = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePayableInput) => financeService.createPayable(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payables'] })
    },
  })
}

export const useChequesList = (filters?: { status?: string; bank?: string }) => {
  return useQuery({
    queryKey: ['cheques', filters],
    queryFn: () => financeService.getCheques(filters),
  })
}

export const useCreateCheque = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateChequeInput) => financeService.createCheque(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cheques'] })
      queryClient.invalidateQueries({ queryKey: ['payables'] })
      if (variables.payableId) {
        queryClient.invalidateQueries({ queryKey: ['payableDetails', variables.payableId] })
      }
    },
  })
}

export const useUpdateChequeStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      financeService.updateChequeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques'] })
      queryClient.invalidateQueries({ queryKey: ['payables'] })
    },
  })
}

export const useSubcontractorsList = () => {
  return useQuery({
    queryKey: ['subcontractors'],
    queryFn: () => financeService.getSubcontractors(),
  })
}

export const useCreateSubcontractor = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string; phone?: string; email?: string; address?: string }) =>
      financeService.createSubcontractor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcontractors'] })
    },
  })
}
