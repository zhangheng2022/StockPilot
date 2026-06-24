import { createMiddleware } from 'hono/factory'
import { getAccessUserId } from '../auth/access-jwt'
import { HttpError } from '../http/errors'
import type { AppBindings } from '../http/types'

export const requestContextMiddleware = createMiddleware<AppBindings>(async (c, next) => {
  const requestId = c.req.header('x-request-id') || crypto.randomUUID()
  c.set('requestId', requestId)

  const userId = c.env.ENVIRONMENT === 'production'
    ? await getAccessUserId(c.req.raw, c.env)
    : c.req.header('x-user-id') || 'local-user'

  if (!userId) {
    throw new HttpError('unauthorized', 'Authentication required', 401)
  }

  c.set('userId', userId)

  await next()

  c.header('x-request-id', requestId)
})
