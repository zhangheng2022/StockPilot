<template>
  <header class="sticky top-0 z-30 border-b border-stock-line/60 bg-stock-background/90 backdrop-blur">
    <van-nav-bar :border="false">
      <template #title>
        <NuxtLink class="flex items-center gap-2" to="/" aria-label="StockPilot AI 首页">
          <div class="grid size-7 place-items-center rounded bg-stock-primary text-xs font-bold text-white">
            SP
          </div>
          <h1 class="text-lg font-bold tracking-normal text-stock-primary">
            StockPilot AI
          </h1>
        </NuxtLink>
      </template>
      <template #right>
        <van-button icon="bell" size="small" aria-label="通知" />
      </template>
    </van-nav-bar>
  </header>
</template>
