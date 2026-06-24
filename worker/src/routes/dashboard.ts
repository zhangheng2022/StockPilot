import { Hono } from 'hono'
import type { AppBindings } from '../http/types'
import { createDashboardService } from '../services/dashboard-service'

export function createDashboardRoutes() {
  const app = new Hono<AppBindings>()

  app.get('/today', async (c) => {
    const dashboard = await createDashboardService(c.env).getTodayDashboard(c.get('userId'))

    return c.json({
      data: dashboard,
    })
  })

  return app
}
