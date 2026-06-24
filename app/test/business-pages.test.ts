import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const pagesRoot = resolve(import.meta.dirname, '../pages')

describe('business pages', () => {
  it('keeps unfinished pages explicit instead of showing fake empty data', () => {
    for (const file of ['reviews.vue', 'me.vue']) {
      const source = readFileSync(resolve(pagesRoot, file), 'utf8')

      expect(source).toContain('功能待接入')
      expect(source).not.toContain('暂无可展示')
    }
  })

  it('connects decision and discipline card pages to real APIs', () => {
    const decisions = readFileSync(resolve(pagesRoot, 'decisions.vue'), 'utf8')
    const newDecision = readFileSync(resolve(pagesRoot, 'decisions/new.vue'), 'utf8')
    const quality = readFileSync(resolve(pagesRoot, 'decisions/[id]/quality.vue'), 'utf8')
    const disciplineCards = readFileSync(resolve(pagesRoot, 'discipline-cards.vue'), 'utf8')
    const disciplineDetail = readFileSync(resolve(pagesRoot, 'discipline-cards/[id].vue'), 'utf8')

    expect(decisions).toContain("useApiFetch<ApiResult<Decision[]>>('/decisions')")
    expect(newDecision).toContain("apiRequest<CreatedDecision>('/decisions'")
    expect(quality).toContain('AI 质检结果')
    expect(disciplineCards).toContain("useApiFetch<ApiResult<DisciplineCardListItem[]>>('/discipline-cards')")
    expect(disciplineDetail).toContain('DisciplineCardDetail')
    expect(decisions).not.toContain('功能待接入')
    expect(disciplineCards).not.toContain('功能待接入')
  })

  it('adds refreshable decision and discipline detail routes', () => {
    expect(existsSync(resolve(pagesRoot, 'decisions/[id]/quality.vue'))).toBe(true)
    expect(existsSync(resolve(pagesRoot, 'discipline-cards/[id].vue'))).toBe(true)
  })
})
