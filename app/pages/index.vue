<script setup lang="ts">
import AiSummaryPanel from '../components/dashboard/AiSummaryPanel.vue'
import DisciplineCardRail from '../components/dashboard/DisciplineCardRail.vue'
import TriggerEventCard from '../components/dashboard/TriggerEventCard.vue'

const { dashboard, apiError, pending } = useTodayDashboard()
</script>

<template>
  <div
    v-if="apiError"
    class="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-800"
  >
    数据接口暂时不可用：{{ apiError.message }}
  </div>

  <div
    v-if="pending"
    class="rounded border border-stock-line bg-stock-surface px-3 py-2 text-sm leading-6 text-stock-muted"
  >
    正在加载今日数据...
  </div>

  <template v-if="dashboard">
    <AiSummaryPanel :summary="dashboard.summary" />

    <section class="space-y-3">
      <div class="flex items-end justify-between">
        <h3 class="text-lg font-semibold">待处理触发</h3>
        <span class="font-mono text-xs font-semibold uppercase tracking-normal text-stock-muted">
          {{ dashboard.triggers.length }} 个异常
        </span>
      </div>
      <TriggerEventCard
        v-for="trigger in dashboard.triggers"
        :key="trigger.stockCode"
        :trigger="trigger"
      />
    </section>

    <section class="space-y-3">
      <div class="flex items-end justify-between">
        <h3 class="text-lg font-semibold">待复核纪律卡</h3>
        <span class="font-mono text-xs font-semibold uppercase tracking-normal text-stock-muted">
          {{ dashboard.summary.disciplineCardCount }} 张进行中
        </span>
      </div>
      <DisciplineCardRail :cards="dashboard.disciplineCards" />
    </section>
  </template>

  <section
    v-else-if="!pending"
    class="rounded border border-stock-line bg-stock-surface p-4 text-sm leading-6 text-stock-muted"
  >
    <div class="font-semibold text-stock-text">
      今日数据暂不可用
    </div>
    <div>
      请稍后刷新，或检查 Worker API 是否正常返回数据。
    </div>
  </section>
</template>
