import { createApp } from './app'
import type { WorkerEnv } from './env'
import { scanDisciplineCards } from './jobs/scan-discipline-cards'

const app = createApp()

export default {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext) {
    const url = new URL(request.url)

    if (url.pathname.startsWith('/api/')) {
      return app.fetch(request, env, ctx)
    }

    if (env.ENVIRONMENT === 'development' && env.DEV_ASSET_ORIGIN) {
      const origin = new URL(env.DEV_ASSET_ORIGIN)
      origin.pathname = url.pathname
      origin.search = url.search
      return fetch(new Request(origin, request))
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request)
    }

    return new Response('Not Found', {
      status: 404,
    })
  },

  async scheduled(_controller: ScheduledController, env: WorkerEnv, ctx: ExecutionContext) {
    ctx.waitUntil(scanDisciplineCards(env))
  },
}
