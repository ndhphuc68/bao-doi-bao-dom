<script setup lang="ts">
const { t } = useI18n()
defineProps<{
  reward: {
    id: string
    title: string
    description: string
    points: number
    image: string
    category: string
  }
}>()

defineEmits(['redeem'])
</script>

<template>
  <div class="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md">
    <div class="aspect-[4/3] overflow-hidden bg-slate-50">
      <img
        :src="reward.image"
        :alt="reward.title"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div class="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 backdrop-blur-sm">
        {{ reward.category }}
      </div>
    </div>

    <div class="flex flex-1 flex-col p-4">
      <h3 class="line-clamp-1 text-sm font-bold text-slate-900">{{ reward.title }}</h3>
      <p class="mt-1 line-clamp-2 text-xs text-slate-500">{{ reward.description }}</p>

      <div class="mt-4 flex items-center justify-between">
        <div class="flex items-center gap-1">
          <span class="text-base font-black text-emerald-600 tabular-nums">{{ reward.points }}</span>
          <span class="text-[10px] font-bold uppercase text-slate-400">{{ t('rewards.points_unit') }}</span>
        </div>
        <button
          type="button"
          class="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100 active:scale-95"
          @click="$emit('redeem', reward)"
        >
          {{ t('rewards.redeem_button') }}
        </button>
      </div>
    </div>
  </div>
</template>
