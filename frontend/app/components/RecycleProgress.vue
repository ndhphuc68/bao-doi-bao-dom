<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    step: number
    total?: number
  }>(),
  { total: 5 }
)

const percent = computed(() => Math.round((props.step / props.total) * 100))
</script>

<template>
  <div class="mb-6">
    <div class="mb-2 flex justify-between text-xs font-semibold text-slate-600">
      <span>Bước {{ step }}/{{ props.total }}</span>
      <span>{{ percent }}%</span>
    </div>
    <ProgressBar :value="percent" :show-value="false" class="!h-2.5 overflow-hidden rounded-full" />
  </div>
</template>
