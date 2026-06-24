import { afterEach, describe, expect, it, vi } from 'vitest'
import { bottomNavigationItems, todayDashboard } from '../data/today-dashboard'
import { useTodayDashboard } from '../composables/useTodayDashboard'

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
    expect(activeItems[0]?.label).toBe('今日')
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
})
