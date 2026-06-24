import type { Context } from 'hono'
import type { AppBindings } from './types'

export type ErrorCode = 'bad_request' | 'validation_error' | 'unauthorized' | 'not_found' | 'not_implemented' | 'internal_error'

export class HttpError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly status: 400 | 401 | 404 | 501 | 500 = 400,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

export function errorResponse(c: Context<AppBindings>, error: HttpError) {
  return c.json({
    ok: false,
    error: {
      code: error.code,
      message: error.message,
      requestId: c.get('requestId'),
    },
  }, error.status)
}
