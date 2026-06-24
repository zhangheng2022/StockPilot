import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { bottomNavigationItems, todayDashboard } from '../data/today-dashboard'
import { useTodayDashboard } from '../composables/useTodayDashboard'

const pagesRoot = resolve(import.meta.dirname, '../pages')

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('today dashboard view model', () => {
  it('keeps summary counts aligned with visible dashboard collections', () => {
    expect(todayDashboard.summary.riskTriggerCount).toBe(todayDashboard.triggers.length)
    expect(todayDashboard.summary.disciplineCardCount).toBe(todayDashboard.disciplineCards.length)
  })

  it('marks today as the only active bottom navigation item', () => {
    const activeItems = bottomNavigationItems.filter(item => item.active)

    expect(activeItems).toHaveLength(1)
    expect(activeItems[0]?.href).toBe('/')
  })

  it('keeps bottom navigation targets backed by Nuxt pages', () => {
    for (const item of bottomNavigationItems) {
      expect(hasPageForHref(item.href), `${item.href} should have a page component`).toBe(true)
    }
  })

  it('loads the dashboard through the API fetch wrapper', () => {
    const useFetch = vi.fn(() => ({
      data: { value: { data: todayDashboard } },
      pending: { value: false },
      error: { value: null },
      refresh: vi.fn(),
    }))
    vi.stubGlobal('useFetch', useFetch)

    const result = useTodayDashboard()

    expect(useFetch).toHaveBeenCalledWith('/dashboard/today', {
      baseURL: '/api',
      headers: {
        accept: 'application/json',
      },
    })
    expect(result.dashboard.value).toEqual(todayDashboard)
  })

  it('falls back without throwing when the dashboard response is not an API object', () => {
    const useFetch = vi.fn(() => ({
      data: { value: '<!DOCTYPE html><html></html>' },
      pending: { value: false },
      error: { value: null },
      refresh: vi.fn(),
    }))
    vi.stubGlobal('useFetch', useFetch)

    const result = useTodayDashboard()

    expect(result.dashboard.value).toEqual(todayDashboard)
  })
})

function hasPageForHref(href: string) {
  if (href === '/') return existsSync(resolve(pagesRoot, 'index.vue'))

  const pageName = href.replace(/^\//, '')

  return (
    existsSync(resolve(pagesRoot, `${pageName}.vue`))
    || existsSync(resolve(pagesRoot, pageName, 'index.vue'))
  )
}
