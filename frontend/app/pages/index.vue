<script setup>
definePageMeta({
  middleware: ['redirect-root']
})
</script>

<template>
  <div class="flex min-h-[50dvh] flex-col items-center justify-center px-4 text-slate-500">
    <i class="pi pi-spinner mb-3 animate-spin text-2xl text-emerald-600" aria-hidden="true" />
    <p class="text-sm">Đang chuyển hướng…</p>
  </div>
</template>
