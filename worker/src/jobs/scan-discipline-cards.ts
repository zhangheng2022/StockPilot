import { DisciplineCardRepository } from '../repositories/discipline-cards'
import type { WorkerEnv } from '../env'

export type DisciplineCardScanResult = {
  scanned: number
}

export async function scanDisciplineCards(env: WorkerEnv, now = new Date()): Promise<DisciplineCardScanResult> {
  const cards = await new DisciplineCardRepository(env).listDueForReview(now)

  return {
    scanned: cards.length,
  }
}
