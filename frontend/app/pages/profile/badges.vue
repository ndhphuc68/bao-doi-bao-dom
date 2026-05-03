<script setup lang="ts">
definePageMeta({ middleware: ['require-auth'] })

const token = useCookie('auth_token')
const { auth } = useApi()

const { data: profile } = await useAsyncData('badge_profile', () => auth.profile(token.value || ''))

const points = computed(() => profile.value?.points ?? 0)

const badges = computed(() => [
  {
    id: 'pioneer',
    name: 'Người tiên phong',
    desc: 'Tham gia Eco ngay từ những ngày đầu.',
    icon: 'pi pi-compass',
    color: 'text-sky-500',
    bg: 'bg-sky-50',
    unlocked: true
  },
  {
    id: 'first_recycle',
    name: 'Đóng góp đầu tiên',
    desc: 'Hoàn thành đơn thu hồi thiết bị đầu tiên.',
    icon: 'pi pi-verified',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    unlocked: points.value >= 400 // Assuming signup gives 400
  },
  {
    id: 'knight',
    name: 'Hiệp sĩ xanh',
    desc: 'Tích lũy được hơn 1,000 điểm xanh.',
    icon: 'pi pi-shield',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
    unlocked: points.value >= 1000
  },
  {
    id: 'master',
    name: 'Bậc thầy tái chế',
    desc: 'Tích lũy được hơn 5,000 điểm xanh.',
    icon: 'pi pi-trophy',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    unlocked: points.value >= 5000
  }
])
</script>

<template>
  <div class="min-h-[100dvh] bg-slate-50 pb-28">
    <AppPageHeader title="Huy hiệu của tôi" back-to="/profile" />

    <div class="px-5 pt-6">
      <div class="mb-6 rounded-3xl bg-white p-6 text-center shadow-sm border border-slate-100">
        <div class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-500 shadow-inner">
          <i class="pi pi-trophy text-3xl" />
        </div>
        <h2 class="mt-3 text-lg font-black text-slate-900">Thành tựu Eco</h2>
        <p class="mt-1 text-xs font-medium text-slate-500">Thu thập huy hiệu qua các hoạt động xanh.</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div 
          v-for="badge in badges" 
          :key="badge.id"
          class="relative flex flex-col items-center rounded-3xl border p-5 text-center transition-all shadow-sm"
          :class="badge.unlocked ? 'bg-white border-slate-100 scale-100 opacity-100' : 'bg-slate-50 border-slate-200 grayscale opacity-60'"
        >
          <div 
            class="flex h-14 w-14 items-center justify-center rounded-2xl mb-3"
            :class="badge.bg"
          >
            <i :class="[badge.icon, badge.color]" class="text-2xl" />
          </div>
          <h3 class="text-xs font-black text-slate-900 uppercase tracking-tight">{{ badge.name }}</h3>
          <p class="mt-1.5 text-[10px] leading-relaxed text-slate-500 font-medium">{{ badge.desc }}</p>
          
          <div v-if="!badge.unlocked" class="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px] rounded-3xl">
            <i class="pi pi-lock text-slate-400" />
          </div>
        </div>
      </div>
    </div>

    <AppBottomNav />
  </div>
</template>
