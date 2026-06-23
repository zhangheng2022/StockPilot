<script setup lang="ts">
import { bottomNavigationItems } from '../data/today-dashboard'
import AppBottomNav from '../components/layout/AppBottomNav.vue'
import AppTopBar from '../components/layout/AppTopBar.vue'
import FloatingActionButton from '../components/layout/FloatingActionButton.vue'
</script>

<template>
  <div class="min-h-dvh bg-stock-background font-sans text-stock-text">
    <AppTopBar />
    <main class="mx-auto w-full max-w-[780px] space-y-6 px-4 pb-28 pt-4">
      <slot />
    </main>
    <FloatingActionButton />
    <AppBottomNav :items="bottomNavigationItems" />
  </div>
</template>
