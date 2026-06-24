<script setup lang="ts">
import type { BottomNavigationItem } from '../../types/dashboard'

defineProps<{
  items: BottomNavigationItem[]
}>()
</script>

<template>
  <van-tabbar
    route
    fixed
    placeholder
    safe-area-inset-bottom
  >
    <van-tabbar-item
      v-for="item in items"
      :key="item.label"
      :icon="item.icon"
      :to="item.href"
    >
      <span class="font-mono text-xs font-semibold">{{ item.label }}</span>
    </van-tabbar-item>
  </van-tabbar>
</template>
