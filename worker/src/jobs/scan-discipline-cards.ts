import { DisciplineCardRepository } from '../repositories/discipline-cards'
import type { WorkerEnv } from '../env'
import { JobRunRepository } from '../repositories/job-runs'

export type DisciplineCardScanResult = {
  scanned: number
  created: number
}

export async function scanDisciplineCards(env: WorkerEnv, now = new Date()): Promise<DisciplineCardScanResult> {
  const startedAt = now.toISOString()
  const jobRuns = new JobRunRepository(env)

  try {
    const cards = await new DisciplineCardRepository(env).listDueForReview(now)
    const result = {
      scanned: cards.length,
      created: 0,
    }

    await jobRuns.create({
      jobName: 'discipline_card_scan',
      status: 'succeeded',
      scannedCount: result.scanned,
      createdCount: result.created,
      errorMessage: null,
      startedAt,
      finishedAt: new Date().toISOString(),
    })

    return result
  } catch (error) {
    await jobRuns.create({
      jobName: 'discipline_card_scan',
      status: 'failed',
      scannedCount: 0,
      createdCount: 0,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      startedAt,
      finishedAt: new Date().toISOString(),
    })

    throw error
  }
}
