/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
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

  it('runs the development environment through the Worker', () => {
    const scripts = readPackageScripts()
    const devRunner = readFileSync(resolve(root, 'scripts/dev.mjs'), 'utf8')

    expect(scripts.dev).toBe('node scripts/dev.mjs')
    expect(devRunner).toContain('npm run db:migrate:local')
    expect(devRunner).toContain('npm run dev:worker')
    expect(devRunner.indexOf('npm run db:migrate:local')).toBeLessThan(devRunner.indexOf('npm run dev:worker'))
    expect(scripts['dev:ui']).toBe('nuxt dev')
  })

  it('keeps Nuxt hot module replacement in the Worker-backed development environment', () => {
    const scripts = readPackageScripts()

    expect(scripts.dev).toBe('node scripts/dev.mjs')
    expect(scripts.dev).not.toContain('npm run build')
    expect(scripts.dev).not.toContain('nuxt generate')
    expect(scripts['dev:nuxt']).toBe('nuxt dev --host 127.0.0.1 --port 3000')
    expect(scripts['dev:worker']).toBe(
      'wrangler dev --config wrangler.jsonc --port 8787 --var DEV_ASSET_ORIGIN:http://127.0.0.1:3000',
    )
  })

  it('keeps the development runner syntactically valid', () => {
    const result = spawnSync(process.execPath, ['--check', resolve(root, 'scripts/dev.mjs')], {
      encoding: 'utf8',
    })

    expect(result.stderr).toBe('')
    expect(result.status).toBe(0)
  })

  it('runs npm scripts through the platform shell for Windows compatibility', () => {
    const devRunner = readFileSync(resolve(root, 'scripts/dev.mjs'), 'utf8')

    expect(devRunner).not.toContain('npm.cmd')
    expect(devRunner).toContain('shell: true')
  })
})

function readPackageScripts(): Record<string, string> {
  const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as {
    scripts: Record<string, string>
  }

  return packageJson.scripts
}
