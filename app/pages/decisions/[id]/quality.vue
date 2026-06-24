<script setup lang="ts">
import type { ApiResult } from '../../../types/api'
import type { Decision } from '../../../types/decisions'

const route = useRoute()
const decisionId = computed(() => String(route.params.id))
const cardId = computed(() => typeof route.query.cardId === 'string' ? route.query.cardId : '')
const { data, pending, error } = useApiFetch<ApiResult<Decision>>(`/decisions/${decisionId.value}`)

const decision = computed(() => {
  const body = data.value
  return body?.ok ? body.data : null
})
const apiError = computed(() => {
  const body = data.value
  return body && !body.ok ? body.error.message : null
})
const qualityCheck = computed(() => decision.value?.qualityCheck ?? null)

const actionLabels: Record<Decision['action'], string> = {
  buy: '买入',
  add: '加仓',
  reduce: '减仓',
  hold: '持有',
  sell: '卖出',
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
        to="/decisions"
        aria-label="返回决策列表"
      />
      <div>
        <p class="font-mono text-xs font-semibold uppercase tracking-normal text-stock-muted">
          AI inspection
        </p>
        <h2 class="text-xl font-semibold">
          AI 质检结果
        </h2>
      </div>
    </div>

    <van-notice-bar
      v-if="apiError || error"
      wrapable
      :scrollable="false"
      color="#92400e"
      background="#fffbeb"
      :text="apiError ?? '质检结果暂时不可用'"
    />

    <div
      v-if="pending"
      class="rounded border border-stock-line bg-stock-surface px-3 py-4 text-sm leading-6 text-stock-muted"
    >
      <van-loading size="20">
        正在读取质检结果...
      </van-loading>
    </div>

    <van-empty
      v-else-if="!decision || !qualityCheck"
      class="rounded border border-stock-line bg-stock-surface"
      image="error"
      description="未找到质检结果"
    />

    <template v-else>
      <article class="rounded-lg bg-stock-surface p-4 shadow-sm ring-1 ring-stock-line">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="font-mono text-xs text-stock-muted">
              {{ decision.stockCode }}
            </p>
            <h3 class="truncate text-lg font-semibold">
              {{ decision.stockName }}
            </h3>
          </div>
          <van-tag :type="qualityCheck.verdict === 'pass' ? 'success' : 'warning'">
            {{ qualityCheck.verdict === 'pass' ? '通过' : '需复核' }}
          </van-tag>
        </div>
        <p class="mt-3 text-sm leading-6 text-stock-muted">
          {{ qualityCheck.summary }}
        </p>
        <div class="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div class="rounded bg-stock-background px-3 py-2">
            <p class="font-mono text-xs text-stock-muted">动作</p>
            <p class="font-semibold">{{ actionLabels[decision.action] }}</p>
          </div>
          <div class="rounded bg-stock-background px-3 py-2">
            <p class="font-mono text-xs text-stock-muted">仓位</p>
            <p class="font-semibold">{{ Math.round(decision.plannedPosition * 100) }}%</p>
          </div>
        </div>
      </article>

      <section class="space-y-3">
        <h3 class="text-lg font-semibold">
          优势
        </h3>
        <van-cell-group inset>
          <van-cell
            v-for="item in qualityCheck.strengths"
            :key="item"
            icon="passed"
            :title="item"
          />
        </van-cell-group>
      </section>

      <section class="space-y-3">
        <h3 class="text-lg font-semibold">
          脆弱点
        </h3>
        <van-cell-group inset>
          <van-cell
            v-for="item in qualityCheck.vulnerabilities"
            :key="item"
            icon="warning-o"
            :title="item"
          />
        </van-cell-group>
      </section>

      <section class="space-y-3">
        <h3 class="text-lg font-semibold">
          建议调整
        </h3>
        <van-cell-group inset>
          <van-cell
            v-for="item in qualityCheck.recommendations"
            :key="item"
            icon="records-o"
            :title="item"
          />
        </van-cell-group>
      </section>

      <van-button
        v-if="cardId"
        block
        type="primary"
        icon="todo-list-o"
        :to="`/discipline-cards/${cardId}`"
      >
        查看纪律卡
      </van-button>
      <van-button
        v-else
        block
        plain
        type="primary"
        icon="todo-list-o"
        to="/discipline-cards"
      >
        查看纪律卡列表
      </van-button>
    </template>
  </section>
</template>
