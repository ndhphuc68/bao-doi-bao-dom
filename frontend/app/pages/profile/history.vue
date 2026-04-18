<script setup>
definePageMeta({ middleware: ['require-auth'] })
</script>

<template>
  <div class="min-h-[100dvh] bg-slate-50 pb-28">
    <AppPageHeader title="Lịch sử đóng góp" back-to="/profile" />
    <div class="flex flex-col items-center justify-center px-6 pt-10 text-center">
      <i class="pi pi-history mb-4 text-5xl text-slate-500" aria-hidden="true" />
      <h1 class="mb-2 text-lg font-bold text-slate-900">Chưa có dữ liệu</h1>
      <p class="text-sm text-slate-600">Lịch sử hoàn trả/đóng góp sẽ hiển thị tại đây.</p>
    </div>
    <AppBottomNav />
  </div>
</template>

