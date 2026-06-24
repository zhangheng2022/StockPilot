import type {
  DecisionAction,
  DisciplineCard,
  DisciplineCardDetail,
  DisciplineCardListItem,
  DisciplineCardStatus,
  ReviewHistoryItem,
  ReviewStatus,
  TriggerEventHistoryItem,
  TriggerEventStatus,
} from '../domain/types'
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

type CreateDisciplineCardInput = {
  decisionId: string
  userId: string
  coreThesis: string
  evidenceSources: string | null
  invalidationCondition: string
  monitoringRules: string
  stopLossCondition: string
  takeProfitCondition: string
  status: DisciplineCardStatus
  reviewFrequency: string
  nextReviewAt: string
}

type DisciplineCardListRow = DisciplineCardRow & {
  stock_code: string
  stock_name: string
  action: DecisionAction
}

type DisciplineCardDetailRow = DisciplineCardListRow & {
  evidence_sources: string | null
  invalidation_condition: string | null
  monitoring_rules: string | null
  stop_loss_condition: string | null
  take_profit_condition: string | null
  history: string | null
  rationale: string
  risk: string
  planned_position: number
  exit_condition: string
}

type TriggerEventRow = {
  id: string
  status: TriggerEventStatus
  trigger_type: string
  triggered_condition: string
  evidence_source: string | null
  relation_to_plan: string | null
  suggested_actions: string | null
  created_at: string
  updated_at: string
}

type ReviewRow = {
  id: string
  status: ReviewStatus
  execution_summary: string | null
  adherence_result: string | null
  attribution_tags: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export class DisciplineCardRepository {
  constructor(private readonly env: WorkerEnv) {}

  async create(input: CreateDisciplineCardInput): Promise<DisciplineCard> {
    const now = new Date().toISOString()
    const card: DisciplineCard = {
      id: crypto.randomUUID(),
      decisionId: input.decisionId,
      userId: input.userId,
      coreThesis: input.coreThesis,
      status: input.status,
      reviewFrequency: input.reviewFrequency,
      nextReviewAt: input.nextReviewAt,
      createdAt: now,
      updatedAt: now,
    }

    await this.env.DB.prepare(`
      insert into discipline_cards (
        id,
        decision_id,
        user_id,
        core_thesis,
        evidence_sources,
        invalidation_condition,
        monitoring_rules,
        stop_loss_condition,
        take_profit_condition,
        status,
        review_frequency,
        next_review_at,
        history,
        created_at,
        updated_at
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      card.id,
      card.decisionId,
      card.userId,
      card.coreThesis,
      input.evidenceSources,
      input.invalidationCondition,
      input.monitoringRules,
      input.stopLossCondition,
      input.takeProfitCondition,
      card.status,
      card.reviewFrequency,
      card.nextReviewAt,
      null,
      card.createdAt,
      card.updatedAt,
    ).run()

    return card
  }

  async listForUser(userId: string): Promise<DisciplineCardListItem[]> {
    const { results } = await this.env.DB.prepare(`
      select
        dc.id,
        dc.decision_id,
        dc.user_id,
        dc.core_thesis,
        dc.status,
        dc.review_frequency,
        dc.next_review_at,
        dc.created_at,
        dc.updated_at,
        d.stock_code,
        d.stock_name,
        d.action
      from discipline_cards dc
      join decisions d on d.id = dc.decision_id
      where dc.user_id = ?
        and d.user_id = ?
      order by dc.updated_at desc
    `).bind(userId, userId).all<DisciplineCardListRow>()

    return results.map(mapDisciplineCardListRow)
  }

  async getDetail(cardId: string, userId: string): Promise<DisciplineCardDetail | null> {
    const card = await this.env.DB.prepare(`
      select
        dc.id,
        dc.decision_id,
        dc.user_id,
        dc.core_thesis,
        dc.evidence_sources,
        dc.invalidation_condition,
        dc.monitoring_rules,
        dc.stop_loss_condition,
        dc.take_profit_condition,
        dc.status,
        dc.review_frequency,
        dc.next_review_at,
        dc.history,
        dc.created_at,
        dc.updated_at,
        d.stock_code,
        d.stock_name,
        d.action,
        d.rationale,
        d.risk,
        d.planned_position,
        d.exit_condition
      from discipline_cards dc
      join decisions d on d.id = dc.decision_id
      where dc.id = ?
        and dc.user_id = ?
        and d.user_id = ?
      limit 1
    `).bind(cardId, userId, userId).first<DisciplineCardDetailRow>()

    if (!card) return null

    const [triggerEvents, reviews] = await Promise.all([
      this.listTriggerEvents(cardId, userId),
      this.listReviews(cardId, userId),
    ])

    return mapDisciplineCardDetailRow(card, triggerEvents, reviews)
  }

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

  private async listTriggerEvents(cardId: string, userId: string): Promise<TriggerEventHistoryItem[]> {
    const { results } = await this.env.DB.prepare(`
      select
        te.id,
        te.status,
        te.trigger_type,
        te.triggered_condition,
        te.evidence_source,
        te.relation_to_plan,
        te.suggested_actions,
        te.created_at,
        te.updated_at
      from trigger_events te
      where te.discipline_card_id = ?
        and te.user_id = ?
      order by te.created_at desc
      limit 50
    `).bind(cardId, userId).all<TriggerEventRow>()

    return results.map(mapTriggerEventRow)
  }

  private async listReviews(cardId: string, userId: string): Promise<ReviewHistoryItem[]> {
    const { results } = await this.env.DB.prepare(`
      select
        r.id,
        r.status,
        r.execution_summary,
        r.adherence_result,
        r.attribution_tags,
        r.notes,
        r.created_at,
        r.updated_at
      from reviews r
      where r.discipline_card_id = ?
        and r.user_id = ?
      order by r.created_at desc
      limit 50
    `).bind(cardId, userId).all<ReviewRow>()

    return results.map(mapReviewRow)
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

function mapDisciplineCardListRow(row: DisciplineCardListRow): DisciplineCardListItem {
  return {
    ...mapDisciplineCardRow(row),
    decision: {
      stockCode: row.stock_code,
      stockName: row.stock_name,
      action: row.action,
    },
  }
}

function mapDisciplineCardDetailRow(
  row: DisciplineCardDetailRow,
  triggerEvents: TriggerEventHistoryItem[],
  reviews: ReviewHistoryItem[],
): DisciplineCardDetail {
  return {
    ...mapDisciplineCardRow(row),
    evidenceSources: row.evidence_sources,
    invalidationCondition: row.invalidation_condition,
    monitoringRules: row.monitoring_rules,
    stopLossCondition: row.stop_loss_condition,
    takeProfitCondition: row.take_profit_condition,
    history: row.history,
    decision: {
      stockCode: row.stock_code,
      stockName: row.stock_name,
      action: row.action,
      rationale: row.rationale,
      risk: row.risk,
      plannedPosition: row.planned_position,
      exitCondition: row.exit_condition,
    },
    triggerEvents,
    reviews,
  }
}

function mapTriggerEventRow(row: TriggerEventRow): TriggerEventHistoryItem {
  return {
    id: row.id,
    status: row.status,
    triggerType: row.trigger_type,
    triggeredCondition: row.triggered_condition,
    evidenceSource: row.evidence_source,
    relationToPlan: row.relation_to_plan,
    suggestedActions: row.suggested_actions,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapReviewRow(row: ReviewRow): ReviewHistoryItem {
  return {
    id: row.id,
    status: row.status,
    executionSummary: row.execution_summary,
    adherenceResult: row.adherence_result,
    attributionTags: row.attribution_tags,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
