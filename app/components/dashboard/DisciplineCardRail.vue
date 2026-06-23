<script setup lang="ts">
import type { DisciplineCardView } from '../../types/dashboard'
import DisciplineCardPreview from './DisciplineCardPreview.vue'

defineProps<{
  cards: DisciplineCardView[]
}>()
</script>

<template>
  <div class="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
    <DisciplineCardPreview
      v-for="card in cards"
      :key="card.title"
      :card="card"
    />
  </div>
</template>
