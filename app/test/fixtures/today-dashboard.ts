import type { TodayDashboard } from '../../types/dashboard'

export const todayDashboard: TodayDashboard = {
  summary: {
    greeting: '你好，交易者',
    title: '今日市场摘要',
    riskTriggerCount: 2,
    disciplineCardCount: 3,
    message: '今日有 2 条风险触发，建议优先处理',
    detail: '您的持仓中“贵州茅台”已触及预设止损位，市场情绪偏向谨慎。建议立即复核纪律卡，以维持仓位纪律。',
  },
  triggers: [
    {
      stockCode: '600519',
      stockName: '贵州茅台',
      source: '价格监控',
      label: '跌破止损位',
      tone: 'green',
      triggerPrice: '¥1642.50',
      deviation: '-0.45%',
      primaryAction: '执行卖出计划',
      secondaryAction: '忽略',
    },
    {
      stockCode: '000858',
      stockName: '五粮液',
      source: '成交量异动',
      label: '放量滞涨',
      tone: 'amber',
      aiPrompt: '该股已在阻力位附近连续 3 日出现高换手率但价格未创新高，建议复核原持有逻辑。',
      primaryAction: '进入 AI 复核',
    },
  ],
  disciplineCards: [
    {
      category: '中短线博弈',
      title: '宁德时代 420 突破计划',
      progress: 85,
      metricLabel: '失效倒计时',
      metricValue: '18:45:00',
    },
    {
      category: '价值定投',
      title: '纳指 ETF 季底补仓卡',
      progress: 20,
      metricLabel: '下次复查',
      metricValue: '03-24',
    },
    {
      category: '趋势跟踪',
      title: '中际旭创回撤观察卡',
      progress: 60,
      metricLabel: '下次复查',
      metricValue: '明日',
    },
  ],
}
