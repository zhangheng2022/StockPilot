import { describe, expect, it } from 'vitest'
import { parseNewDecisionInput } from './decisions'

describe('decision contract', () => {
  it('parses valid decision input into the shared API shape', () => {
    expect(parseNewDecisionInput({
      stockCode: '600519',
      stockName: '贵州茅台',
      action: 'buy',
      rationale: '基本面稳定',
      evidence: '盈利质量较高',
      risk: '估值偏高',
      plannedPosition: 0.1,
      invalidationCondition: '业绩连续低于预期',
      exitCondition: '跌破纪律条件',
    })).toEqual({
      ok: true,
      data: {
        stockCode: '600519',
        stockName: '贵州茅台',
        action: 'buy',
        rationale: '基本面稳定',
        evidence: '盈利质量较高',
        risk: '估值偏高',
        plannedPosition: 0.1,
        invalidationCondition: '业绩连续低于预期',
        exitCondition: '跌破纪律条件',
      },
    })
  })

  it('returns field-level validation errors without throwing', () => {
    expect(parseNewDecisionInput({
      stockCode: '600519',
      action: 'watch',
    })).toEqual({
      ok: false,
      code: 'validation_error',
      message: 'stockName is required',
    })
  })
})
