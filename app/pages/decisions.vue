<script setup lang="ts">
import type { ApiResult } from '../types/api'
import type { Decision } from '../types/decisions'

const { data, pending, error, refresh } = useApiFetch<ApiResult<Decision[]>>('/decisions')

const decisions = computed(() => {
  const body = data.value
  return body?.ok ? body.data : []
})
const apiError = computed(() => {
  const body = data.value
  return body && !body.ok ? body.error.message : null
})

const actionLabels: Record<Decision['action'], string> = {
  buy: '买入',
  add: '加仓',
  reduce: '减仓',
  hold: '持有',
  sell: '卖出',
}

const statusLabels: Record<Decision['status'], string> = {
  draft: '草稿',
  pending_quality_check: '待质检',
  pending_confirmation: '待确认',
  card_created: '已生成纪律卡',
  abandoned: '已放弃',
}

function percent(value: number) {
  return `${Math.round(value * 100)}%`
}
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-start justify-between gap-3">
      <div class="space-y-1">
        <p class="font-mono text-xs font-semibold uppercase tracking-normal text-stock-muted">
          Decisions
        </p>
        <h2 class="text-xl font-semibold">
          决策
        </h2>
      </div>
      <van-button
        type="primary"
        size="small"
        icon="plus"
        to="/decisions/new"
      >
        新建
      </van-button>
    </div>

    <van-notice-bar
      v-if="apiError || error"
      wrapable
      :scrollable="false"
      color="#92400e"
      background="#fffbeb"
      :text="apiError ?? '决策接口暂时不可用'"
    />

    <div
      v-if="pending"
      class="rounded border border-stock-line bg-stock-surface px-3 py-4 text-sm leading-6 text-stock-muted"
    >
      <van-loading size="20">
        正在加载决策...
      </van-loading>
    </div>

    <van-empty
      v-else-if="decisions.length === 0"
      class="rounded border border-stock-line bg-stock-surface"
      image="search"
      description="暂无决策记录"
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
        v-for="decision in decisions"
        :key="decision.id"
        class="rounded-lg bg-stock-surface p-4 shadow-sm ring-1 ring-stock-line"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="font-mono text-xs font-semibold text-stock-muted">
              {{ decision.stockCode }}
            </p>
            <h3 class="truncate text-base font-semibold">
              {{ decision.stockName }}
            </h3>
          </div>
          <van-tag
            plain
            type="primary"
          >
            {{ actionLabels[decision.action] }}
          </van-tag>
        </div>

        <p class="mt-3 text-sm leading-6 text-stock-muted">
          {{ decision.rationale }}
        </p>

        <div class="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div class="rounded bg-stock-background px-3 py-2">
            <p class="font-mono text-xs text-stock-muted">仓位</p>
            <p class="font-semibold">{{ percent(decision.plannedPosition) }}</p>
          </div>
          <div class="rounded bg-stock-background px-3 py-2">
            <p class="font-mono text-xs text-stock-muted">状态</p>
            <p class="font-semibold">{{ statusLabels[decision.status] }}</p>
          </div>
        </div>

        <div class="mt-4 flex justify-end">
          <van-button
            size="small"
            type="primary"
            plain
            :to="`/decisions/${decision.id}/quality`"
          >
            查看质检
          </van-button>
        </div>
      </article>
    </div>

    <van-button
      v-if="!pending && decisions.length > 0"
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
