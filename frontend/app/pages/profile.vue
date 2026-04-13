<script setup>
definePageMeta({ middleware: ['require-auth'] })
</script>

<template>
  <div class="flex min-h-[100dvh] flex-col items-center justify-center px-6 pb-28 pt-8 text-center">
    <Avatar icon="pi pi-user" size="xlarge" shape="circle" class="!bg-emerald-100 !text-emerald-700 mb-4" />
    <h1 class="mb-2 text-lg font-bold text-slate-900">Hồ sơ</h1>
    <p class="text-sm text-slate-600">Quản lý tài khoản sẽ có trong bản cập nhật tới.</p>
    <AppBottomNav />
  </div>
</template>
