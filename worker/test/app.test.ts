import { describe, expect, it } from 'vitest'
import { createApp } from '../src/app'
import { asD1Database, FakeD1Database } from './fake-d1'

describe('worker api', () => {
  it('returns health status', async () => {
    const app = createApp()
    const db = new FakeD1Database()
    const response = await app.request('/api/health', {}, {
      DB: asD1Database(db),
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      ok: true,
      service: 'stock-pilot-worker',
    })
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
    }, {
      DB: asD1Database(db),
    })

    expect(createResponse.status).toBe(201)
    expect(db.calls.some((call) => call.sql.includes('insert into decisions'))).toBe(true)

    const listResponse = await app.request('/api/decisions', {}, {
      DB: asD1Database(db),
    })

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
})
