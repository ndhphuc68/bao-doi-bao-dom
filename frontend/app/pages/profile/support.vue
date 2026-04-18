<script setup>
definePageMeta({ middleware: ['require-auth'] })
</script>

<template>
  <div class="min-h-[100dvh] bg-slate-50 pb-28">
    <AppPageHeader title="Trung tâm hỗ trợ" back-to="/profile" />
    <div class="flex flex-col items-center justify-center px-6 pt-10 text-center">
      <i class="pi pi-question-circle mb-4 text-5xl text-emerald-500" aria-hidden="true" />
      <h1 class="mb-2 text-lg font-bold text-slate-900">Liên hệ hỗ trợ</h1>
      <p class="text-sm text-slate-600">Tính năng chat/FAQ sẽ có trong bản cập nhật tới.</p>

      <div class="mt-5 w-full max-w-sm rounded-2xl bg-white p-4 text-left shadow-sm">
        <p class="text-xs font-extrabold uppercase tracking-wider text-slate-400">Kênh hỗ trợ</p>
        <p class="mt-2 text-sm font-semibold text-slate-900">Email</p>
        <p class="text-sm text-slate-600">support@eco.local</p>
      </div>
    </div>
    <AppBottomNav />
  </div>
</template>

