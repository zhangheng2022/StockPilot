/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { decisionActions, decisionStatuses, disciplineCardStatuses, reviewStatuses, triggerEventStatuses } from '../src/domain/types'

const root = resolve(import.meta.dirname, '../..')

describe('database schema alignment', () => {
  it('keeps D1 decision constraints aligned with domain enums', () => {
    const migration = readFileSync(resolve(root, 'worker/migrations/0001_initial.sql'), 'utf8')

    expect(extractCheckValues(migration, 'decisions', 'action')).toEqual([...decisionActions])
    expect(extractCheckValues(migration, 'decisions', 'status')).toEqual([...decisionStatuses])
  })

  it('keeps remaining D1 status constraints aligned with domain enums', () => {
    const migration = readFileSync(resolve(root, 'worker/migrations/0001_initial.sql'), 'utf8')

    expect(extractCheckValues(migration, 'discipline_cards', 'status')).toEqual([...disciplineCardStatuses])
    expect(extractCheckValues(migration, 'trigger_events', 'status')).toEqual([...triggerEventStatuses])
    expect(extractCheckValues(migration, 'reviews', 'status')).toEqual([...reviewStatuses])
  })

  it('declares the worker migrations directory in Wrangler config', () => {
    const wrangler = readFileSync(resolve(root, 'wrangler.jsonc'), 'utf8')

    expect(wrangler).toContain('"migrations_dir": "worker/migrations"')
  })
})

function extractCheckValues(sql: string, table: string, column: string) {
  const tableMatch = sql.match(new RegExp(`create table if not exists ${table} \\(([\\s\\S]*?)\\n\\);`, 'i'))
  expect(tableMatch).not.toBeNull()

  const columnMatch = tableMatch?.[1].match(new RegExp(`${column} text[^\\n]*check \\(${column} in \\(([^)]*)\\)\\)`, 'i'))
  expect(columnMatch).not.toBeNull()

  return columnMatch?.[1].split(',').map((value) => value.trim().replace(/^'|'$/g, '')) ?? []
}
