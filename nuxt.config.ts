// https://nuxt.com/docs/api/configuration/nuxt-config

import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  modules: ['@vant/nuxt'],
  css: ['~/assets/css/main.css'],
  nitro: {
    preset: 'static',
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})
