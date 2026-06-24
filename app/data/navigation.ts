import type { BottomNavigationItem } from '../types/dashboard'

export const bottomNavigationItems: BottomNavigationItem[] = [
  { label: '今日', href: '/', active: true },
  { label: '决策', href: '/decisions', active: false },
  { label: '纪律卡', href: '/discipline-cards', active: false },
  { label: '复盘', href: '/reviews', active: false },
  { label: '我的', href: '/me', active: false },
]
