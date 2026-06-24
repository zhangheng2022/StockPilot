import type { Context } from 'hono'
import type { AppBindings } from './types'

export function successResponse<T>(c: Context<AppBindings>, data: T, status: 200 | 201 = 200) {
  return c.json({
    ok: true,
    data,
  }, status)
}
