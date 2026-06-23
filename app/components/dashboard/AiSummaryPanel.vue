<script setup lang="ts">
import type { DashboardSummary } from '../../types/dashboard'

defineProps<{
  summary: DashboardSummary
}>()
</script>

<template>
  <section class="space-y-2">
    <p class="text-sm text-stock-muted">{{ summary.greeting }}</p>
    <h2 class="text-xl font-semibold">{{ summary.title }}</h2>
    <div class="rounded-lg border border-stock-primary/10 bg-stock-primary-soft p-4">
      <div class="flex gap-3">
        <div class="grid size-7 shrink-0 place-items-center rounded bg-stock-primary text-sm font-bold text-white">
          AI
        </div>
        <div class="space-y-1">
          <p class="font-semibold text-stock-primary">
            {{ summary.message }}
          </p>
          <p class="text-sm leading-6 text-stock-muted">
            {{ summary.detail }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
