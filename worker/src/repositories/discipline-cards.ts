import type { DisciplineCard, DisciplineCardStatus } from '../domain/types'
import type { WorkerEnv } from '../env'

type DisciplineCardRow = {
  id: string
  decision_id: string
  user_id: string
  core_thesis: string
  status: DisciplineCardStatus
  review_frequency: string
  next_review_at: string | null
  created_at: string
  updated_at: string
}

export class DisciplineCardRepository {
  constructor(private readonly env: WorkerEnv) {}

  async listDueForReview(now: Date) {
    const { results } = await this.env.DB.prepare(`
      select
        id,
        decision_id,
        user_id,
        core_thesis,
        status,
        review_frequency,
        next_review_at,
        created_at,
        updated_at
      from discipline_cards
      where status in ('needs_review', 'planned_holding', 'watching')
        and next_review_at is not null
        and next_review_at <= ?
      order by next_review_at asc
      limit 100
    `).bind(now.toISOString()).all<DisciplineCardRow>()

    return results.map(mapDisciplineCardRow)
  }
}

function mapDisciplineCardRow(row: DisciplineCardRow): DisciplineCard {
  return {
    id: row.id,
    decisionId: row.decision_id,
    userId: row.user_id,
    coreThesis: row.core_thesis,
    status: row.status,
    reviewFrequency: row.review_frequency,
    nextReviewAt: row.next_review_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
