<script setup lang="ts">
defineProps<{
  title: string
  backTo?: string
}>()
</script>

<template>
  <header
    class="sticky top-0 z-20 flex items-center gap-1 border-b border-slate-200/80 bg-white/90 px-2 py-2 backdrop-blur-md sm:px-3"
  >
    <NuxtLink v-if="backTo" :to="backTo" class="shrink-0" aria-label="Quay lại">
      <Button v-ripple icon="pi pi-arrow-left" rounded text severity="secondary" />
    </NuxtLink>
    <h2
      class="min-w-0 flex-1 truncate text-center text-base font-semibold tracking-tight text-slate-900 sm:text-lg"
      :class="backTo ? 'pr-10' : ''"
    >
      {{ title }}
    </h2>
  </header>
</template>
