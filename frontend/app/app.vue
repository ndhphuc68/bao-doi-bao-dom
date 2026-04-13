<script setup lang="ts">
import Toast from 'primevue/toast'
</script>

<template>
  <!-- Khung PWA giống app mobile: tối đa ~phone width, full-bleed trên điện thoại -->
  <div
    class="min-h-[100dvh] bg-gradient-to-b from-emerald-50/95 via-white to-slate-100 selection:bg-emerald-200/60 selection:text-emerald-950"
  >
    <div
      class="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-white pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pt-[env(safe-area-inset-top,0px)] shadow-[0_0_0_1px_rgba(15,23,42,0.06)]"
    >
      <Toast />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
  </div>
</template>
