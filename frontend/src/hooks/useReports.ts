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

// New Module 11 Reports Hooks
export const useSummaryStats = () => {
  return useQuery({
    queryKey: ['reports', 'stats'],
    queryFn: () => reportService.getSummaryStats(),
  })
}

export const useProjectReport = (projectId: string) => {
  return useQuery({
    queryKey: ['reports', 'project', projectId],
    queryFn: () => reportService.getProjectReport(projectId),
    enabled: !!projectId
  })
}

export const useExpenseReport = (params: { projectId?: string; category?: string; startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ['reports', 'expense', params],
    queryFn: () => reportService.getExpenseReport(params)
  })
}

export const usePayrollReport = (params: { month: string; projectId?: string }) => {
  return useQuery({
    queryKey: ['reports', 'payroll', params],
    queryFn: () => reportService.getPayrollReport(params),
    enabled: !!params.month
  })
}

export const useAttendanceReport = (params: { projectId?: string; startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ['reports', 'attendance', params],
    queryFn: () => reportService.getAttendanceReport(params)
  })
}

export const useMaterialReport = (params: { projectId?: string; startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ['reports', 'material', params],
    queryFn: () => reportService.getMaterialReport(params)
  })
}

export const useBudgetReport = () => {
  return useQuery({
    queryKey: ['reports', 'budget'],
    queryFn: () => reportService.getBudgetReport()
  })
}

export const useMachineryReport = () => {
  return useQuery({
    queryKey: ['reports', 'machinery'],
    queryFn: () => reportService.getMachineryReport()
  })
}
