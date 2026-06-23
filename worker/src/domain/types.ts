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
