<script setup lang="ts">
import Toast from 'primevue/toast'

const isSplashVisible = ref(true)
const token = useCookie('auth_token')

const { t } = useI18n()
useHead({
  titleTemplate: (title) => title ? `${title} | ${t('common.app_name')}` : `${t('common.app_name')} — ${t('common.tagline')}`
})

onMounted(() => {
  setTimeout(() => {
    isSplashVisible.value = false
  }, 3000)
})
</script>

<template>
  <div
    class="min-h-[100dvh] bg-slate-50 selection:bg-emerald-200/60 selection:text-emerald-950"
  >
    <Toast position="top-center" />
    <SplashScreen :is-visible="isSplashVisible" />

    <div v-show="!isSplashVisible" class="flex min-h-[100dvh] flex-col">
      <!-- PC Top Header: Only show on desktop and if logged in -->
      <AppDesktopHeader v-if="token" class="hidden md:block" />

      <!-- Main Content Area -->
      <main class="flex-1">
        <!-- Content Container: On mobile, this is the centered "phone" frame. On PC, it expands and centers. -->
        <div
          :class="[
            'mx-auto flex min-h-full flex-col transition-all duration-300',
            token
              ? 'w-full max-w-md bg-white pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pt-[env(safe-area-inset-top,0px)] shadow-[0_0_0_1px_rgba(15,23,42,0.06)] md:max-w-7xl md:bg-transparent md:px-8 md:pt-6 md:shadow-none'
              : 'w-full max-w-md bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.06)] md:max-w-none md:bg-transparent md:shadow-none'
          ]"
        >
          <NuxtLayout>
            <NuxtPage />
          </NuxtLayout>
        </div>
      </main>
    </div>
  </div>
</template>
