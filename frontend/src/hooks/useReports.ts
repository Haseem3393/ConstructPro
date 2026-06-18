import { useQuery } from '@tanstack/react-query'
import { reportService } from '../services/reportService'

export const useFinancialReport = () => {
  return useQuery({
    queryKey: ['reports', 'financial'],
    queryFn: () => reportService.getFinancialReport(),
  })
}

export const useLabourReport = () => {
  return useQuery({
    queryKey: ['reports', 'labour'],
    queryFn: () => reportService.getLabourReport(),
  })
}

export const useInventoryReport = () => {
  return useQuery({
    queryKey: ['reports', 'inventory'],
    queryFn: () => reportService.getInventoryReport(),
  })
}
