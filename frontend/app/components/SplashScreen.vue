<template>
  <Transition name="fade">
    <div
      v-if="isVisible"
      class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
    >
      <!-- Logo Container with animation -->
      <div class="relative flex flex-col items-center">
        <div class="relative h-40 w-40 animate-pulse-slow">
          <img
            src="/logo_splash.png"
            alt="Eco Logo"
            class="h-full w-full object-contain animate-in fade-in zoom-in duration-1000 ease-out"
          />
          
          <!-- Subtle Glow Effect -->
          <div class="absolute inset-0 -z-10 animate-ping rounded-full bg-emerald-100/50 blur-2xl"></div>
        </div>

        <!-- App Name / Tagline -->
        <div class="mt-8 overflow-hidden text-center">
          <h1 class="animate-in slide-in-from-bottom duration-700 delay-300 fill-mode-both text-2xl font-bold tracking-tight text-slate-900">
            {{ t('common.app_name') }}
          </h1>
          <p class="mt-1 animate-in slide-in-from-bottom duration-700 delay-500 fill-mode-both text-sm font-medium text-slate-500">
            {{ t('common.tagline') }}
          </p>
        </div>
      </div>

      <!-- Loading Indicator at Bottom -->
      <div class="absolute bottom-16 flex flex-col items-center gap-3">
        <div class="flex gap-1.5">
          <div class="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.3s]"></div>
          <div class="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400 [animation-delay:-0.15s]"></div>
          <div class="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-300"></div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const { t } = useI18n()
defineProps<{
  isVisible: boolean
}>()
</script>

<style scoped>
.fade-leave-active {
  transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-leave-to {
  opacity: 0;
}

@keyframes pulse-slow {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.02);
    opacity: 0.98;
  }
}

.animate-pulse-slow {
  animation: pulse-slow 3s infinite ease-in-out;
}
</style>
