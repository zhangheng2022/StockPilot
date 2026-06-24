import type { NewDecisionInput } from '../domain/types'
import type { WorkerEnv } from '../env'
import { DecisionRepository } from '../repositories/decisions'

type DecisionStore = Pick<DecisionRepository, 'create' | 'list'>

export class DecisionService {
  constructor(private readonly decisions: DecisionStore) {}

  async listDecisions(userId: string) {
    return this.decisions.list(userId)
  }

  async createDecision(input: NewDecisionInput, userId: string) {
    return this.decisions.create(input, userId)
  }
}

export function createDecisionService(env: WorkerEnv) {
  return new DecisionService(new DecisionRepository(env))
}
