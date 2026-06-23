import type { WorkerEnv } from '../env'

type JobRunInput = {
  jobName: string
  status: 'succeeded' | 'failed'
  scannedCount: number
  createdCount: number
  errorMessage: string | null
  startedAt: string
  finishedAt: string
}

export class JobRunRepository {
  constructor(private readonly env: WorkerEnv) {}

  async create(input: JobRunInput) {
    await this.env.DB.prepare(`
      insert into job_runs (
        id,
        job_name,
        status,
        scanned_count,
        created_count,
        error_message,
        started_at,
        finished_at
      ) values (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(),
      input.jobName,
      input.status,
      input.scannedCount,
      input.createdCount,
      input.errorMessage,
      input.startedAt,
      input.finishedAt,
    ).run()
  }
}
