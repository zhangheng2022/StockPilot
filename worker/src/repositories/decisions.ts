import type { Decision, DecisionStatus, NewDecisionInput } from '../domain/types'
import type { WorkerEnv } from '../env'

type DecisionRow = {
  id: string
  user_id: string
  stock_code: string
  stock_name: string
  action: Decision['action']
  rationale: string
  evidence: string
  risk: string
  planned_position: number
  invalidation_condition: string
  exit_condition: string
  status: DecisionStatus
  quality_check: string | null
  created_at: string
  updated_at: string
}

export class DecisionRepository {
  constructor(private readonly env: WorkerEnv) {}

  async list(userId: string) {
    const { results } = await this.env.DB.prepare(`
      select
        id,
        user_id,
        stock_code,
        stock_name,
        action,
        rationale,
        evidence,
        risk,
        planned_position,
        invalidation_condition,
        exit_condition,
        status,
        quality_check,
        created_at,
        updated_at
      from decisions
      where user_id = ?
      order by created_at desc
    `).bind(userId).all<DecisionRow>()

    return results.map(mapDecisionRow)
  }

  async create(input: NewDecisionInput, userId: string) {
    const now = new Date().toISOString()
    const decision: Decision = {
      id: crypto.randomUUID(),
      userId,
      stockCode: input.stockCode,
      stockName: input.stockName,
      action: input.action,
      rationale: input.rationale,
      evidence: input.evidence,
      risk: input.risk,
      plannedPosition: input.plannedPosition,
      invalidationCondition: input.invalidationCondition,
      exitCondition: input.exitCondition,
      status: 'draft',
      qualityCheck: null,
      createdAt: now,
      updatedAt: now,
    }

    await this.env.DB.prepare(`
      insert into decisions (
        id,
        user_id,
        stock_code,
        stock_name,
        action,
        rationale,
        evidence,
        risk,
        planned_position,
        invalidation_condition,
        exit_condition,
        status,
        quality_check,
        created_at,
        updated_at
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      decision.id,
      decision.userId,
      decision.stockCode,
      decision.stockName,
      decision.action,
      decision.rationale,
      decision.evidence,
      decision.risk,
      decision.plannedPosition,
      decision.invalidationCondition,
      decision.exitCondition,
      decision.status,
      decision.qualityCheck,
      decision.createdAt,
      decision.updatedAt,
    ).run()

    return decision
  }
}

function mapDecisionRow(row: DecisionRow): Decision {
  return {
    id: row.id,
    userId: row.user_id,
    stockCode: row.stock_code,
    stockName: row.stock_name,
    action: row.action,
    rationale: row.rationale,
    evidence: row.evidence,
    risk: row.risk,
    plannedPosition: row.planned_position,
    invalidationCondition: row.invalidation_condition,
    exitCondition: row.exit_condition,
    status: row.status,
    qualityCheck: parseJsonOrNull(row.quality_check),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function parseJsonOrNull(value: string | null) {
  if (!value) return null

  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}
