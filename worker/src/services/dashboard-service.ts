import type { DisciplineCardStatus, TodayDashboard, TriggerEventStatus, TriggerTone } from '../domain/types'
import type { WorkerEnv } from '../env'
import { DashboardRepository, type DashboardDisciplineCardRecord, type DashboardTriggerRecord } from '../repositories/dashboard'

type DashboardStore = Pick<DashboardRepository, 'listActiveCards' | 'listOpenTriggers'>

export class DashboardService {
  constructor(private readonly dashboard: DashboardStore) {}

  async getTodayDashboard(userId: string): Promise<TodayDashboard> {
    const [triggers, disciplineCards] = await Promise.all([
      this.dashboard.listOpenTriggers(userId),
      this.dashboard.listActiveCards(userId),
    ])

    return {
      summary: {
        greeting: '你好，交易者',
        title: '今日市场摘要',
        riskTriggerCount: triggers.length,
        disciplineCardCount: disciplineCards.length,
        message: buildSummaryMessage(triggers.length),
        detail: buildSummaryDetail(triggers.length, disciplineCards.length),
      },
      triggers: triggers.map(toTriggerEventView),
      disciplineCards: disciplineCards.map(toDisciplineCardView),
    }
  }
}

export function createDashboardService(env: WorkerEnv) {
  return new DashboardService(new DashboardRepository(env))
}

function toTriggerEventView(record: DashboardTriggerRecord) {
  return {
    stockCode: record.stockCode,
    stockName: record.stockName,
    source: record.triggerType,
    label: record.triggeredCondition,
    tone: triggerTone(record.status),
    aiPrompt: record.relationToPlan ?? record.evidenceSource ?? undefined,
    primaryAction: primaryTriggerAction(record.status),
    secondaryAction: record.status === 'pending' ? '忽略' : undefined,
  }
}

function toDisciplineCardView(record: DashboardDisciplineCardRecord) {
  return {
    category: record.reviewFrequency,
    title: record.coreThesis,
    progress: cardProgress(record.status),
    metricLabel: '下次复查',
    metricValue: record.nextReviewAt ?? '未安排',
  }
}

function triggerTone(status: TriggerEventStatus): TriggerTone {
  if (status === 'confirmed') return 'red'
  if (status === 'pending') return 'amber'
  return 'green'
}

function primaryTriggerAction(status: TriggerEventStatus) {
  if (status === 'confirmed') return '进入复核'
  return '查看触发'
}

function cardProgress(status: DisciplineCardStatus) {
  const progressByStatus: Record<DisciplineCardStatus, number> = {
    watching: 40,
    planned_holding: 60,
    needs_review: 80,
    risk_triggered: 100,
    closed: 0,
  }

  return progressByStatus[status]
}

function buildSummaryMessage(triggerCount: number) {
  if (triggerCount === 0) {
    return '今日暂无风险触发'
  }

  return `今日有 ${triggerCount} 条风险触发，建议优先处理`
}

function buildSummaryDetail(triggerCount: number, disciplineCardCount: number) {
  if (triggerCount === 0 && disciplineCardCount === 0) {
    return '当前没有需要处理的纪律卡，适合整理新的交易计划。'
  }

  return `当前有 ${disciplineCardCount} 张纪律卡处于跟踪状态，请先复核触发事项，再决定是否调整仓位。`
}
