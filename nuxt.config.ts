// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  // Данные полностью клиентские (Firestore), поэтому рендерим как SPA после mount.
  // Оставляем ssr включённым (dev-режим Nuxt ломается при ssr:false), а гидратацию
  // сводим к нулю через mounted-гейт в pages/index.vue. Для Pages генерируется
  // та же статика через `nuxi generate`.
  devtools: { enabled: true },

  app: {
    // На репозиторном GitHub Pages сайт живёт по /<repo>/.
    // Переопределяется через NUXT_APP_BASE_URL (напр. '/' для кастомного домена).
    baseURL: process.env.NUXT_APP_BASE_URL || '/meal-plan/',
    head: {
      htmlAttrs: { lang: 'ru' },
      meta: [
        { charset: 'UTF-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Планер' },
        { name: 'theme-color', content: '#0f1115' }
      ],
      link: [{ rel: 'apple-touch-icon', href: 'apple-touch-icon.png' }]
    }
  },

  css: ['~/assets/css/tokens.css'],

  modules: ['@vite-pwa/nuxt'],

  // firebaseConfig публичный by design — безопасно отдавать на клиент.
  // Значения из env NUXT_PUBLIC_FIREBASE_* (в CI — из GitHub Actions secrets).
  runtimeConfig: {
    public: {
      firebase: {
        apiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY || '',
        authDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
        projectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID || '',
        storageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID || ''
      }
    }
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Семейный планер',
      short_name: 'Планер',
      description: 'Меню недели, покупки, КБЖУ и семейные дела',
      lang: 'ru',
      display: 'standalone',
      background_color: '#0f1115',
      theme_color: '#0f1115',
      icons: [
        { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
      ]
    },
    workbox: {
      navigateFallback: undefined,
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}']
    },
    devOptions: { enabled: false }
  }
})
