<script setup lang="ts">
import type { ApiResult } from '../../types/api'
import type { DisciplineCardDetail } from '../../types/decisions'

const route = useRoute()
const cardId = computed(() => String(route.params.id))
const { data, pending, error } = useApiFetch<ApiResult<DisciplineCardDetail>>(`/discipline-cards/${cardId.value}`)

const card = computed(() => {
  const body = data.value
  return body?.ok ? body.data : null
})
const apiError = computed(() => {
  const body = data.value
  return body && !body.ok ? body.error.message : null
})

const statusLabels: Record<DisciplineCardDetail['status'], string> = {
  watching: '观察中',
  planned_holding: '计划持有',
  needs_review: '待复核',
  risk_triggered: '风险触发',
  closed: '已关闭',
}

function statusType(status: DisciplineCardDetail['status']) {
  if (status === 'risk_triggered') return 'danger'
  if (status === 'needs_review') return 'warning'
  if (status === 'closed') return 'default'
  return 'primary'
}
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center gap-2">
      <van-button
        icon="arrow-left"
        size="small"
        plain
        hairline
        to="/discipline-cards"
        aria-label="返回纪律卡列表"
      />
      <div>
        <p class="font-mono text-xs font-semibold uppercase tracking-normal text-stock-muted">
          Discipline detail
        </p>
        <h2 class="text-xl font-semibold">
          纪律卡详情
        </h2>
      </div>
    </div>

    <van-notice-bar
      v-if="apiError || error"
      wrapable
      :scrollable="false"
      color="#92400e"
      background="#fffbeb"
      :text="apiError ?? '纪律卡详情暂时不可用'"
    />

    <div
      v-if="pending"
      class="rounded border border-stock-line bg-stock-surface px-3 py-4 text-sm leading-6 text-stock-muted"
    >
      <van-loading size="20">
        正在加载纪律卡...
      </van-loading>
    </div>

    <van-empty
      v-else-if="!card"
      class="rounded border border-stock-line bg-stock-surface"
      image="error"
      description="未找到纪律卡"
    />

    <template v-else>
      <article class="rounded-lg bg-stock-surface p-4 shadow-sm ring-1 ring-stock-line">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="font-mono text-xs text-stock-muted">
              {{ card.decision.stockCode }} · {{ card.decision.stockName }}
            </p>
            <h3 class="text-lg font-semibold">
              {{ card.coreThesis }}
            </h3>
          </div>
          <van-tag :type="statusType(card.status)">
            {{ statusLabels[card.status] }}
          </van-tag>
        </div>
        <p class="mt-3 text-sm leading-6 text-stock-muted">
          {{ card.decision.rationale }}
        </p>
        <div class="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div class="rounded bg-stock-background px-3 py-2">
            <p class="font-mono text-xs text-stock-muted">仓位</p>
            <p class="font-semibold">{{ Math.round(card.decision.plannedPosition * 100) }}%</p>
          </div>
          <div class="rounded bg-stock-background px-3 py-2">
            <p class="font-mono text-xs text-stock-muted">频率</p>
            <p class="font-semibold">{{ card.reviewFrequency }}</p>
          </div>
        </div>
      </article>

      <section class="space-y-3">
        <h3 class="text-lg font-semibold">
          纪律规则
        </h3>
        <van-cell-group inset>
          <van-cell
            title="证据来源"
            :label="card.evidenceSources ?? '未记录'"
          />
          <van-cell
            title="失效条件"
            :label="card.invalidationCondition ?? '未记录'"
          />
          <van-cell
            title="监控规则"
            :label="card.monitoringRules ?? '未记录'"
          />
          <van-cell
            title="止损条件"
            :label="card.stopLossCondition ?? '未记录'"
          />
          <van-cell
            title="止盈/退出"
            :label="card.takeProfitCondition ?? card.decision.exitCondition"
          />
        </van-cell-group>
      </section>

      <section class="space-y-3">
        <div class="flex items-end justify-between">
          <h3 class="text-lg font-semibold">
            触发记录
          </h3>
          <span class="font-mono text-xs font-semibold text-stock-muted">
            {{ card.triggerEvents.length }} 条
          </span>
        </div>
        <van-empty
          v-if="card.triggerEvents.length === 0"
          image="search"
          description="暂无触发记录"
          class="rounded border border-stock-line bg-stock-surface"
        />
        <van-cell-group
          v-else
          inset
        >
          <van-cell
            v-for="event in card.triggerEvents"
            :key="event.id"
            :title="event.triggeredCondition"
            :label="event.relationToPlan ?? event.evidenceSource ?? event.createdAt"
          >
            <template #value>
              <van-tag type="warning">
                {{ event.status }}
              </van-tag>
            </template>
          </van-cell>
        </van-cell-group>
      </section>

      <section class="space-y-3">
        <div class="flex items-end justify-between">
          <h3 class="text-lg font-semibold">
            复盘历史
          </h3>
          <span class="font-mono text-xs font-semibold text-stock-muted">
            {{ card.reviews.length }} 条
          </span>
        </div>
        <van-empty
          v-if="card.reviews.length === 0"
          image="search"
          description="暂无复盘"
          class="rounded border border-stock-line bg-stock-surface"
        />
        <van-cell-group
          v-else
          inset
        >
          <van-cell
            v-for="review in card.reviews"
            :key="review.id"
            :title="review.executionSummary ?? '待复盘'"
            :label="review.notes ?? review.createdAt"
          >
            <template #value>
              <van-tag plain>
                {{ review.status }}
              </van-tag>
            </template>
          </van-cell>
        </van-cell-group>
      </section>
    </template>
  </section>
</template>
