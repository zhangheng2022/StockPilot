<script setup lang="ts">
import type { BottomNavigationItem } from '../../types/dashboard'

defineProps<{
  items: BottomNavigationItem[]
}>()
</script>

<template>
  <nav class="fixed inset-x-0 bottom-0 z-30 border-t border-stock-line bg-white">
    <div class="mx-auto grid max-w-[780px] grid-cols-5 px-2 py-2">
      <NuxtLink
        v-for="item in items"
        :key="item.label"
        class="flex flex-col items-center gap-1 rounded-lg px-2 py-1"
        :class="item.active ? 'bg-stock-primary text-white' : 'text-stock-muted'"
        :to="item.href"
      >
        <span class="font-mono text-xs font-semibold">{{ item.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>
