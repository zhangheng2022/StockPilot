import { Hono } from 'hono'
import type { AppBindings } from '../http/types'
import { successResponse } from '../http/responses'
import { createDashboardService } from '../services/dashboard-service'

export function createDashboardRoutes() {
  const app = new Hono<AppBindings>()

  app.get('/today', async (c) => {
    const dashboard = await createDashboardService(c.env).getTodayDashboard(c.get('userId'))

    return successResponse(c, dashboard)
  })

  return app
}
