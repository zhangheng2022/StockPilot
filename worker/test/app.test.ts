import { describe, expect, it } from 'vitest'
import { createApp } from '../src/app'
import { createTestEnv, FakeD1Database } from './fake-d1'

describe('worker api', () => {
  it('returns health status', async () => {
    const app = createApp()
    const db = new FakeD1Database()
    const response = await app.request('/api/health', {}, createTestEnv(db))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      ok: true,
      service: 'stock-pilot-worker',
    })
  })

  it('returns the today dashboard from persisted user data', async () => {
    const db = new FakeD1Database((call) => {
      if (call.sql.includes('from trigger_events')) {
        return [{
          stock_code: '600519',
          stock_name: '贵州茅台',
          status: 'confirmed',
          trigger_type: '价格监控',
          triggered_condition: '跌破止损位',
          evidence_source: null,
          relation_to_plan: '已触及止损纪律',
          suggested_actions: null,
          created_at: '2026-06-23T00:00:00.000Z',
        }]
      }

      if (call.sql.includes('from discipline_cards')) {
        return [{
          id: 'card-1',
          decision_id: 'decision-1',
          core_thesis: '贵州茅台纪律卡',
          status: 'needs_review',
          review_frequency: '每日复核',
          next_review_at: '今日',
          updated_at: '2026-06-23T00:00:00.000Z',
        }]
      }

      return []
    })
    const app = createApp()

    const response = await app.request('/api/dashboard/today', {
      headers: {
        'x-user-id': 'dashboard-user',
      },
    }, createTestEnv(db))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      data: {
        summary: {
          riskTriggerCount: 1,
          disciplineCardCount: 1,
        },
        triggers: [{
          stockCode: '600519',
          stockName: '贵州茅台',
          label: '跌破止损位',
          tone: 'red',
          primaryAction: '进入复核',
        }],
        disciplineCards: [{
          title: '贵州茅台纪律卡',
          progress: 80,
        }],
      },
    })
    expect(db.calls.some((call) => (
      call.sql.includes('from trigger_events') && call.bindings[0] === 'dashboard-user'
    ))).toBe(true)
    expect(db.calls.some((call) => (
      call.sql.includes('from discipline_cards') && call.bindings[0] === 'dashboard-user'
    ))).toBe(true)
  })

  it('creates a decision and lists stored decisions', async () => {
    const rows = [{
      id: 'decision-1',
      user_id: 'local-user',
      stock_code: '600519',
      stock_name: '贵州茅台',
      action: 'buy',
      rationale: '基本面稳定',
      evidence: '盈利质量较高',
      risk: '估值偏高',
      planned_position: 0.1,
      invalidation_condition: '业绩连续低于预期',
      exit_condition: '跌破纪律条件',
      status: 'draft',
      quality_check: null,
      created_at: '2026-06-23T00:00:00.000Z',
      updated_at: '2026-06-23T00:00:00.000Z',
    }]
    const db = new FakeD1Database((call) => {
      if (call.sql.includes('select') && call.sql.includes('from decisions')) {
        return rows
      }
      return null
    })
    const app = createApp()

    const createResponse = await app.request('/api/decisions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        stockCode: '600519',
        stockName: '贵州茅台',
        action: 'buy',
        rationale: '基本面稳定',
        evidence: '盈利质量较高',
        risk: '估值偏高',
        plannedPosition: 0.1,
        invalidationCondition: '业绩连续低于预期',
        exitCondition: '跌破纪律条件',
      }),
    }, createTestEnv(db))

    expect(createResponse.status).toBe(201)
    expect(db.calls.some((call) => call.sql.includes('insert into decisions'))).toBe(true)

    const listResponse = await app.request('/api/decisions', {}, createTestEnv(db))

    expect(listResponse.status).toBe(200)
    await expect(listResponse.json()).resolves.toEqual({
      data: [{
        id: 'decision-1',
        userId: 'local-user',
        stockCode: '600519',
        stockName: '贵州茅台',
        action: 'buy',
        rationale: '基本面稳定',
        evidence: '盈利质量较高',
        risk: '估值偏高',
        plannedPosition: 0.1,
        invalidationCondition: '业绩连续低于预期',
        exitCondition: '跌破纪律条件',
        status: 'draft',
        qualityCheck: null,
        createdAt: '2026-06-23T00:00:00.000Z',
        updatedAt: '2026-06-23T00:00:00.000Z',
      }],
    })
  })

  it('uses request user context when querying and creating decisions', async () => {
    const db = new FakeD1Database((call) => {
      if (call.sql.includes('select') && call.sql.includes('from decisions')) {
        return []
      }
      return null
    })
    const app = createApp()

    await app.request('/api/decisions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-user-id': 'user-alice',
      },
      body: JSON.stringify({
        stockCode: '00700',
        stockName: 'Tencent',
        action: 'hold',
        rationale: 'waiting for confirmation',
        evidence: 'volume expansion',
        risk: 'false breakout',
        plannedPosition: 0.05,
        invalidationCondition: 'breaks support',
        exitCondition: 'thesis invalidated',
      }),
    }, createTestEnv(db))

    await app.request('/api/decisions', {
      headers: {
        'x-user-id': 'user-alice',
      },
    }, createTestEnv(db))

    expect(db.calls.some((call) => (
      call.sql.includes('insert into decisions') && call.bindings.includes('user-alice')
    ))).toBe(true)
    expect(db.calls.some((call) => (
      call.sql.includes('from decisions') && call.bindings[0] === 'user-alice'
    ))).toBe(true)
  })

  it('does not trust x-user-id in production', async () => {
    const db = new FakeD1Database((call) => {
      if (call.sql.includes('select') && call.sql.includes('from decisions')) {
        return []
      }
      return null
    })
    const app = createApp()

    const response = await app.request('/api/decisions', {
      headers: {
        'x-user-id': 'spoofed-user',
        'cf-access-authenticated-user-email': 'alice@example.com',
      },
    }, createTestEnv(db, {
      ENVIRONMENT: 'production',
    } as Partial<Env>))

    expect(response.status).toBe(200)
    expect(db.calls.some((call) => (
      call.sql.includes('from decisions') && call.bindings[0] === 'alice@example.com'
    ))).toBe(true)
    expect(db.calls.some((call) => call.bindings.includes('spoofed-user'))).toBe(false)
  })

  it('returns structured validation errors with request id', async () => {
    const app = createApp()
    const response = await app.request('/api/decisions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-request-id': 'req-test-1',
      },
      body: JSON.stringify({ stockCode: '600519' }),
    }, createTestEnv())

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'validation_error',
        message: 'stockName is required',
        requestId: 'req-test-1',
      },
    })
  })

  it('requires JSON content type before validating decision input', async () => {
    const app = createApp()
    const response = await app.request('/api/decisions', {
      method: 'POST',
      headers: {
        'x-request-id': 'req-test-content-type',
      },
      body: JSON.stringify({
        stockCode: '600519',
        stockName: 'Kweichow Moutai',
        action: 'buy',
        rationale: 'stable fundamentals',
        evidence: 'quality earnings',
        risk: 'valuation',
        plannedPosition: 0.1,
        invalidationCondition: 'earnings miss',
        exitCondition: 'discipline break',
      }),
    }, createTestEnv())

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'bad_request',
        message: 'Content-Type must be application/json',
        requestId: 'req-test-content-type',
      },
    })
  })

  it('returns structured bad request errors for malformed JSON', async () => {
    const app = createApp()
    const response = await app.request('/api/decisions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-request-id': 'req-test-malformed-json',
      },
      body: '{bad json',
    }, createTestEnv())

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'bad_request',
        message: 'Invalid JSON body',
        requestId: 'req-test-malformed-json',
      },
    })
  })

  it('does not fail the list endpoint when a JSON text column contains invalid data', async () => {
    const rows = [{
      id: 'decision-1',
      user_id: 'local-user',
      stock_code: '600519',
      stock_name: 'Kweichow Moutai',
      action: 'buy',
      rationale: 'stable fundamentals',
      evidence: 'quality earnings',
      risk: 'valuation',
      planned_position: 0.1,
      invalidation_condition: 'earnings miss',
      exit_condition: 'discipline break',
      status: 'draft',
      quality_check: '{invalid json',
      created_at: '2026-06-23T00:00:00.000Z',
      updated_at: '2026-06-23T00:00:00.000Z',
    }]
    const db = new FakeD1Database((call) => {
      if (call.sql.includes('select') && call.sql.includes('from decisions')) {
        return rows
      }
      return null
    })
    const app = createApp()

    const response = await app.request('/api/decisions', {}, createTestEnv(db))

    expect(response.status).toBe(200)
    const body = await response.json<{
      data: Array<{
        qualityCheck: unknown | null
      }>
    }>()
    expect(body.data[0].qualityCheck).toBe(null)
  })
})
