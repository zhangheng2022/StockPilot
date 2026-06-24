import type { CreatedDecision, DecisionQualityCheck, DisciplineCardStatus, NewDecisionInput } from '../domain/types'
import type { WorkerEnv } from '../env'
import { DecisionRepository } from '../repositories/decisions'
import { DisciplineCardRepository } from '../repositories/discipline-cards'

type DecisionStore = Pick<DecisionRepository, 'create' | 'get' | 'list'>
type DisciplineCardStore = Pick<DisciplineCardRepository, 'create'>

export class DecisionService {
  constructor(
    private readonly decisions: DecisionStore,
    private readonly disciplineCards: DisciplineCardStore,
  ) {}

  async listDecisions(userId: string) {
    return this.decisions.list(userId)
  }

  async getDecision(id: string, userId: string) {
    return this.decisions.get(id, userId)
  }

  async createDecision(input: NewDecisionInput, userId: string): Promise<CreatedDecision> {
    const qualityCheck = createQualityCheck(input)
    const decision = await this.decisions.create(input, userId, {
      status: 'card_created',
      qualityCheck,
    })
    const disciplineCard = await this.disciplineCards.create({
      decisionId: decision.id,
      userId,
      coreThesis: `${input.stockName} ${input.action}: ${input.rationale}`,
      evidenceSources: input.evidence,
      invalidationCondition: input.invalidationCondition,
      monitoringRules: `Watch: ${input.invalidationCondition}. Exit: ${input.exitCondition}.`,
      stopLossCondition: input.invalidationCondition,
      takeProfitCondition: input.exitCondition,
      status: statusForAction(input.action),
      reviewFrequency: 'daily',
      nextReviewAt: nextDailyReviewAt(),
    })

    return {
      decision,
      disciplineCard,
    }
  }
}

export function createDecisionService(env: WorkerEnv) {
  return new DecisionService(new DecisionRepository(env), new DisciplineCardRepository(env))
}

function createQualityCheck(input: NewDecisionInput): DecisionQualityCheck {
  const highPosition = input.plannedPosition > 0.3

  return {
    verdict: highPosition ? 'warning' : 'pass',
    summary: highPosition
      ? 'Position size is elevated; confirm the risk budget before execution.'
      : 'Decision has the minimum thesis, evidence, risk, and exit logic required for a discipline card.',
    strengths: [
      `Thesis: ${input.rationale}`,
      `Evidence: ${input.evidence}`,
    ],
    vulnerabilities: [
      `Risk: ${input.risk}`,
      ...(highPosition ? ['Planned position is above the conservative review threshold.'] : []),
    ],
    recommendations: [
      `Invalidation: ${input.invalidationCondition}`,
      `Exit: ${input.exitCondition}`,
    ],
  }
}

function statusForAction(action: NewDecisionInput['action']): DisciplineCardStatus {
  if (action === 'sell' || action === 'reduce') return 'watching'
  return 'planned_holding'
}

function nextDailyReviewAt() {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
  return tomorrow.toISOString()
}
