import { describe, expectTypeOf, it } from 'vitest'
import type { ApiFailure, ApiResult, ApiSuccess } from './http'

describe('http contract', () => {
  it('uses ok as the API response discriminator', () => {
    expectTypeOf<ApiSuccess<{ id: string }>>().toEqualTypeOf<{
      ok: true
      data: { id: string }
    }>()
    expectTypeOf<ApiFailure>().toMatchTypeOf<{
      ok: false
      error: {
        code: string
        message: string
        requestId?: string
      }
    }>()
    expectTypeOf<ApiResult<{ id: string }>>().toMatchTypeOf<
      | { ok: true, data: { id: string } }
      | { ok: false, error: { code: string, message: string } }
    >()
  })
})
