import { describe, expect, it } from 'vitest'
import { createDecisionService } from '../src/services/decision-service'
import { createTestEnv, FakeD1Database } from './fake-d1'

describe('decision service', () => {
  it('keeps decision listing and creation behind a service boundary', async () => {
    const rows = [{
      id: 'decision-1',
      user_id: 'user-service',
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
    const service = createDecisionService(createTestEnv(db))

    await service.createDecision({
      stockCode: '600519',
      stockName: '贵州茅台',
      action: 'buy',
      rationale: '基本面稳定',
      evidence: '盈利质量较高',
      risk: '估值偏高',
      plannedPosition: 0.1,
      invalidationCondition: '业绩连续低于预期',
      exitCondition: '跌破纪律条件',
    }, 'user-service')

    const decisions = await service.listDecisions('user-service')

    expect(db.calls.some((call) => (
      call.sql.includes('insert into decisions') && call.bindings.includes('user-service')
    ))).toBe(true)
    expect(db.calls.some((call) => (
      call.sql.includes('insert into discipline_cards') && call.bindings.includes('user-service')
    ))).toBe(true)
    expect(decisions).toHaveLength(1)
    expect(decisions[0]?.userId).toBe('user-service')
  })

  it('returns the created decision with a generated quality check and discipline card', async () => {
    const db = new FakeD1Database()
    const service = createDecisionService(createTestEnv(db))

    const result = await service.createDecision({
      stockCode: '00700',
      stockName: 'Tencent',
      action: 'hold',
      rationale: 'wait for confirmation',
      evidence: 'volume expansion',
      risk: 'false breakout',
      plannedPosition: 0.25,
      invalidationCondition: 'breaks support',
      exitCondition: 'thesis invalidated',
    }, 'user-service')

    expect(result.decision).toMatchObject({
      userId: 'user-service',
      stockCode: '00700',
      status: 'card_created',
      qualityCheck: {
        verdict: 'pass',
      },
    })
    expect(result.disciplineCard).toMatchObject({
      userId: 'user-service',
      decisionId: result.decision.id,
      coreThesis: 'Tencent hold: wait for confirmation',
      status: 'planned_holding',
      reviewFrequency: 'daily',
    })
  })
})
