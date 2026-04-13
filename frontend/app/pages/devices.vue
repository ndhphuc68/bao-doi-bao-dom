<script setup>
definePageMeta({ middleware: ['require-auth'] })
</script>

<template>
  <div class="flex min-h-[60vh] flex-col px-4 pb-28 pt-4">
    <AppPageHeader title="Thiết bị hỗ trợ" back-to="/home" />
    <div class="flex flex-1 flex-col items-center justify-center px-4 text-center">
      <i class="pi pi-desktop mb-4 text-5xl text-emerald-500" />
      <p class="text-sm text-slate-600">
        Danh mục thiết bị được thu gom (điện thoại, laptop, pin, v.v.) sẽ được cập nhật tại đây.
      </p>
    </div>
    <AppBottomNav />
  </div>
</template>
