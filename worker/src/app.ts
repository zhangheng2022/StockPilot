import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { errorResponse, HttpError } from './http/errors'
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

  app.get('/api/health', (c) => c.json({
    ok: true,
    service: 'stock-pilot-worker',
  }))

  app.route('/api/decisions', createDecisionRoutes())
  app.route('/api/dashboard', createDashboardRoutes())

  app.get('/api/discipline-cards', (c) => c.json({
    data: [],
  }))

  app.get('/api/trigger-events', (c) => c.json({
    data: [],
  }))

  app.get('/api/reviews', (c) => c.json({
    data: [],
  }))

  return app
}
