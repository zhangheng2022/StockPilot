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

  it('normalizes text input and validates planned position boundaries', () => {
    expect(parseNewDecisionInput({
      stockCode: ' 00700 ',
      stockName: ' Tencent ',
      action: 'hold',
      rationale: ' wait for confirmation ',
      evidence: ' volume expansion ',
      risk: ' false breakout ',
      plannedPosition: 0.25,
      invalidationCondition: ' breaks support ',
      exitCondition: ' thesis invalidated ',
    })).toMatchObject({
      ok: true,
      data: {
        stockCode: '00700',
        stockName: 'Tencent',
        rationale: 'wait for confirmation',
        evidence: 'volume expansion',
        risk: 'false breakout',
        invalidationCondition: 'breaks support',
        exitCondition: 'thesis invalidated',
      },
    })

    expect(parseNewDecisionInput({
      stockCode: '00700',
      stockName: 'Tencent',
      action: 'hold',
      rationale: 'wait for confirmation',
      evidence: 'volume expansion',
      risk: 'false breakout',
      plannedPosition: Number.NaN,
      invalidationCondition: 'breaks support',
      exitCondition: 'thesis invalidated',
    })).toEqual({
      ok: false,
      code: 'validation_error',
      message: 'plannedPosition must be a finite number',
    })

    expect(parseNewDecisionInput({
      stockCode: '00700',
      stockName: 'Tencent',
      action: 'hold',
      rationale: 'wait for confirmation',
      evidence: 'volume expansion',
      risk: 'false breakout',
      plannedPosition: 1.2,
      invalidationCondition: 'breaks support',
      exitCondition: 'thesis invalidated',
    })).toEqual({
      ok: false,
      code: 'validation_error',
      message: 'plannedPosition must be between 0 and 1',
    })
  })
})
