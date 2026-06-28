import { useQuery } from '@tanstack/react-query'
import { auditService } from '../services/auditService'

export const useAuditLogs = (params: { userId?: string; moduleName?: string; startDate?: string; endDate?: string; search?: string }) => {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => auditService.getAuditLogs(params),
  })
}
