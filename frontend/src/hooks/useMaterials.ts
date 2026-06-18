import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { materialService } from '../services/materialService'
import type { CreateMaterialInput, UpdateMaterialInput, StockInInput, StockOutInput } from '../services/materialService'

export const useMaterials = (filters?: { projectId?: string; category?: string; search?: string }) => {
  return useQuery({
    queryKey: ['materials', filters],
    queryFn: () => materialService.getMaterials(filters),
  })
}

export const useMaterialDetails = (id: string) => {
  return useQuery({
    queryKey: ['material', id],
    queryFn: () => materialService.getMaterialById(id),
    enabled: !!id,
  })
}

export const useProjectMaterials = (projectId: string) => {
  return useQuery({
    queryKey: ['materials', 'project', projectId],
    queryFn: () => materialService.getProjectMaterials(projectId),
    enabled: !!projectId,
  })
}

export const useCreateMaterial = (projectId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateMaterialInput) => materialService.createMaterial(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
    },
  })
}

export const useRecordStockIn = (projectId: string, materialId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ matId, data }: { matId: string; data: StockInInput }) =>
      materialService.recordStockIn(projectId, matId, data),
    onSuccess: (_, variables) => {
      const targetMatId = materialId || variables.matId
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      if (targetMatId) {
        queryClient.invalidateQueries({ queryKey: ['material', targetMatId] })
      }
      queryClient.invalidateQueries({ queryKey: ['projectExpenses', projectId] })
      queryClient.invalidateQueries({ queryKey: ['projectDetails', projectId] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
      queryClient.invalidateQueries({ queryKey: ['inventoryOverview'] })
    },
  })
}

export const useRecordStockOut = (projectId: string, materialId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ matId, data }: { matId: string; data: StockOutInput }) =>
      materialService.recordStockOut(projectId, matId, data),
    onSuccess: (_, variables) => {
      const targetMatId = materialId || variables.matId
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      if (targetMatId) {
        queryClient.invalidateQueries({ queryKey: ['material', targetMatId] })
      }
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
      queryClient.invalidateQueries({ queryKey: ['inventoryOverview'] })
      queryClient.invalidateQueries({ queryKey: ['usageLogs'] })
    },
  })
}

export const useUpdateMaterial = (projectId: string, materialId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ matId, data }: { matId: string; data: UpdateMaterialInput }) =>
      materialService.updateMaterial(projectId, matId, data),
    onSuccess: (_, variables) => {
      const targetMatId = materialId || variables.matId
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      if (targetMatId) {
        queryClient.invalidateQueries({ queryKey: ['material', targetMatId] })
      }
    },
  })
}

export const useDeleteMaterial = (projectId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (materialId: string) => materialService.deleteMaterial(projectId, materialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
    },
  })
}
