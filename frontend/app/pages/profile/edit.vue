<script setup>
definePageMeta({ middleware: ['require-auth'] })
</script>

<template>
  <div class="min-h-[100dvh] bg-slate-50 pb-28">
    <AppPageHeader title="Chỉnh sửa thông tin" back-to="/profile" />
    <div class="flex flex-col items-center justify-center px-6 pt-10 text-center">
      <i class="pi pi-user-edit mb-4 text-5xl text-emerald-500" aria-hidden="true" />
      <h1 class="mb-2 text-lg font-bold text-slate-900">Sắp ra mắt</h1>
      <p class="text-sm text-slate-600">Màn hình chỉnh sửa hồ sơ sẽ được bổ sung trong bản cập nhật tới.</p>
    </div>
    <AppBottomNav />
  </div>
</template>

