<template>
  <header class="sticky top-0 z-30 border-b border-stock-line/60 bg-stock-background/90 backdrop-blur">
    <div class="mx-auto flex h-14 w-full max-w-[780px] items-center justify-between px-4">
      <NuxtLink class="flex items-center gap-2" to="/" aria-label="StockPilot AI 首页">
        <div class="grid size-7 place-items-center rounded bg-stock-primary text-xs font-bold text-white">
          SP
        </div>
        <h1 class="text-lg font-bold tracking-normal text-stock-primary">
          StockPilot AI
        </h1>
      </NuxtLink>
      <button class="grid size-9 place-items-center rounded border border-stock-line bg-white text-stock-muted" aria-label="通知">
        <span class="text-base">!</span>
      </button>
    </div>
  </header>
</template>
