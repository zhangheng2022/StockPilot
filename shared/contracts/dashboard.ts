export type DashboardSummary = {
  greeting: string
  title: string
  riskTriggerCount: number
  disciplineCardCount: number
  message: string
  detail: string
}

export type TriggerTone = 'green' | 'amber' | 'red'

export type TriggerEventView = {
  stockCode: string
  stockName: string
  source: string
  label: string
  tone: TriggerTone
  triggerPrice?: string
  deviation?: string
  aiPrompt?: string
  primaryAction: string
  secondaryAction?: string
}

export type DisciplineCardView = {
  category: string
  title: string
  progress: number
  metricLabel: string
  metricValue: string
}

export type TodayDashboard = {
  summary: DashboardSummary
  triggers: TriggerEventView[]
  disciplineCards: DisciplineCardView[]
}
