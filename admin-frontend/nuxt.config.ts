import EcoPreset from './app/themes/eco-preset'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  srcDir: 'app/',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      /** Backend API (Docker: NUXT_PUBLIC_API_BASE=http://localhost:3001) */
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001',
      /**
       * Danh sách email được phép vào Admin (phân tách bằng dấu phẩy).
       * Ví dụ: NUXT_PUBLIC_ADMIN_EMAILS="admin@gmail.com,ops@company.com"
       */
      adminEmails: process.env.NUXT_PUBLIC_ADMIN_EMAILS || '',
      /** Email admin tổng (tuỳ chọn). Nếu rỗng, fallback logic super giống backend (dùng adminEmails). */
      superAdminEmails: process.env.NUXT_PUBLIC_SUPER_ADMIN_EMAILS || ''
    }
  },
  routeRules: {
    /** Đường dẫn cũ — Dashboard chính là báo cáo thống kê. */
    '/admin/reports': { redirect: '/admin' },
    /** Gộp UI: returns → orders */
    '/admin/returns': { redirect: '/admin/orders' },
    '/admin/returns/**': { redirect: '/admin/orders' }
  },
  modules: ['@primevue/nuxt-module', '@nuxtjs/tailwindcss', '@nuxt/icon', '@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  devServer: {
    host: process.env.NUXT_HOST || process.env.HOST || '127.0.0.1',
    port: Number(process.env.NUXT_PORT || process.env.PORT) || 3002
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
  app: {
    head: {
      htmlAttrs: { lang: 'vi' },
      meta: [{ name: 'theme-color', content: '#059669' }],
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

