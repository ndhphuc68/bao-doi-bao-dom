<script setup lang="ts">
import { getApiErrorMessage } from '~/utils/api/errors'

definePageMeta({ middleware: ['require-auth'] })
useHead({ title: 'Thông báo' })

const token = useCookie('auth_token')
const { notifications } = useApi()

const { data: rows, pending, error, refresh } = await useAsyncData(
  'user_notifications',
  () => notifications.list(token.value || ''),
  { watch: [token] }
)

const markRead = async (id: string, isRead: boolean) => {
  if (isRead) return
  try {
    await notifications.markRead(token.value || '', id)
    await refresh()
  } catch (err) {
    console.error('Failed to mark notification as read:', err)
  }
}

const markAllRead = async () => {
  try {
    await notifications.markAllRead(token.value || '')
    await refresh()
  } catch (err) {
    console.error('Failed to mark all as read:', err)
  }
}

function typeIcon(type: string) {
  switch (type) {
    case 'SUCCESS': return 'pi pi-check-circle text-emerald-500'
    case 'WARN': return 'pi pi-exclamation-triangle text-amber-500'
    default: return 'pi pi-info-circle text-sky-500'
  }
}

function typeBg(type: string) {
  switch (type) {
    case 'SUCCESS': return 'bg-emerald-50'
    case 'WARN': return 'bg-amber-50'
    default: return 'bg-sky-50'
  }
}

function formatTime(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return 'Vừa xong'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`
  
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>

<template>
  <div class="min-h-[100dvh] bg-slate-50 pb-28">
    <div class="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-100 bg-white/80 px-4 backdrop-blur-md">
      <div class="flex items-center gap-3">
        <NuxtLink to="/home" class="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-slate-100">
          <i class="pi pi-chevron-left text-slate-600" />
        </NuxtLink>
        <h1 class="text-base font-bold text-slate-900">Thông báo</h1>
      </div>
      <button 
        v-if="rows?.some(n => !n.isRead)"
        @click="markAllRead"
        class="text-xs font-bold text-emerald-600 hover:underline"
      >
        Đọc tất cả
      </button>
    </div>

    <div class="px-4 py-4">
      <div v-if="pending && !rows" class="flex flex-col gap-3">
        <div v-for="i in 5" :key="i" class="h-24 w-full animate-pulse rounded-2xl bg-white shadow-sm" />
      </div>

      <div v-else-if="error" class="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-center text-sm text-rose-800">
        {{ getApiErrorMessage(error) }}
        <button @click="refresh" class="ml-2 font-bold underline">Thử lại</button>
      </div>

      <div v-else-if="!rows?.length" class="flex flex-col items-center justify-center py-20 text-center">
        <div class="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-300">
          <i class="pi pi-bell-slash text-3xl" />
        </div>
        <p class="mt-4 text-sm font-medium text-slate-500">Bạn chưa có thông báo nào.</p>
      </div>

      <div v-else class="flex flex-col gap-2.5">
        <div 
          v-for="n in rows" 
          :key="n.id"
          class="group relative flex gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-emerald-100 active:scale-[0.98]"
          :class="{ 'opacity-75': n.isRead }"
          @click="markRead(n.id, n.isRead)"
        >
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" :class="typeBg(n.type)">
            <i :class="typeIcon(n.type)" />
          </div>
          
          <div class="flex-1">
            <div class="flex items-start justify-between gap-2">
              <h3 class="text-sm font-bold leading-snug" :class="n.isRead ? 'text-slate-700' : 'text-slate-900'">
                {{ n.title }}
              </h3>
              <div v-if="!n.isRead" class="h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
            <p class="mt-1 text-xs leading-relaxed text-slate-500" :class="{ 'line-clamp-2': n.isRead }">
              {{ n.message }}
            </p>
            <div class="mt-2 text-[10px] font-medium text-slate-400">
              {{ formatTime(n.createdAt) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <AppBottomNav />
  </div>
</template>
