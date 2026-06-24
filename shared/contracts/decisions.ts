import type { ParseResult } from './http'

export const decisionActions = ['buy', 'add', 'reduce', 'hold', 'sell'] as const
export const decisionStatuses = ['draft', 'pending_quality_check', 'pending_confirmation', 'card_created', 'abandoned'] as const
export const disciplineCardStatuses = ['watching', 'planned_holding', 'needs_review', 'risk_triggered', 'closed'] as const
export const triggerEventStatuses = ['pending', 'confirmed', 'ignored', 'converted_to_review'] as const
export const reviewStatuses = ['pending', 'attributed', 'confirmed'] as const

export type DecisionAction = typeof decisionActions[number]
export type DecisionStatus = typeof decisionStatuses[number]
export type DisciplineCardStatus = typeof disciplineCardStatuses[number]
export type TriggerEventStatus = typeof triggerEventStatuses[number]
export type ReviewStatus = typeof reviewStatuses[number]

export type DecisionQualityCheck = {
  verdict: 'pass' | 'warning'
  summary: string
  strengths: string[]
  vulnerabilities: string[]
  recommendations: string[]
}

export type Decision = {
  id: string
  userId: string
  stockCode: string
  stockName: string
  action: DecisionAction
  rationale: string
  evidence: string
  risk: string
  plannedPosition: number
  invalidationCondition: string
  exitCondition: string
  status: DecisionStatus
  qualityCheck: DecisionQualityCheck | null
  createdAt: string
  updatedAt: string
}

export type NewDecisionInput = {
  stockCode: string
  stockName: string
  action: DecisionAction
  rationale: string
  evidence: string
  risk: string
  plannedPosition: number
  invalidationCondition: string
  exitCondition: string
}

export type DisciplineCard = {
  id: string
  decisionId: string
  userId: string
  coreThesis: string
  status: DisciplineCardStatus
  reviewFrequency: string
  nextReviewAt: string | null
  createdAt: string
  updatedAt: string
}

export type CreatedDecision = {
  decision: Decision
  disciplineCard: DisciplineCard
}

export type DisciplineCardListItem = DisciplineCard & {
  decision: {
    stockCode: string
    stockName: string
    action: DecisionAction
  }
}

export type TriggerEventHistoryItem = {
  id: string
  status: TriggerEventStatus
  triggerType: string
  triggeredCondition: string
  evidenceSource: string | null
  relationToPlan: string | null
  suggestedActions: string | null
  createdAt: string
  updatedAt: string
}

export type ReviewHistoryItem = {
  id: string
  status: ReviewStatus
  executionSummary: string | null
  adherenceResult: string | null
  attributionTags: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type DisciplineCardDetail = DisciplineCard & {
  evidenceSources: string | null
  invalidationCondition: string | null
  monitoringRules: string | null
  stopLossCondition: string | null
  takeProfitCondition: string | null
  history: string | null
  decision: {
    stockCode: string
    stockName: string
    action: DecisionAction
    rationale: string
    risk: string
    plannedPosition: number
    exitCondition: string
  }
  triggerEvents: TriggerEventHistoryItem[]
  reviews: ReviewHistoryItem[]
}

export function isDecisionAction(value: unknown): value is DecisionAction {
  return typeof value === 'string' && decisionActions.includes(value as DecisionAction)
}

export function parseNewDecisionInput(value: unknown): ParseResult<NewDecisionInput> {
  const input = isObject(value) ? value : {}

  const stockCode = stringField(input.stockCode)
  const stockName = stringField(input.stockName)
  const rationale = stringField(input.rationale)
  const evidence = stringField(input.evidence)
  const risk = stringField(input.risk)
  const invalidationCondition = stringField(input.invalidationCondition)
  const exitCondition = stringField(input.exitCondition)

  if (!stockCode) return validationError('stockCode is required')
  if (!stockName) return validationError('stockName is required')
  if (!isDecisionAction(input.action)) return validationError('action is invalid')
  if (!rationale) return validationError('rationale is required')
  if (!evidence) return validationError('evidence is required')
  if (!risk) return validationError('risk is required')
  if (typeof input.plannedPosition !== 'number') return validationError('plannedPosition is required')
  if (!Number.isFinite(input.plannedPosition)) return validationError('plannedPosition must be a finite number')
  if (input.plannedPosition < 0 || input.plannedPosition > 1) return validationError('plannedPosition must be between 0 and 1')
  if (!invalidationCondition) return validationError('invalidationCondition is required')
  if (!exitCondition) return validationError('exitCondition is required')

  return {
    ok: true,
    data: {
      stockCode,
      stockName,
      action: input.action,
      rationale,
      evidence,
      risk,
      plannedPosition: input.plannedPosition,
      invalidationCondition,
      exitCondition,
    },
  }
}

function validationError(message: string): ParseResult<NewDecisionInput> {
  return {
    ok: false,
    code: 'validation_error',
    message,
  }
}

function isObject(value: unknown): value is Partial<NewDecisionInput> {
  return typeof value === 'object' && value !== null
}

function stringField(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}
