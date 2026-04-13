import EcoPreset from './app/themes/eco-preset'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  srcDir: 'app/',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      /** Backend API (Docker: NUXT_PUBLIC_API_BASE=http://localhost:3001) */
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001'
    }
  },
  modules: ['@primevue/nuxt-module', '@vite-pwa/nuxt', '@nuxtjs/tailwindcss', '@nuxt/icon', '@pinia/nuxt'],
  css: ['leaflet/dist/leaflet.css', '~/assets/css/main.css'],
  devServer: {
    host: process.env.NUXT_HOST || process.env.HOST || '127.0.0.1',
    port: Number(process.env.NUXT_PORT || process.env.PORT) || 3000
  },
  primevue: {
    options: {
      ripple: true,
      theme: {
        preset: EcoPreset,
        options: {
          darkModeSelector: '.p-dark'
        }
      }
    }
  },
  vite: {
    server: {
      watch: {
        usePolling: process.env.CHOKIDAR_USEPOLLING === 'true',
        interval: Number(process.env.CHOKIDAR_INTERVAL) || 1000
      }
    }
  },
  pwa: {
    strategies: 'injectManifest',
    srcDir: '.',
    filename: 'sw.ts',
    registerType: 'autoUpdate',
    manifest: {
      name: 'Eco — Tái chế điện tử',
      short_name: 'Eco',
      description: 'Đặt lịch hoàn trả thiết bị, tìm điểm thu gom gần bạn',
      theme_color: '#059669',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait-primary',
      scope: '/',
      start_url: '/',
      lang: 'vi',
      categories: ['utilities', 'lifestyle']
    },
    injectManifest: {
      rollupFormat: 'iife',
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      type: 'module'
    }
  },
  app: {
    head: {
      htmlAttrs: { lang: 'vi' },
      meta: [
        { name: 'theme-color', content: '#059669' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'Eco' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,600&display=swap'
        }
      ]
    }
  }
})
