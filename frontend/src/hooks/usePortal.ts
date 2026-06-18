import { useQuery } from '@tanstack/react-query'
import { portalService } from '../services/portalService'

export const usePortalData = () => {
  return useQuery({
    queryKey: ['portalData'],
    queryFn: () => portalService.getPortalData(),
  })
}
