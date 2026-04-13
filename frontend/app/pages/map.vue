<script setup>
definePageMeta({ middleware: ['require-auth'] })
</script>

<template>
  <div class="flex min-h-[100dvh] flex-col items-center justify-center px-6 pb-28 pt-8 text-center">
    <i class="pi pi-map-marker mb-4 text-5xl text-emerald-500" />
    <h1 class="mb-2 text-lg font-bold text-slate-900">Bản đồ</h1>
    <p class="mb-6 text-sm text-slate-600">Tính năng đang được hoàn thiện. Bạn có thể tìm điểm thu gom trong luồng hoàn trả.</p>
    <Button label="Đi tới điểm thu gom" rounded @click="navigateTo('/recycle/step-4')" />
    <AppBottomNav />
  </div>
</template>
