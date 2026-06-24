<script setup lang="ts">
import type { TriggerEventView } from '../../types/dashboard'

const props = defineProps<{
  trigger: TriggerEventView
}>()

const toneClasses = {
  green: {
    border: 'border-l-stock-green',
    metric: 'text-stock-green',
    tagBg: '#dcfce7',
    tagText: '#15803d',
    primaryColor: '#16a34a',
  },
  amber: {
    border: 'border-l-stock-amber',
    metric: 'text-stock-amber',
    tagBg: '#fef3c7',
    tagText: '#b45309',
    primaryColor: '#111827',
  },
  red: {
    border: 'border-l-stock-red',
    metric: 'text-stock-red',
    tagBg: '#fee2e2',
    tagText: '#b91c1c',
    primaryColor: '#dc2626',
  },
}[props.trigger.tone]
</script>

<template>
  <article class="rounded-lg border border-stock-line border-l-4 bg-stock-surface p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)]" :class="toneClasses.border">
    <div class="flex items-start justify-between gap-3">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <van-tag color="#f1f5f9" text-color="#64748b">
            <span class="font-mono">{{ trigger.stockCode }}</span>
          </van-tag>
          <h4 class="font-semibold">{{ trigger.stockName }}</h4>
        </div>
        <p class="text-sm text-stock-muted">来源：{{ trigger.source }}</p>
      </div>
      <van-tag round :color="toneClasses.tagBg" :text-color="toneClasses.tagText">
        <span class="font-mono font-semibold">{{ trigger.label }}</span>
      </van-tag>
    </div>

    <div v-if="trigger.triggerPrice || trigger.deviation" class="mt-4 grid grid-cols-2 gap-4 border-t border-stock-line pt-3">
      <div v-if="trigger.triggerPrice">
        <p class="font-mono text-xs font-semibold text-stock-muted">触发价格</p>
        <p class="font-mono text-lg font-semibold" :class="toneClasses.metric">{{ trigger.triggerPrice }}</p>
      </div>
      <div v-if="trigger.deviation">
        <p class="font-mono text-xs font-semibold text-stock-muted">偏差值</p>
        <p class="font-mono text-lg font-semibold" :class="toneClasses.metric">{{ trigger.deviation }}</p>
      </div>
    </div>

    <p v-if="trigger.aiPrompt" class="mt-4 rounded bg-slate-50 p-3 text-sm leading-6 text-stock-muted">
      AI 提示：{{ trigger.aiPrompt }}
    </p>

    <div class="mt-4 flex gap-2">
      <van-button
        class="flex-1 !h-10 !rounded"
        size="small"
        :color="toneClasses.primaryColor"
      >
        {{ trigger.primaryAction }}
      </van-button>
      <van-button
        v-if="trigger.secondaryAction"
        class="!h-10 !rounded"
        size="small"
        plain
        color="#64748b"
      >
        {{ trigger.secondaryAction }}
      </van-button>
    </div>
  </article>
</template>
