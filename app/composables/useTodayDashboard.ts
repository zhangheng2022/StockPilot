import { computed } from 'vue'
import { todayDashboard } from '../data/today-dashboard'
import type { ApiResult } from '../types/api'
import type { TodayDashboard } from '../types/dashboard'
import { useApiFetch } from './useApiFetch'

export function useTodayDashboard() {
  const response = useApiFetch<ApiResult<TodayDashboard>>('/dashboard/today')
  const dashboard = computed(() => {
    const body = response.data.value

    if (body && 'data' in body) {
      return body.data
    }

    return todayDashboard
  })

  return {
    dashboard,
    pending: response.pending,
    error: response.error,
    refresh: response.refresh,
  }
}
