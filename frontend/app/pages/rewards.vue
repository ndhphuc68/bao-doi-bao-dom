<script setup>
definePageMeta({ middleware: ['require-auth'] })
</script>

<template>
  <div class="flex min-h-[100dvh] flex-col items-center justify-center px-6 pb-28 pt-8 text-center">
    <i class="pi pi-star mb-4 text-5xl text-amber-400" />
    <h1 class="mb-2 text-lg font-bold text-slate-900">Điểm thưởng</h1>
    <p class="text-sm text-slate-600">Theo dõi điểm xanh và đổi quà — sắp ra mắt.</p>
    <AppBottomNav />
  </div>
</template>
