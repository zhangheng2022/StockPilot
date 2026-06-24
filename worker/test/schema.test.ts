/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { decisionActions, decisionStatuses, disciplineCardStatuses, reviewStatuses, triggerEventStatuses } from '../src/domain/types'

const root = resolve(import.meta.dirname, '../..')

describe('database schema alignment', () => {
  it('keeps D1 decision constraints aligned with domain enums', () => {
    const initialMigration = readMigration('0001_initial.sql')
    const alignmentMigration = readMigration('0002_align_domain_constraints_and_job_runs.sql')

    expect(extractCheckValues(initialMigration, 'decisions', 'action')).toEqual([...decisionActions])
    expect(extractCheckValues(initialMigration, 'decisions', 'status')).toEqual([...decisionStatuses])
    expect(extractCheckValues(alignmentMigration, 'decisions_new', 'action')).toEqual([...decisionActions])
    expect(extractCheckValues(alignmentMigration, 'decisions_new', 'status')).toEqual([...decisionStatuses])
  })

  it('keeps remaining D1 status constraints aligned with domain enums', () => {
    const initialMigration = readMigration('0001_initial.sql')
    const alignmentMigration = readMigration('0002_align_domain_constraints_and_job_runs.sql')

    expect(extractCheckValues(initialMigration, 'discipline_cards', 'status')).toEqual([...disciplineCardStatuses])
    expect(extractCheckValues(initialMigration, 'trigger_events', 'status')).toEqual([...triggerEventStatuses])
    expect(extractCheckValues(initialMigration, 'reviews', 'status')).toEqual([...reviewStatuses])
    expect(extractCheckValues(alignmentMigration, 'discipline_cards_new', 'status')).toEqual([...disciplineCardStatuses])
    expect(extractCheckValues(alignmentMigration, 'trigger_events_new', 'status')).toEqual([...triggerEventStatuses])
    expect(extractCheckValues(alignmentMigration, 'reviews_new', 'status')).toEqual([...reviewStatuses])
  })

  it('declares the worker migrations directory in Wrangler config', () => {
    const wrangler = readFileSync(resolve(root, 'wrangler.jsonc'), 'utf8')

    expect(wrangler).toContain('"migrations_dir": "worker/migrations"')
  })
})

function readMigration(filename: string) {
  return readFileSync(resolve(root, 'worker/migrations', filename), 'utf8')
}

function extractCheckValues(sql: string, table: string, column: string) {
  const tableMatch = sql.match(new RegExp(`create table if not exists ${table} \\(([\\s\\S]*?)\\n\\);`, 'i'))
  expect(tableMatch).not.toBeNull()

  const columnMatch = tableMatch?.[1].match(new RegExp(`${column} text[^\\n]*check \\(${column} in \\(([^)]*)\\)\\)`, 'i'))
  expect(columnMatch).not.toBeNull()

  return columnMatch?.[1].split(',').map((value) => value.trim().replace(/^'|'$/g, '')) ?? []
}
