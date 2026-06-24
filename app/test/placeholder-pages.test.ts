import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const pagesRoot = resolve(import.meta.dirname, '../pages')

describe('placeholder pages', () => {
  it('marks unfinished business pages as not yet connected instead of empty real data', () => {
    for (const file of ['decisions.vue', 'discipline-cards.vue', 'reviews.vue', 'me.vue']) {
      const source = readFileSync(resolve(pagesRoot, file), 'utf8')

      expect(source).toContain('功能待接入')
      expect(source).not.toContain('暂无可展示')
    }
  })
})
