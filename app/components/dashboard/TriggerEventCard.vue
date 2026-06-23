<script setup lang="ts">
import type { TriggerEventView } from '../../types/dashboard'

const props = defineProps<{
  trigger: TriggerEventView
}>()

const toneClasses = {
  green: {
    border: 'border-l-stock-green',
    badge: 'bg-stock-green/10 text-stock-green',
    metric: 'text-stock-green',
    primary: 'bg-stock-green text-white',
  },
  amber: {
    border: 'border-l-stock-amber',
    badge: 'bg-stock-amber/10 text-stock-amber',
    metric: 'text-stock-amber',
    primary: 'border border-stock-primary text-stock-primary',
  },
  red: {
    border: 'border-l-stock-red',
    badge: 'bg-stock-red/10 text-stock-red',
    metric: 'text-stock-red',
    primary: 'bg-stock-red text-white',
  },
}[props.trigger.tone]
</script>

<template>
  <article class="rounded-lg border border-stock-line border-l-4 bg-stock-surface p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)]" :class="toneClasses.border">
    <div class="flex items-start justify-between gap-3">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-stock-muted">{{ trigger.stockCode }}</span>
          <h4 class="font-semibold">{{ trigger.stockName }}</h4>
        </div>
        <p class="text-sm text-stock-muted">来源：{{ trigger.source }}</p>
      </div>
      <span class="rounded-full px-3 py-1 font-mono text-xs font-semibold" :class="toneClasses.badge">{{ trigger.label }}</span>
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
      <button class="min-h-10 flex-1 rounded px-3 text-sm font-semibold" :class="toneClasses.primary">
        {{ trigger.primaryAction }}
      </button>
      <button v-if="trigger.secondaryAction" class="min-h-10 rounded border border-stock-line px-4 text-sm font-semibold text-stock-muted">
        {{ trigger.secondaryAction }}
      </button>
    </div>
  </article>
</template>
