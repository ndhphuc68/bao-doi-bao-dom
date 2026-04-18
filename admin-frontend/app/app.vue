<script setup lang="ts">
import Toast from 'primevue/toast'
</script>

<template>
  <div class="min-h-[100dvh] bg-slate-50 text-slate-900">
    <Toast />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

