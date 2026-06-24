import type { ApiResult } from '../types/api'

type ApiRequestOptions = {
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  const response = await $fetch<ApiResult<T>>(path, {
    baseURL: '/api',
    method: options.method ?? 'POST',
    body: options.body,
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(response.error.message)
  }

  return response.data
}
