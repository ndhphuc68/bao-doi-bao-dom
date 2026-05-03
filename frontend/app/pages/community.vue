<script setup lang="ts">
definePageMeta({ middleware: ['require-auth'] })
useHead({ title: 'Cộng đồng' })

const token = useCookie('auth_token')
const { community } = useApi()

const { data: stats } = await useAsyncData('community_stats', () => community.stats(token.value || ''))
const { data: leaderboard } = await useAsyncData('community_leaderboard', () => community.leaderboard(token.value || ''))
const { data: feed } = await useAsyncData('community_feed', () => community.feed(token.value || ''))

function getRankColor(index: number) {
  if (index === 0) return 'text-amber-500' // Gold
  if (index === 1) return 'text-slate-400' // Silver
  if (index === 2) return 'text-amber-700' // Bronze
  return 'text-slate-400'
}

function getRankBg(index: number) {
  if (index === 0) return 'bg-amber-50 border-amber-100 shadow-amber-100/50 shadow-lg scale-105 z-10'
  return 'bg-white border-slate-100'
}

function formatTime(iso: string) {
  const date = new Date(iso)
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}
</script>

<template>
  <div class="min-h-[100dvh] bg-slate-50 pb-28">
    <!-- Header -->
    <div class="sticky top-0 z-20 bg-emerald-600 px-5 pb-10 pt-4 text-white shadow-lg md:hidden">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-extrabold tracking-tight">Cộng đồng Eco</h1>
        <NuxtLink to="/rewards" class="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur-md">
          <i class="pi pi-star-fill text-amber-300" />
          Đổi thưởng
        </NuxtLink>
      </div>
      <p class="mt-2 text-xs font-medium text-emerald-100 opacity-90">Cùng nhau kiến tạo một tương lai xanh hơn.</p>
      
      <!-- Impact Stats -->
      <div class="mt-6 grid grid-cols-3 gap-3">
        <div class="flex flex-col items-center rounded-2xl bg-white/10 p-3 text-center backdrop-blur-sm">
          <span class="text-lg font-black">{{ stats?.totalDevices || 0 }}</span>
          <span class="text-[10px] font-bold uppercase opacity-80">Thiết bị</span>
        </div>
        <div class="flex flex-col items-center rounded-2xl bg-white/10 p-3 text-center backdrop-blur-sm">
          <span class="text-lg font-black">{{ stats?.co2Saved?.toFixed(1) || 0 }}kg</span>
          <span class="text-[10px] font-bold uppercase opacity-80">CO2 Giảm</span>
        </div>
        <div class="flex flex-col items-center rounded-2xl bg-white/10 p-3 text-center backdrop-blur-sm">
          <span class="text-lg font-black">{{ stats?.totalUsers || 0 }}</span>
          <span class="text-[10px] font-bold uppercase opacity-80">Eco-ers</span>
        </div>
      </div>
    </div>

    <!-- Desktop Title and Stats -->
    <div class="hidden md:block px-8 py-6">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900">Cộng đồng Eco</h1>
          <p class="text-sm text-slate-500">Cùng nhau kiến tạo một tương lai xanh hơn tại Đà Nẵng</p>
        </div>
        <div class="flex gap-4">
          <div class="bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm text-center min-w-[140px]">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Thiết bị</p>
            <p class="text-2xl font-black text-emerald-600">{{ stats?.totalDevices || 0 }}</p>
          </div>
          <div class="bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm text-center min-w-[140px]">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">CO2 Giảm</p>
            <p class="text-2xl font-black text-emerald-600">{{ stats?.co2Saved?.toFixed(1) || 0 }}kg</p>
          </div>
          <div class="bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm text-center min-w-[140px]">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Eco-ers</p>
            <p class="text-2xl font-black text-emerald-600">{{ stats?.totalUsers || 0 }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="relative rounded-t-[32px] bg-slate-50 px-5 pt-2 md:pt-0 md:-mt-0">
      <!-- Activity Feed -->
      <div class="mb-8">
        <div class="mb-4 flex items-center justify-between px-1">
          <h2 class="text-base font-extrabold text-slate-900 uppercase tracking-wide">Hành động xanh mới</h2>
          <i class="pi pi-bolt text-emerald-500 animate-pulse" />
        </div>
        <div class="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          <div 
            v-for="item in feed" 
            :key="item.id"
            class="flex min-w-[200px] items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
          >
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <i class="pi pi-verified text-lg" />
            </div>
            <div class="min-w-0">
              <p class="truncate text-xs font-bold text-slate-800">{{ item.userName }}</p>
              <p class="truncate text-[10px] text-slate-500">vừa thu hồi {{ item.deviceType }}</p>
            </div>
          </div>
          <div v-if="!feed?.length" class="w-full py-4 text-center text-xs text-slate-400">Chưa có hành động mới.</div>
        </div>
      </div>

      <!-- Leaderboard -->
      <div class="mb-4 flex items-center justify-between px-1">
        <h2 class="text-base font-extrabold text-slate-900 uppercase tracking-wide">Bảng xếp hạng</h2>
        <span class="text-[10px] font-bold text-slate-400">Top 10 Eco-ers</span>
      </div>

      <div class="space-y-2.5">
        <div 
          v-for="(user, index) in leaderboard" 
          :key="user.id"
          class="flex items-center gap-4 rounded-2xl border px-4 py-3.5 transition-all"
          :class="getRankBg(index)"
        >
          <div class="flex h-8 w-8 shrink-0 items-center justify-center text-lg font-black italic" :class="getRankColor(index)">
            {{ index + 1 }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="truncate text-sm font-bold text-slate-900">{{ user.name }}</p>
            <p class="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Hiệp sĩ xanh</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-black text-slate-900">{{ user.points }}</p>
            <p class="text-[10px] font-bold text-slate-400">ĐIỂM</p>
          </div>
        </div>
        
        <div v-if="!leaderboard?.length" class="py-10 text-center text-sm text-slate-400">
          Đang tải bảng xếp hạng...
        </div>
      </div>
    </div>

    <AppBottomNav />
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
