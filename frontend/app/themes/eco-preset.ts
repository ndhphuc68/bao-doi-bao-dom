import { definePreset } from '@primeuix/themes'
/**
 * Import file trực tiếp thay vì `@primeuix/themes/aura` để tránh lỗi resolve
 * khi Nuxt/jiti (và một số môi trường Docker) không khớp subpath exports.
 */
import Aura from '../../node_modules/@primeuix/themes/dist/aura/index.mjs'
/** Aura với màu primary emerald — đồng bộ app Eco */
export default definePreset(Aura, {
  semantic: {
    primary: {
      50: '{emerald.50}',
      100: '{emerald.100}',
      200: '{emerald.200}',
      300: '{emerald.300}',
      400: '{emerald.400}',
      500: '{emerald.500}',
      600: '{emerald.600}',
      700: '{emerald.700}',
      800: '{emerald.800}',
      900: '{emerald.900}',
      950: '{emerald.950}'
    }
  }
})
