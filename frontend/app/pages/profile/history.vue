<script setup lang="ts">
definePageMeta({ middleware: ['require-auth'] })

const token = useCookie('auth_token')
const { auth } = useApi()

const { data: summary, pending } = await useAsyncData('point_history', () => auth.pointLedger(token.value || ''))

function formatAmount(n: number) {
  return n > 0 ? `+${n}` : n
}

function getReasonLabel(reason: string) {
  const map: Record<string, string> = {
    SIGNUP: 'Thành viên mới',
    ORDER_COMPLETED: 'Hoàn trả thiết bị',
    REWARD_REDEEMED: 'Đổi quà tặng',
    ADMIN_ADJUST: 'Điều chỉnh bởi Admin'
  }
  return map[reason] ?? reason
}

function getReasonIcon(reason: string) {
  if (reason === 'SIGNUP') return 'pi pi-user-plus text-emerald-500'
  if (reason === 'ORDER_COMPLETED') return 'pi pi-sync text-emerald-500'
  if (reason === 'REWARD_REDEEMED') return 'pi pi-gift text-amber-500'
  return 'pi pi-info-circle text-slate-400'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="min-h-[100dvh] bg-slate-50 pb-28">
    <AppPageHeader title="Lịch sử điểm xanh" back-to="/profile" />

    <div class="px-5 pt-6">
      <!-- Total Summary -->
      <div class="mb-6 rounded-3xl bg-emerald-600 p-6 text-white shadow-lg shadow-emerald-600/20">
        <p class="text-xs font-bold uppercase tracking-wider opacity-80">Tổng điểm tích lũy</p>
        <div class="mt-1 flex items-baseline gap-2">
          <span class="text-3xl font-black">{{ summary?.totalPoints ?? 0 }}</span>
          <span class="text-sm font-bold opacity-80">Eco-points</span>
        </div>
      </div>

      <div class="mb-4 px-1">
        <h2 class="text-base font-extrabold text-slate-900 uppercase tracking-wide">Chi tiết giao dịch</h2>
      </div>

      <div v-if="pending" class="py-12 text-center text-sm text-slate-500">Đang tải…</div>
      
      <div v-else-if="!summary?.items?.length" class="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
        <i class="pi pi-history mb-3 text-4xl text-slate-200" />
        <p class="text-sm font-bold text-slate-400">Chưa có giao dịch nào.</p>
      </div>

      <div v-else class="space-y-3">
        <div 
          v-for="item in summary.items" 
          :key="item.id"
          class="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
        >
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50">
            <i :class="getReasonIcon(item.reason)" class="text-lg" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="truncate text-sm font-bold text-slate-900">{{ getReasonLabel(item.reason) }}</p>
            <p class="text-[10px] font-medium text-slate-400">{{ formatDate(item.createdAt) }}</p>
          </div>
          <div class="text-right">
            <p 
              class="text-sm font-black tabular-nums" 
              :class="item.amount > 0 ? 'text-emerald-600' : 'text-rose-600'"
            >
              {{ formatAmount(item.amount) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <AppBottomNav />
  </div>
</template>
