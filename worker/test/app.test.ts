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
      data: {
        service: 'stock-pilot-worker',
      },
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
      ok: true,
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
    const triggerQuery = db.calls.find((call) => call.sql.includes('from trigger_events'))
    expect(triggerQuery?.sql).toContain('te.user_id = ?')
    expect(triggerQuery?.sql).toContain('dc.user_id = ?')
    expect(triggerQuery?.sql).toContain('d.user_id = ?')
    expect(triggerQuery?.bindings).toEqual(['dashboard-user', 'dashboard-user', 'dashboard-user'])
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
    await expect(createResponse.json()).resolves.toMatchObject({
      ok: true,
      data: {
        decision: {
          userId: 'local-user',
          stockCode: '600519',
          action: 'buy',
          status: 'card_created',
          qualityCheck: {
            verdict: 'pass',
          },
        },
        disciplineCard: {
          userId: 'local-user',
          status: 'planned_holding',
        },
      },
    })
    expect(db.calls.some((call) => call.sql.includes('insert into decisions'))).toBe(true)
    expect(db.calls.some((call) => call.sql.includes('insert into discipline_cards'))).toBe(true)

    const listResponse = await app.request('/api/decisions', {}, createTestEnv(db))

    expect(listResponse.status).toBe(200)
    await expect(listResponse.json()).resolves.toEqual({
      ok: true,
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
      call.sql.includes('insert into discipline_cards') && call.bindings.includes('user-alice')
    ))).toBe(true)
    expect(db.calls.some((call) => (
      call.sql.includes('from decisions') && call.bindings[0] === 'user-alice'
    ))).toBe(true)
  })

  it('returns one decision by id behind user isolation', async () => {
    const db = new FakeD1Database((call) => {
      if (call.sql.includes('from decisions') && call.sql.includes('where id = ?')) {
        return {
          id: 'decision-1',
          user_id: 'user-alice',
          stock_code: '00700',
          stock_name: 'Tencent',
          action: 'hold',
          rationale: 'wait for confirmation',
          evidence: 'volume expansion',
          risk: 'false breakout',
          planned_position: 0.25,
          invalidation_condition: 'breaks support',
          exit_condition: 'thesis invalidated',
          status: 'card_created',
          quality_check: JSON.stringify({
            verdict: 'pass',
            summary: 'ok',
            strengths: [],
            vulnerabilities: [],
            recommendations: [],
          }),
          created_at: '2026-06-23T00:00:00.000Z',
          updated_at: '2026-06-23T00:00:00.000Z',
        }
      }

      return null
    })
    const app = createApp()

    const response = await app.request('/api/decisions/decision-1', {
      headers: {
        'x-user-id': 'user-alice',
      },
    }, createTestEnv(db))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      data: {
        id: 'decision-1',
        userId: 'user-alice',
        qualityCheck: {
          verdict: 'pass',
        },
      },
    })
    expect(db.calls.find((call) => call.sql.includes('where id = ?'))?.bindings).toEqual(['decision-1', 'user-alice'])
  })

  it('falls back to local user in development when x-user-id is absent', async () => {
    const db = new FakeD1Database((call) => {
      if (call.sql.includes('select') && call.sql.includes('from decisions')) {
        return []
      }
      return null
    })
    const app = createApp()

    const response = await app.request('/api/decisions', {}, createTestEnv(db))

    expect(response.status).toBe(200)
    expect(db.calls.some((call) => (
      call.sql.includes('from decisions') && call.bindings[0] === 'local-user'
    ))).toBe(true)
  })

  it('requires a Cloudflare Access JWT in production', async () => {
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
      },
    }, createTestEnv(db, {
      ENVIRONMENT: 'production',
    } as Partial<Env>))

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: {
        code: 'unauthorized',
        message: 'Cloudflare Access token is required',
      },
    })
    expect(db.calls).toHaveLength(0)
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
      ok: false,
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
      ok: false,
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
      ok: false,
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
      ok: true
      data: Array<{
        qualityCheck: unknown | null
      }>
    }>()
    expect(body.ok).toBe(true)
    expect(body.data[0].qualityCheck).toBe(null)
  })

  it('lists discipline cards with decision context behind explicit user isolation', async () => {
    const db = new FakeD1Database((call) => {
      if (call.sql.includes('from discipline_cards dc') && call.sql.includes('join decisions d')) {
        return [{
          id: 'card-1',
          decision_id: 'decision-1',
          user_id: 'user-alice',
          core_thesis: 'Tencent hold thesis',
          status: 'planned_holding',
          review_frequency: 'daily',
          next_review_at: '2026-06-24T00:00:00.000Z',
          created_at: '2026-06-23T00:00:00.000Z',
          updated_at: '2026-06-23T00:00:00.000Z',
          stock_code: '00700',
          stock_name: 'Tencent',
          action: 'hold',
        }]
      }

      return []
    })
    const app = createApp()

    const response = await app.request('/api/discipline-cards', {
      headers: {
        'x-user-id': 'user-alice',
      },
    }, createTestEnv(db))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: [{
        id: 'card-1',
        decisionId: 'decision-1',
        userId: 'user-alice',
        coreThesis: 'Tencent hold thesis',
        status: 'planned_holding',
        reviewFrequency: 'daily',
        nextReviewAt: '2026-06-24T00:00:00.000Z',
        createdAt: '2026-06-23T00:00:00.000Z',
        updatedAt: '2026-06-23T00:00:00.000Z',
        decision: {
          stockCode: '00700',
          stockName: 'Tencent',
          action: 'hold',
        },
      }],
    })

    const query = db.calls.find((call) => call.sql.includes('from discipline_cards dc'))
    expect(query?.sql).toContain('dc.user_id = ?')
    expect(query?.sql).toContain('d.user_id = ?')
    expect(query?.bindings).toEqual(['user-alice', 'user-alice'])
  })

  it('returns discipline card detail with trigger and review history scoped to one user', async () => {
    const db = new FakeD1Database((call) => {
      if (call.sql.includes('from discipline_cards dc') && call.sql.includes('where dc.id = ?')) {
        return {
          id: 'card-1',
          decision_id: 'decision-1',
          user_id: 'user-alice',
          core_thesis: 'Tencent hold thesis',
          evidence_sources: 'volume expansion',
          invalidation_condition: 'breaks support',
          monitoring_rules: 'Watch close below support',
          stop_loss_condition: 'support lost',
          take_profit_condition: 'trend exhaustion',
          status: 'planned_holding',
          review_frequency: 'daily',
          next_review_at: '2026-06-24T00:00:00.000Z',
          history: null,
          created_at: '2026-06-23T00:00:00.000Z',
          updated_at: '2026-06-23T00:00:00.000Z',
          stock_code: '00700',
          stock_name: 'Tencent',
          action: 'hold',
          rationale: 'wait for confirmation',
          risk: 'false breakout',
          planned_position: 0.25,
          exit_condition: 'thesis invalidated',
        }
      }

      if (call.sql.includes('from trigger_events te')) {
        return [{
          id: 'trigger-1',
          status: 'pending',
          trigger_type: 'price',
          triggered_condition: 'close below support',
          evidence_source: 'daily close',
          relation_to_plan: 'matches invalidation rule',
          suggested_actions: 'review position',
          created_at: '2026-06-24T01:00:00.000Z',
          updated_at: '2026-06-24T01:00:00.000Z',
        }]
      }

      if (call.sql.includes('from reviews r')) {
        return [{
          id: 'review-1',
          status: 'pending',
          execution_summary: null,
          adherence_result: null,
          attribution_tags: null,
          notes: null,
          created_at: '2026-06-24T02:00:00.000Z',
          updated_at: '2026-06-24T02:00:00.000Z',
        }]
      }

      return []
    })
    const app = createApp()

    const response = await app.request('/api/discipline-cards/card-1', {
      headers: {
        'x-user-id': 'user-alice',
      },
    }, createTestEnv(db))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      data: {
        id: 'card-1',
        decisionId: 'decision-1',
        decision: {
          stockCode: '00700',
          stockName: 'Tencent',
          action: 'hold',
          plannedPosition: 0.25,
        },
        triggerEvents: [{
          id: 'trigger-1',
          status: 'pending',
          triggerType: 'price',
        }],
        reviews: [{
          id: 'review-1',
          status: 'pending',
        }],
      },
    })

    const detailQuery = db.calls.find((call) => call.sql.includes('where dc.id = ?'))
    expect(detailQuery?.sql).toContain('dc.user_id = ?')
    expect(detailQuery?.sql).toContain('d.user_id = ?')
    expect(detailQuery?.bindings).toEqual(['card-1', 'user-alice', 'user-alice'])
    expect(db.calls.find((call) => call.sql.includes('from trigger_events te'))?.bindings).toEqual(['card-1', 'user-alice'])
    expect(db.calls.find((call) => call.sql.includes('from reviews r'))?.bindings).toEqual(['card-1', 'user-alice'])
  })

  it('returns not found when a discipline card is outside the user scope', async () => {
    const app = createApp()
    const response = await app.request('/api/discipline-cards/card-1', {
      headers: {
        'x-request-id': 'req-card-not-found',
        'x-user-id': 'user-alice',
      },
    }, createTestEnv(new FakeD1Database(() => null)))

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        code: 'not_found',
        message: 'Discipline card not found',
        requestId: 'req-card-not-found',
      },
    })
  })

  it('returns not implemented for placeholder APIs instead of successful empty data', async () => {
    const app = createApp()

    for (const path of ['/api/trigger-events', '/api/reviews']) {
      const response = await app.request(path, {
        headers: {
          'x-request-id': `req-${path.slice(5)}`,
        },
      }, createTestEnv())

      expect(response.status).toBe(501)
      await expect(response.json()).resolves.toMatchObject({
        ok: false,
        error: {
          code: 'not_implemented',
        },
      })
    }
  })
})
