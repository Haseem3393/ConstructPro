import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryService } from '../services/inventoryService'
import type { CreatePOInput } from '../services/inventoryService'

export const useInventoryOverview = () => {
  return useQuery({
    queryKey: ['inventoryOverview'],
    queryFn: () => inventoryService.getOverview(),
  })
}

export const useOpeningStock = (filters?: { projectId?: string }) => {
  return useQuery({
    queryKey: ['openingStock', filters],
    queryFn: () => inventoryService.getOpeningStock(filters),
  })
}

export const useCreateOpeningStock = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { projectId: string; materialId: string; quantity: number; unitPrice: number }) =>
      inventoryService.createOpeningStock(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['openingStock'] })
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      queryClient.invalidateQueries({ queryKey: ['material', variables.materialId] })
      queryClient.invalidateQueries({ queryKey: ['inventoryOverview'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
    },
  })
}

export const usePurchaseOrders = (filters?: { supplierId?: string; status?: string }) => {
  return useQuery({
    queryKey: ['purchaseOrders', filters],
    queryFn: () => inventoryService.getPurchaseOrders(filters),
  })
}

export const usePurchaseOrderDetails = (id: string) => {
  return useQuery({
    queryKey: ['purchaseOrder', id],
    queryFn: () => inventoryService.getPurchaseOrderById(id),
    enabled: !!id,
  })
}

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePOInput) => inventoryService.createPurchaseOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] })
      queryClient.invalidateQueries({ queryKey: ['inventoryOverview'] })
    },
  })
}

export const useUpdatePOStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status?: string; paidAmount?: number } }) =>
      inventoryService.updatePOStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] })
      queryClient.invalidateQueries({ queryKey: ['purchaseOrder', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      queryClient.invalidateQueries({ queryKey: ['inventoryOverview'] })
      queryClient.invalidateQueries({ queryKey: ['projectExpenses'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      queryClient.invalidateQueries({ queryKey: ['supplier'] })
    },
  })
}

export const useUsageLogs = (filters?: { projectId?: string }) => {
  return useQuery({
    queryKey: ['usageLogs', filters],
    queryFn: () => inventoryService.getUsageLogs(filters),
  })
}

export const useTransfers = () => {
  return useQuery({
    queryKey: ['transfers'],
    queryFn: () => inventoryService.getTransfers(),
  })
}

export const useCreateTransfer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { fromProjectId: string; toProjectId: string; materialId: string; quantity: number }) =>
      inventoryService.createTransfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] })
    },
  })
}

export const useApproveTransfer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => inventoryService.approveTransfer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] })
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      queryClient.invalidateQueries({ queryKey: ['inventoryOverview'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
    },
  })
}
