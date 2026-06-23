import { describe, expect, it } from 'vitest'
import { bottomNavigationItems, todayDashboard } from '../data/today-dashboard'

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
})
