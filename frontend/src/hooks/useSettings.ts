import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsService } from '../services/settingsService'

export const useCompanySettings = () => {
  return useQuery({
    queryKey: ['settings', 'company'],
    queryFn: () => settingsService.getCompanySettings(),
  })
}

export const useUpdateCompanySettings = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => settingsService.updateCompanySettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'company'] })
    }
  })
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['settings', 'categories'],
    queryFn: () => settingsService.getCategories(),
  })
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { type: string; name: string }) => settingsService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'categories'] })
    }
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => settingsService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'categories'] })
    }
  })
}

export const useRolePermissions = () => {
  return useQuery({
    queryKey: ['settings', 'roles'],
    queryFn: () => settingsService.getRolePermissions(),
  })
}

export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { role: string; permissions: any }) => settingsService.updateRolePermissions(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'roles'] })
    }
  })
}
