import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '../api/dashboardAPI'

export const useDashboard = () =>
  useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardStats,
    refetchInterval: 30000
  })
