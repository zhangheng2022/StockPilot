import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { parseNewDecisionInput, type NewDecisionInput } from '../domain/types'
import { HttpError } from '../http/errors'
import { successResponse } from '../http/responses'
import type { AppBindings } from '../http/types'
import { createDecisionService } from '../services/decision-service'

export function createDecisionRoutes() {
  const app = new Hono<AppBindings>()

  app.get('/', async (c) => {
    const decisions = await createDecisionService(c.env).listDecisions(c.get('userId'))
    return successResponse(c, decisions)
  })

  app.get('/:id', async (c) => {
    const decision = await createDecisionService(c.env).getDecision(c.req.param('id'), c.get('userId'))

    if (!decision) {
      throw new HttpError('not_found', 'Decision not found', 404)
    }

    return successResponse(c, decision)
  })

  app.post('/', validateDecisionJson(), async (c) => {
    const input = c.req.valid('json')
    const decision = await createDecisionService(c.env).createDecision(input, c.get('userId'))

    return successResponse(c, decision, 201)
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
  const result = parseNewDecisionInput(value)

  if (!result.ok) {
    throw new HttpError(result.code, result.message)
  }

  return result.data
}
