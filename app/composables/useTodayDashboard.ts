import { computed } from 'vue'
import type { ApiResult } from '../types/api'
import type { TodayDashboard } from '../types/dashboard'
import { useApiFetch } from './useApiFetch'

export function useTodayDashboard() {
  const response = useApiFetch<ApiResult<TodayDashboard>>('/dashboard/today')
  const dashboard = computed(() => {
    const body = response.data.value

    if (isTodayDashboardSuccess(body)) {
      return body.data
    }

    return null
  })
  const apiError = computed(() => {
    const body = response.data.value

    if (isApiFailure(body)) {
      return body.error
    }

    return null
  })

  return {
    dashboard,
    apiError,
    pending: response.pending,
    error: response.error,
    refresh: response.refresh,
  }
}

function isTodayDashboardSuccess(value: unknown): value is { ok: true, data: TodayDashboard } {
  return typeof value === 'object' && value !== null && 'ok' in value && value.ok === true && 'data' in value
}

function isApiFailure(value: unknown): value is { ok: false, error: { code: string, message: string, requestId?: string } } {
  return typeof value === 'object' && value !== null && 'ok' in value && value.ok === false && 'error' in value
}
