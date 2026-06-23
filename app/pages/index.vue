<script setup lang="ts">
import AiSummaryPanel from '../components/dashboard/AiSummaryPanel.vue'
import DisciplineCardRail from '../components/dashboard/DisciplineCardRail.vue'
import TriggerEventCard from '../components/dashboard/TriggerEventCard.vue'

const { dashboard } = useTodayDashboard()
</script>

<template>
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
