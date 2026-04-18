<script setup>
definePageMeta({ middleware: ['require-auth'] })
</script>

<template>
  <div class="min-h-[100dvh] bg-slate-50 pb-28">
    <AppPageHeader title="Điểm thưởng & Huy hiệu" back-to="/profile" />
    <div class="flex flex-col items-center justify-center px-6 pt-10 text-center">
      <i class="pi pi-trophy mb-4 text-5xl text-amber-500" aria-hidden="true" />
      <h1 class="mb-2 text-lg font-bold text-slate-900">Sắp ra mắt</h1>
      <p class="text-sm text-slate-600">Điểm thưởng và huy hiệu sẽ được đồng bộ tại đây.</p>
      <NuxtLink to="/rewards" class="mt-4 text-sm font-semibold text-emerald-600 hover:underline">
        Xem trang Điểm thưởng
      </NuxtLink>
    </div>
    <AppBottomNav />
  </div>
</template>

