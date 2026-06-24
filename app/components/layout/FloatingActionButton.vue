<script setup lang="ts">
const router = useRouter()
</script>

<template>
  <van-floating-bubble
    class="shadow-lg"
    icon="plus"
    axis="lock"
    :gap="{ x: 20, y: 76 }"
    aria-label="新建决策"
    @click="router.push('/decisions/new')"
  />
</template>
