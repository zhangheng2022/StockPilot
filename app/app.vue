<template>
  <div class="min-h-dvh bg-stock-background font-sans text-stock-text">
    <NuxtRouteAnnouncer />

    <header class="sticky top-0 z-30 border-b border-stock-line/60 bg-stock-background/90 backdrop-blur">
      <div class="mx-auto flex h-14 w-full max-w-[780px] items-center justify-between px-4">
        <div class="flex items-center gap-2">
          <div class="grid size-7 place-items-center rounded bg-stock-primary text-xs font-bold text-white">
            SP
          </div>
          <h1 class="text-lg font-bold tracking-normal text-stock-primary">
            StockPilot AI
          </h1>
        </div>
        <button class="grid size-9 place-items-center rounded border border-stock-line bg-white text-stock-muted" aria-label="通知">
          <span class="text-base">!</span>
        </button>
      </div>
    </header>

    <main class="mx-auto w-full max-w-[780px] space-y-6 px-4 pb-28 pt-4">
      <section class="space-y-2">
        <p class="text-sm text-stock-muted">你好，交易者</p>
        <h2 class="text-xl font-semibold">今日市场摘要</h2>
        <div class="rounded-lg border border-stock-primary/10 bg-stock-primary-soft p-4">
          <div class="flex gap-3">
            <div class="grid size-7 shrink-0 place-items-center rounded bg-stock-primary text-sm font-bold text-white">
              AI
            </div>
            <div class="space-y-1">
              <p class="font-semibold text-stock-primary">
                今日有 2 条风险触发，建议优先处理
              </p>
              <p class="text-sm leading-6 text-stock-muted">
                您的持仓中“贵州茅台”已触及预设止损位，市场情绪偏向谨慎。建议立即复核纪律卡，以维持仓位纪律。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="space-y-3">
        <div class="flex items-end justify-between">
          <h3 class="text-lg font-semibold">待处理触发</h3>
          <span class="font-mono text-xs font-semibold uppercase tracking-normal text-stock-muted">2 个异常</span>
        </div>

        <article class="rounded-lg border border-stock-line border-l-4 border-l-stock-green bg-stock-surface p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-stock-muted">600519</span>
                <h4 class="font-semibold">贵州茅台</h4>
              </div>
              <p class="text-sm text-stock-muted">来源：价格监控</p>
            </div>
            <span class="rounded-full bg-stock-green/10 px-3 py-1 font-mono text-xs font-semibold text-stock-green">跌破止损位</span>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-4 border-t border-stock-line pt-3">
            <div>
              <p class="font-mono text-xs font-semibold text-stock-muted">触发价格</p>
              <p class="font-mono text-lg font-semibold text-stock-green">¥1642.50</p>
            </div>
            <div>
              <p class="font-mono text-xs font-semibold text-stock-muted">偏差值</p>
              <p class="font-mono text-lg font-semibold text-stock-green">-0.45%</p>
            </div>
          </div>

          <div class="mt-4 flex gap-2">
            <button class="min-h-10 flex-1 rounded bg-stock-green px-3 text-sm font-semibold text-white">
              执行卖出计划
            </button>
            <button class="min-h-10 rounded border border-stock-line px-4 text-sm font-semibold text-stock-muted">
              忽略
            </button>
          </div>
        </article>

        <article class="rounded-lg border border-stock-line border-l-4 border-l-stock-amber bg-stock-surface p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-stock-muted">000858</span>
                <h4 class="font-semibold">五粮液</h4>
              </div>
              <p class="text-sm text-stock-muted">来源：成交量异动</p>
            </div>
            <span class="rounded-full bg-stock-amber/10 px-3 py-1 font-mono text-xs font-semibold text-stock-amber">放量滞涨</span>
          </div>
          <p class="mt-4 rounded bg-slate-50 p-3 text-sm leading-6 text-stock-muted">
            AI 提示：该股已在阻力位附近连续 3 日出现高换手率但价格未创新高，建议复核原持有逻辑。
          </p>
          <button class="mt-3 min-h-10 w-full rounded border border-stock-primary px-3 text-sm font-semibold text-stock-primary">
            进入 AI 复核
          </button>
        </article>
      </section>

      <section class="space-y-3">
        <div class="flex items-end justify-between">
          <h3 class="text-lg font-semibold">待复核纪律卡</h3>
          <span class="font-mono text-xs font-semibold uppercase tracking-normal text-stock-muted">3 张进行中</span>
        </div>

        <div class="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
          <article class="flex h-48 min-w-[280px] snap-start flex-col justify-between rounded-lg border border-stock-line bg-white p-4">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="font-mono text-xs font-semibold text-stock-muted">中短线博弈</span>
                <span class="font-mono text-xs font-semibold text-stock-primary">85%</span>
              </div>
              <h4 class="font-semibold leading-6">宁德时代 420 突破计划</h4>
              <div class="h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div class="h-full w-[85%] rounded-full bg-stock-primary"></div>
              </div>
            </div>
            <div class="flex items-end justify-between">
              <div>
                <p class="font-mono text-[11px] font-semibold text-stock-muted">失效倒计时</p>
                <p class="font-mono text-base font-semibold">18:45:00</p>
              </div>
              <button class="grid size-9 place-items-center rounded bg-slate-100 font-semibold text-stock-primary" aria-label="查看宁德时代计划">
                >
              </button>
            </div>
          </article>

          <article class="flex h-48 min-w-[280px] snap-start flex-col justify-between rounded-lg border border-stock-line bg-white p-4">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="font-mono text-xs font-semibold text-stock-muted">价值定投</span>
                <span class="font-mono text-xs font-semibold text-stock-amber">20%</span>
              </div>
              <h4 class="font-semibold leading-6">纳指 ETF 季底补仓卡</h4>
              <div class="h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div class="h-full w-[20%] rounded-full bg-stock-primary"></div>
              </div>
            </div>
            <div class="flex items-end justify-between">
              <div>
                <p class="font-mono text-[11px] font-semibold text-stock-muted">下次复查</p>
                <p class="font-mono text-base font-semibold">03-24</p>
              </div>
              <button class="grid size-9 place-items-center rounded bg-slate-100 font-semibold text-stock-primary" aria-label="查看纳指 ETF 卡">
                >
              </button>
            </div>
          </article>
        </div>
      </section>
    </main>

    <button class="fixed bottom-20 right-6 z-40 grid size-14 place-items-center rounded-full bg-black text-2xl font-semibold text-white shadow-lg" aria-label="新建决策">
      +
    </button>

    <nav class="fixed inset-x-0 bottom-0 z-30 border-t border-stock-line bg-white">
      <div class="mx-auto grid max-w-[780px] grid-cols-5 px-2 py-2">
        <a class="flex flex-col items-center gap-1 rounded-lg bg-stock-primary px-2 py-1 text-white" href="#">
          <span class="font-mono text-xs font-semibold">今日</span>
        </a>
        <a class="flex flex-col items-center gap-1 rounded-lg px-2 py-1 text-stock-muted" href="#">
          <span class="font-mono text-xs font-semibold">决策</span>
        </a>
        <a class="flex flex-col items-center gap-1 rounded-lg px-2 py-1 text-stock-muted" href="#">
          <span class="font-mono text-xs font-semibold">纪律卡</span>
        </a>
        <a class="flex flex-col items-center gap-1 rounded-lg px-2 py-1 text-stock-muted" href="#">
          <span class="font-mono text-xs font-semibold">复盘</span>
        </a>
        <a class="flex flex-col items-center gap-1 rounded-lg px-2 py-1 text-stock-muted" href="#">
          <span class="font-mono text-xs font-semibold">我的</span>
        </a>
      </div>
    </nav>
  </div>
</template>
