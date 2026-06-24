import { Hono } from 'hono'
import { HttpError } from '../http/errors'
import { successResponse } from '../http/responses'
import type { AppBindings } from '../http/types'
import { DisciplineCardRepository } from '../repositories/discipline-cards'

export function createDisciplineCardRoutes() {
  const app = new Hono<AppBindings>()

  app.get('/', async (c) => {
    const cards = await new DisciplineCardRepository(c.env).listForUser(c.get('userId'))

    return successResponse(c, cards)
  })

  app.get('/:id', async (c) => {
    const card = await new DisciplineCardRepository(c.env).getDetail(c.req.param('id'), c.get('userId'))

    if (!card) {
      throw new HttpError('not_found', 'Discipline card not found', 404)
    }

    return successResponse(c, card)
  })

  return app
}
