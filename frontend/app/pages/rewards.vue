<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
import type { PointLedgerEntry, PointLedgerReason } from '~/types/api'

definePageMeta({ middleware: ['require-auth'] })

const config = useRuntimeConfig()
const token = useCookie('auth_token')
const { auth } = useApi()
const toast = useToast()

const {
  data: summary,
  pending,
  error,
  refresh
} = await useAsyncData(
  'point-ledger',
  () => auth.pointLedger(token.value || ''),
  {
    watch: [token]
  }
)

const hardcodedRewards = [
  {
    id: '1',
    title: 'Voucher Highland 20k',
    description: 'Áp dụng cho toàn bộ menu tại các cửa hàng Highland Coffee.',
    points: 200,
    image: '/images/rewards/voucher.png',
    category: 'Voucher'
  },
  {
    id: '2',
    title: 'Túi vải Eco Friendly',
    description: 'Túi vải Canvas chất lượng cao, bền bỉ và bảo vệ môi trường.',
    points: 500,
    image: '/images/rewards/tote_bag.png',
    category: 'Sản phẩm'
  },
  {
    id: '3',
    title: 'Bình giữ nhiệt Bao Doi',
    description: 'Bình inox 304 cao cấp, giữ nhiệt 12h, thiết kế tối giản.',
    points: 1500,
    image: '/images/rewards/bottle.png',
    category: 'Sản phẩm'
  },
  {
    id: '4',
    title: 'Mã giảm giá Grab 50k',
    description: 'Áp dụng cho dịch vụ GrabCar hoặc GrabBike trên toàn quốc.',
    points: 1000,
    image: '/images/rewards/grab_voucher.png',
    category: 'Voucher'
  },
  {
    id: '5',
    title: 'Sổ tay tái chế',
    description: 'Sổ tay làm từ giấy tái chế 100%, bìa cứng kraft thân thiện.',
    points: 300,
    image: '/images/rewards/notebook.png',
    category: 'Sản phẩm'
  },
  {
    id: '6',
    title: 'Bộ ống hút tre',
    description: 'Bộ 5 ống hút tre tự nhiên kèm cọ rửa và túi vải đựng.',
    points: 150,
    image: '/images/rewards/straws.png',
    category: 'Sản phẩm'
  }
]

function handleRedeem(reward: any) {
  const currentPoints = summary.value?.points ?? 0
  if (currentPoints < reward.points) {
    toast.add({
      severity: 'warn',
      summary: 'Không đủ điểm',
      detail: 'Bạn cần tích lũy thêm điểm để đổi quà này.',
      life: 3000
    })
    return
  }

  // Tạm thời chỉ hiển thị thành công
  toast.add({
    severity: 'success',
    summary: 'Đổi quà thành công',
    detail: `Bạn đã đổi thành công ${reward.title}. Kiểm tra email để nhận mã!`,
    life: 5000
  })
}

function reasonLabel(reason: PointLedgerReason): string {
  const map: Record<PointLedgerReason, string> = {
    SIGNUP: 'Thưởng đăng ký tài khoản',
    ORDER_APPROVED: 'Đơn được admin xác nhận'
  }
  return map[reason] ?? reason
}

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return iso
  }
}

function orderHint(entry: PointLedgerEntry): string | null {
  if (entry.reason === 'ORDER_APPROVED' && entry.trackingCode) {
    return `Mã vận đơn: ${entry.trackingCode}`
  }
  return null
}
</script>

<template>
  <div class="min-h-[100dvh] bg-slate-50 pb-28">
    <AppPageHeader title="Điểm thưởng" />

    <div class="px-5 pt-4">
      <!-- Points Card -->
      <div
        class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white shadow-[0_20px_50px_rgba(16,185,129,0.35)]"
      >
        <div class="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" aria-hidden="true" />
        <div class="absolute -bottom-10 left-1/3 h-24 w-24 rounded-full bg-white/5" aria-hidden="true" />
        <p class="text-xs font-bold uppercase tracking-wider text-emerald-100/90">Điểm xanh hiện có</p>
        <p v-if="pending" class="mt-2 text-4xl font-black tabular-nums">…</p>
        <p v-else class="mt-2 text-4xl font-black tabular-nums">
          {{ summary?.points ?? 0 }}
        </p>
        <p class="mt-2 text-sm text-emerald-50/95">
          Tích điểm khi đăng ký và khi đơn hoàn trả được cửa hàng xác nhận.
        </p>
      </div>

      <!-- Redemption Section -->
      <div class="mt-8">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-extrabold text-slate-900">Đổi quà hấp dẫn</h2>
          <NuxtLink to="#" class="text-xs font-bold text-emerald-600 hover:underline">Xem tất cả</NuxtLink>
        </div>
        
        <div class="mt-4 grid grid-cols-2 gap-3">
          <ClientOnly>
            <RewardCard
              v-for="reward in hardcodedRewards"
              :key="reward.id"
              :reward="reward"
              @redeem="handleRedeem"
            />
          </ClientOnly>
        </div>
      </div>

      <!-- History Section -->
      <div class="mt-8 pb-4">
        <h2 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">Lịch sử cộng điểm</h2>

        <div
          v-if="error"
          class="mt-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          Không tải được lịch sử. Thử lại sau.
          <button
            type="button"
            class="ml-2 font-bold underline"
            @click="() => refresh()"
          >
            Tải lại
          </button>
        </div>

        <div
          v-else-if="!pending && (!summary?.entries?.length)"
          class="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500"
        >
          Chưa có giao dịch điểm. Lịch sử sẽ hiện sau khi bạn nhận thưởng hoặc đơn được xác nhận.
        </div>

        <ul v-else class="mt-3 flex flex-col gap-2">
          <li
            v-for="e in summary?.entries ?? []"
            :key="e.id"
            class="flex gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
          >
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"
              aria-hidden="true"
            >
              <i class="pi pi-plus text-sm font-bold" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-bold text-slate-900">{{ reasonLabel(e.reason) }}</p>
              <p v-if="orderHint(e)" class="mt-0.5 text-xs text-slate-500">{{ orderHint(e) }}</p>
              <p class="mt-1 text-xs text-slate-400">{{ formatWhen(e.createdAt) }}</p>
            </div>
            <div class="shrink-0 text-right">
              <p class="text-base font-extrabold tabular-nums text-emerald-600">+{{ e.amount }}</p>
              <p class="text-[10px] font-semibold uppercase text-slate-400">điểm</p>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <AppBottomNav />
  </div>
</template>
