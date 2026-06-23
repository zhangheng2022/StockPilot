import { createMiddleware } from 'hono/factory'
import type { AppBindings } from '../http/types'

export const requestContextMiddleware = createMiddleware<AppBindings>(async (c, next) => {
  const requestId = c.req.header('x-request-id') || crypto.randomUUID()
  const userId = c.req.header('x-user-id')
    || c.req.header('cf-access-authenticated-user-email')
    || 'local-user'

  c.set('requestId', requestId)
  c.set('userId', userId)

  await next()

  c.header('x-request-id', requestId)
})
