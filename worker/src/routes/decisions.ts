import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { isDecisionAction, type NewDecisionInput } from '../domain/types'
import { HttpError } from '../http/errors'
import type { AppBindings } from '../http/types'
import { DecisionRepository } from '../repositories/decisions'

export function createDecisionRoutes() {
  const app = new Hono<AppBindings>()

  app.get('/', async (c) => {
    const decisions = await new DecisionRepository(c.env).list(c.get('userId'))
    return c.json({
      data: decisions,
    })
  })

  app.post('/', validateDecisionJson(), async (c) => {
    const input = c.req.valid('json')
    const decision = await new DecisionRepository(c.env).create(input, c.get('userId'))

    return c.json({
      data: decision,
    }, 201)
  })

  return app
}

function validateDecisionJson() {
  return validator('json', (value, c): NewDecisionInput => {
    const contentType = c.req.header('content-type') || ''

    if (!contentType.toLowerCase().includes('application/json')) {
      throw new HttpError('bad_request', 'Content-Type must be application/json')
    }

    return validateNewDecisionInput(value)
  })
}

function validateNewDecisionInput(value: unknown): NewDecisionInput {
  const input = isObject(value) ? value : {}

  if (!input.stockCode) throw new HttpError('validation_error', 'stockCode is required')
  if (!input.stockName) throw new HttpError('validation_error', 'stockName is required')
  if (!isDecisionAction(input.action)) throw new HttpError('validation_error', 'action is invalid')
  if (!input.rationale) throw new HttpError('validation_error', 'rationale is required')
  if (!input.evidence) throw new HttpError('validation_error', 'evidence is required')
  if (!input.risk) throw new HttpError('validation_error', 'risk is required')
  if (typeof input.plannedPosition !== 'number') throw new HttpError('validation_error', 'plannedPosition is required')
  if (!input.invalidationCondition) throw new HttpError('validation_error', 'invalidationCondition is required')
  if (!input.exitCondition) throw new HttpError('validation_error', 'exitCondition is required')

  return {
    stockCode: input.stockCode,
    stockName: input.stockName,
    action: input.action,
    rationale: input.rationale,
    evidence: input.evidence,
    risk: input.risk,
    plannedPosition: input.plannedPosition,
    invalidationCondition: input.invalidationCondition,
    exitCondition: input.exitCondition,
  }
}

function isObject(value: unknown): value is Partial<NewDecisionInput> {
  return typeof value === 'object' && value !== null
}
