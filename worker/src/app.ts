import { Hono } from 'hono'
import { isDecisionAction, type NewDecisionInput } from './domain/types'
import type { WorkerEnv } from './env'
import { DecisionRepository } from './repositories/decisions'

type HonoBindings = {
  Bindings: WorkerEnv
}

export function createApp() {
  const app = new Hono<HonoBindings>()

  app.get('/api/health', (c) => c.json({
    ok: true,
    service: 'stock-pilot-worker',
  }))

  app.get('/api/decisions', async (c) => {
    const decisions = await new DecisionRepository(c.env).list()
    return c.json({
      data: decisions,
    })
  })

  app.post('/api/decisions', async (c) => {
    const body = await c.req.json<Partial<NewDecisionInput>>()
    const parsed = parseNewDecisionInput(body)

    if ('error' in parsed) {
      return c.json({
        error: parsed.error,
      }, 400)
    }

    const decision = await new DecisionRepository(c.env).create(parsed.input)

    return c.json({
      data: decision,
    }, 201)
  })

  app.get('/api/discipline-cards', (c) => c.json({
    data: [],
  }))

  app.get('/api/trigger-events', (c) => c.json({
    data: [],
  }))

  app.get('/api/reviews', (c) => c.json({
    data: [],
  }))

  return app
}

function parseNewDecisionInput(input: Partial<NewDecisionInput>): { input: NewDecisionInput } | { error: string } {
  if (!input.stockCode) return { error: 'stockCode is required' }
  if (!input.stockName) return { error: 'stockName is required' }
  if (!isDecisionAction(input.action)) return { error: 'action is invalid' }
  if (!input.rationale) return { error: 'rationale is required' }
  if (!input.evidence) return { error: 'evidence is required' }
  if (!input.risk) return { error: 'risk is required' }
  if (typeof input.plannedPosition !== 'number') return { error: 'plannedPosition is required' }
  if (!input.invalidationCondition) return { error: 'invalidationCondition is required' }
  if (!input.exitCondition) return { error: 'exitCondition is required' }

  return {
    input: {
      stockCode: input.stockCode,
      stockName: input.stockName,
      action: input.action,
      rationale: input.rationale,
      evidence: input.evidence,
      risk: input.risk,
      plannedPosition: input.plannedPosition,
      invalidationCondition: input.invalidationCondition,
      exitCondition: input.exitCondition,
    },
  }
}
