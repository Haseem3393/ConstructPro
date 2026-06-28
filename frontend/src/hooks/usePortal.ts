import { useQuery } from '@tanstack/react-query'
import { portalService } from '../services/portalService'

export const usePortalProject = () => {
  return useQuery({
    queryKey: ['portal', 'project'],
    queryFn: () => portalService.getPortalProject(),
  })
}

export const usePortalProgress = () => {
  return useQuery({
    queryKey: ['portal', 'progress'],
    queryFn: () => portalService.getPortalProgress(),
  })
}

export const usePortalPayments = () => {
  return useQuery({
    queryKey: ['portal', 'payments'],
    queryFn: () => portalService.getPortalPayments(),
  })
}

export const usePortalDocuments = () => {
  return useQuery({
    queryKey: ['portal', 'documents'],
    queryFn: () => portalService.getPortalDocuments(),
  })
}
