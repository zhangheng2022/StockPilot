import type { BottomNavigationItem } from '../types/dashboard'

export const bottomNavigationItems: BottomNavigationItem[] = [
  { label: '今日', href: '/', active: true, icon: 'home-o' },
  { label: '决策', href: '/decisions', active: false, icon: 'records-o' },
  { label: '纪律卡', href: '/discipline-cards', active: false, icon: 'todo-list-o' },
  { label: '复盘', href: '/reviews', active: false, icon: 'chart-trending-o' },
  { label: '我的', href: '/me', active: false, icon: 'user-o' },
]
