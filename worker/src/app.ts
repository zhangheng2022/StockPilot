import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { errorResponse, HttpError } from './http/errors'
import { successResponse } from './http/responses'
import type { AppBindings } from './http/types'
import { requestContextMiddleware } from './middleware/request-context'
import { createDashboardRoutes } from './routes/dashboard'
import { createDecisionRoutes } from './routes/decisions'

export function createApp() {
  const app = new Hono<AppBindings>()

  app.use('*', requestContextMiddleware)

  app.onError((error, c) => {
    if (error instanceof HttpError) {
      return errorResponse(c, error)
    }

    if (error instanceof HTTPException && error.status === 400) {
      return errorResponse(c, new HttpError('bad_request', 'Invalid JSON body'))
    }

    console.error(JSON.stringify({
      level: 'error',
      event: 'request_error',
      requestId: c.get('requestId'),
      path: c.req.path,
      message: error.message,
    }))

    return errorResponse(c, new HttpError('internal_error', 'Internal server error', 500))
  })

  app.get('/api/health', (c) => successResponse(c, {
    service: 'stock-pilot-worker',
  }))

  app.route('/api/decisions', createDecisionRoutes())
  app.route('/api/dashboard', createDashboardRoutes())

  app.get('/api/discipline-cards', () => {
    throw new HttpError('not_implemented', 'Discipline cards API is not implemented yet', 501)
  })

  app.get('/api/trigger-events', () => {
    throw new HttpError('not_implemented', 'Trigger events API is not implemented yet', 501)
  })

  app.get('/api/reviews', () => {
    throw new HttpError('not_implemented', 'Reviews API is not implemented yet', 501)
  })

  return app
}
