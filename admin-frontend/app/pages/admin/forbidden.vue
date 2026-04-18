<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['require-admin']
})
</script>

<template>
  <div class="mx-auto flex max-w-xl flex-col items-center justify-center gap-3 py-10 text-center">
    <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
      <i class="pi pi-lock text-2xl" aria-hidden="true" />
    </div>
    <h1 class="text-xl font-bold tracking-tight">Không có quyền truy cập</h1>
    <p class="text-sm leading-relaxed text-slate-600">
      Tài khoản của bạn không nằm trong danh sách admin. Hãy cấu hình `NUXT_PUBLIC_ADMIN_EMAILS` hoặc đăng nhập tài khoản khác.
    </p>
    <div class="mt-2 flex gap-2">
      <NuxtLink to="/admin"><Button label="Về Dashboard" outlined class="!rounded-xl" /></NuxtLink>
      <NuxtLink to="/admin-login"><Button label="Đăng nhập lại" class="!rounded-xl" /></NuxtLink>
    </div>
  </div>
</template>

