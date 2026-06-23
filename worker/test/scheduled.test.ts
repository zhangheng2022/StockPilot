import { describe, expect, it } from 'vitest'
import { scanDisciplineCards } from '../src/jobs/scan-discipline-cards'
import { createTestEnv, FakeD1Database } from './fake-d1'

describe('scheduled discipline card scan', () => {
  it('loads cards that are due for review', async () => {
    const db = new FakeD1Database((call) => {
      if (call.sql.includes('from discipline_cards')) {
        return [{
          id: 'card-1',
          decision_id: 'decision-1',
          user_id: 'local-user',
          core_thesis: '趋势仍然成立',
          status: 'needs_review',
          review_frequency: 'daily',
          next_review_at: '2026-06-23T00:00:00.000Z',
          created_at: '2026-06-23T00:00:00.000Z',
          updated_at: '2026-06-23T00:00:00.000Z',
        }]
      }
      return []
    })

    const result = await scanDisciplineCards(createTestEnv(db), new Date('2026-06-23T01:00:00.000Z'))

    expect(result.scanned).toBe(1)
    expect(db.calls.some((call) => call.sql.includes('from discipline_cards'))).toBe(true)
    expect(db.calls.some((call) => (
      call.sql.includes('insert into job_runs') && call.bindings.includes('discipline_card_scan')
    ))).toBe(true)
  })
})
