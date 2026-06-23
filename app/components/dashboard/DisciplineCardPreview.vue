<script setup lang="ts">
import type { DisciplineCardView } from '../../types/dashboard'

defineProps<{
  card: DisciplineCardView
}>()
</script>

<template>
  <article class="flex h-48 min-w-[280px] snap-start flex-col justify-between rounded-lg border border-stock-line bg-white p-4">
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <span class="font-mono text-xs font-semibold text-stock-muted">{{ card.category }}</span>
        <span class="font-mono text-xs font-semibold text-stock-primary">{{ card.progress }}%</span>
      </div>
      <h4 class="font-semibold leading-6">{{ card.title }}</h4>
      <div class="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div class="h-full rounded-full bg-stock-primary" :style="{ width: `${card.progress}%` }"></div>
      </div>
    </div>
    <div class="flex items-end justify-between">
      <div>
        <p class="font-mono text-[11px] font-semibold text-stock-muted">{{ card.metricLabel }}</p>
        <p class="font-mono text-base font-semibold">{{ card.metricValue }}</p>
      </div>
      <button class="grid size-9 place-items-center rounded bg-slate-100 font-semibold text-stock-primary" :aria-label="`查看${card.title}`">
        >
      </button>
    </div>
  </article>
</template>
