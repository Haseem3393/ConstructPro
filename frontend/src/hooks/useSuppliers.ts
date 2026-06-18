import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supplierService } from '../services/supplierService'
import type { CreateSupplierInput } from '../services/supplierService'

export const useSuppliers = (filters?: { search?: string }) => {
  return useQuery({
    queryKey: ['suppliers', filters],
    queryFn: () => supplierService.getSuppliers(filters),
  })
}

export const useSupplierDetails = (id: string) => {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: () => supplierService.getSupplierById(id),
    enabled: !!id,
  })
}

export const useCreateSupplier = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSupplierInput) => supplierService.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })
}
