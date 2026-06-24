import type { DisciplineCardStatus, TriggerEventStatus } from '../domain/types'
import type { WorkerEnv } from '../env'

export type DashboardTriggerRecord = {
  stockCode: string
  stockName: string
  status: TriggerEventStatus
  triggerType: string
  triggeredCondition: string
  evidenceSource: string | null
  relationToPlan: string | null
  suggestedActions: string | null
  createdAt: string
}

export type DashboardDisciplineCardRecord = {
  id: string
  decisionId: string
  coreThesis: string
  status: DisciplineCardStatus
  reviewFrequency: string
  nextReviewAt: string | null
  updatedAt: string
}

type DashboardTriggerRow = {
  stock_code: string
  stock_name: string
  status: TriggerEventStatus
  trigger_type: string
  triggered_condition: string
  evidence_source: string | null
  relation_to_plan: string | null
  suggested_actions: string | null
  created_at: string
}

type DashboardDisciplineCardRow = {
  id: string
  decision_id: string
  core_thesis: string
  status: DisciplineCardStatus
  review_frequency: string
  next_review_at: string | null
  updated_at: string
}

export class DashboardRepository {
  constructor(private readonly env: WorkerEnv) {}

  async listOpenTriggers(userId: string): Promise<DashboardTriggerRecord[]> {
    const { results } = await this.env.DB.prepare(`
      select
        d.stock_code,
        d.stock_name,
        te.status,
        te.trigger_type,
        te.triggered_condition,
        te.evidence_source,
        te.relation_to_plan,
        te.suggested_actions,
        te.created_at
      from trigger_events te
      join discipline_cards dc on dc.id = te.discipline_card_id
      join decisions d on d.id = dc.decision_id
      where te.user_id = ?
        and te.status in ('pending', 'confirmed')
      order by te.created_at desc
      limit 20
    `).bind(userId).all<DashboardTriggerRow>()

    return results.map(mapTriggerRow)
  }

  async listActiveCards(userId: string): Promise<DashboardDisciplineCardRecord[]> {
    const { results } = await this.env.DB.prepare(`
      select
        id,
        decision_id,
        core_thesis,
        status,
        review_frequency,
        next_review_at,
        updated_at
      from discipline_cards
      where user_id = ?
        and status in ('watching', 'planned_holding', 'needs_review', 'risk_triggered')
      order by next_review_at asc
      limit 20
    `).bind(userId).all<DashboardDisciplineCardRow>()

    return results.map(mapDisciplineCardRow)
  }
}

function mapTriggerRow(row: DashboardTriggerRow): DashboardTriggerRecord {
  return {
    stockCode: row.stock_code,
    stockName: row.stock_name,
    status: row.status,
    triggerType: row.trigger_type,
    triggeredCondition: row.triggered_condition,
    evidenceSource: row.evidence_source,
    relationToPlan: row.relation_to_plan,
    suggestedActions: row.suggested_actions,
    createdAt: row.created_at,
  }
}

function mapDisciplineCardRow(row: DashboardDisciplineCardRow): DashboardDisciplineCardRecord {
  return {
    id: row.id,
    decisionId: row.decision_id,
    coreThesis: row.core_thesis,
    status: row.status,
    reviewFrequency: row.review_frequency,
    nextReviewAt: row.next_review_at,
    updatedAt: row.updated_at,
  }
}
