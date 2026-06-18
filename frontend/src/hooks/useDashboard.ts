import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboardService'

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => dashboardService.getStats(),
  })
}

export const usePortfolioData = () => {
  return useQuery({
    queryKey: ['dashboardPortfolio'],
    queryFn: () => dashboardService.getPortfolio(),
  })
}

export const useFinancialStats = () => {
  return useQuery({
    queryKey: ['dashboardFinancials'],
    queryFn: () => dashboardService.getFinancials(),
  })
}

export const useWorkforceOverview = () => {
  return useQuery({
    queryKey: ['dashboardWorkforce'],
    queryFn: () => dashboardService.getWorkforce(),
  })
}
