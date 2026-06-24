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
  qualityCheck: unknown | null
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

export function isDecisionAction(value: unknown): value is DecisionAction {
  return typeof value === 'string' && decisionActions.includes(value as DecisionAction)
}

export function parseNewDecisionInput(value: unknown): ParseResult<NewDecisionInput> {
  const input = isObject(value) ? value : {}

  if (!input.stockCode) return validationError('stockCode is required')
  if (!input.stockName) return validationError('stockName is required')
  if (!isDecisionAction(input.action)) return validationError('action is invalid')
  if (!input.rationale) return validationError('rationale is required')
  if (!input.evidence) return validationError('evidence is required')
  if (!input.risk) return validationError('risk is required')
  if (typeof input.plannedPosition !== 'number') return validationError('plannedPosition is required')
  if (!input.invalidationCondition) return validationError('invalidationCondition is required')
  if (!input.exitCondition) return validationError('exitCondition is required')

  return {
    ok: true,
    data: {
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
