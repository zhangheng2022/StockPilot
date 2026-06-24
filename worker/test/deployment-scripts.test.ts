/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '../..')

describe('deployment scripts', () => {
  it('applies remote D1 migrations before deploying the Worker', () => {
    const scripts = readPackageScripts()

    expect(scripts['db:migrate:remote']).toBe('wrangler d1 migrations apply stock_pilot --remote --config wrangler.jsonc')
    expect(scripts.deploy).toContain('npm run db:migrate:remote')
    expect(scripts.deploy.indexOf('npm run db:migrate:remote')).toBeLessThan(scripts.deploy.indexOf('wrangler deploy'))
  })

  it('applies local D1 migrations before integrated Worker preview', () => {
    const scripts = readPackageScripts()

    expect(scripts['db:migrate:local']).toBe('wrangler d1 migrations apply stock_pilot --local --config wrangler.jsonc')
    expect(scripts.preview).toContain('npm run db:migrate:local')
    expect(scripts.preview.indexOf('npm run db:migrate:local')).toBeLessThan(scripts.preview.indexOf('wrangler dev'))
  })
})

function readPackageScripts(): Record<string, string> {
  const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as {
    scripts: Record<string, string>
  }

  return packageJson.scripts
}
