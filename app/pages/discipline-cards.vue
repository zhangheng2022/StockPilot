<script setup lang="ts">
import type { ApiResult } from '../types/api'
import type { DisciplineCardListItem } from '../types/decisions'

const { data, pending, error, refresh } = useApiFetch<ApiResult<DisciplineCardListItem[]>>('/discipline-cards')

const cards = computed(() => {
  const body = data.value
  return body?.ok ? body.data : []
})
const apiError = computed(() => {
  const body = data.value
  return body && !body.ok ? body.error.message : null
})

const statusLabels: Record<DisciplineCardListItem['status'], string> = {
  watching: '观察中',
  planned_holding: '计划持有',
  needs_review: '待复核',
  risk_triggered: '风险触发',
  closed: '已关闭',
}

function statusType(status: DisciplineCardListItem['status']) {
  if (status === 'risk_triggered') return 'danger'
  if (status === 'needs_review') return 'warning'
  if (status === 'closed') return 'default'
  return 'primary'
}
</script>

<template>
  <section class="space-y-4">
    <div class="space-y-1">
      <p class="font-mono text-xs font-semibold uppercase tracking-normal text-stock-muted">
        Discipline
      </p>
      <h2 class="text-xl font-semibold">
        纪律卡
      </h2>
    </div>

    <van-notice-bar
      v-if="apiError || error"
      wrapable
      :scrollable="false"
      color="#92400e"
      background="#fffbeb"
      :text="apiError ?? '纪律卡接口暂时不可用'"
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
      v-else-if="cards.length === 0"
      class="rounded border border-stock-line bg-stock-surface"
      image="search"
      description="暂无纪律卡"
    >
      <van-button
        type="primary"
        size="small"
        icon="plus"
        to="/decisions/new"
      >
        新建决策
      </van-button>
    </van-empty>

    <div
      v-else
      class="space-y-3"
    >
      <article
        v-for="card in cards"
        :key="card.id"
        class="rounded-lg bg-stock-surface p-4 shadow-sm ring-1 ring-stock-line"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="font-mono text-xs text-stock-muted">
              {{ card.decision.stockCode }} · {{ card.decision.stockName }}
            </p>
            <h3 class="line-clamp-2 text-base font-semibold">
              {{ card.coreThesis }}
            </h3>
          </div>
          <van-tag :type="statusType(card.status)">
            {{ statusLabels[card.status] }}
          </van-tag>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div class="rounded bg-stock-background px-3 py-2">
            <p class="font-mono text-xs text-stock-muted">频率</p>
            <p class="font-semibold">{{ card.reviewFrequency }}</p>
          </div>
          <div class="rounded bg-stock-background px-3 py-2">
            <p class="font-mono text-xs text-stock-muted">下次复查</p>
            <p class="font-semibold">{{ card.nextReviewAt ?? '未安排' }}</p>
          </div>
        </div>

        <div class="mt-4 flex justify-end">
          <van-button
            size="small"
            type="primary"
            plain
            :to="`/discipline-cards/${card.id}`"
          >
            查看详情
          </van-button>
        </div>
      </article>
    </div>

    <van-button
      v-if="!pending && cards.length > 0"
      block
      plain
      type="primary"
      icon="replay"
      @click="refresh()"
    >
      刷新
    </van-button>
  </section>
</template>
