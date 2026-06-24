import { afterEach, describe, expect, it, vi } from 'vitest'
import worker from '../src/index'
import { createTestEnv } from './fake-d1'

describe('Worker entrypoint', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('proxies non-API development requests to the Nuxt dev server for HMR', async () => {
    const upstreamFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('nuxt dev response', {
        headers: {
          'content-type': 'text/html',
        },
      }),
    )
    const env = createTestEnv(undefined, {
      DEV_ASSET_ORIGIN: 'http://127.0.0.1:3000',
    } as Partial<Env>)

    const response = await worker.fetch(
      new Request('http://127.0.0.1:8787/_nuxt/app.js?hmr=1'),
      env,
      {} as ExecutionContext,
    )

    expect(await response.text()).toBe('nuxt dev response')
    expect(upstreamFetch).toHaveBeenCalledOnce()
    expect((upstreamFetch.mock.calls[0][0] as Request).url).toBe('http://127.0.0.1:3000/_nuxt/app.js?hmr=1')
  })
})
