<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
import type { PointLedgerEntry, PointLedgerReason } from '~/types/api'

const { t } = useI18n()
const localePath = useLocalePath()
useHead({ title: t('rewards.title') })

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

const hardcodedRewards = computed(() => [
  {
    id: '1',
    title: t('common.vietnamese') === 'Tiếng Việt' ? 'Voucher Highland 20k' : 'Highland 20k Voucher',
    description: t('common.vietnamese') === 'Tiếng Việt' ? 'Áp dụng cho toàn bộ menu tại các cửa hàng Highland Coffee.' : 'Applicable to the entire menu at Highland Coffee stores.',
    points: 200,
    image: '/images/rewards/voucher.png',
    category: 'Voucher'
  },
  {
    id: '2',
    title: t('common.vietnamese') === 'Tiếng Việt' ? 'Túi vải Eco Friendly' : 'Eco Friendly Tote Bag',
    description: t('common.vietnamese') === 'Tiếng Việt' ? 'Túi vải Canvas chất lượng cao, bền bỉ và bảo vệ môi trường.' : 'High-quality Canvas bag, durable and eco-friendly.',
    points: 500,
    image: '/images/rewards/tote_bag.png',
    category: t('common.vietnamese') === 'Tiếng Việt' ? 'Sản phẩm' : 'Product'
  },
  {
    id: '3',
    title: t('common.vietnamese') === 'Tiếng Việt' ? 'Bình giữ nhiệt Bao Doi' : 'Bao Doi Thermos',
    description: t('common.vietnamese') === 'Tiếng Việt' ? 'Bình inox 304 cao cấp, giữ nhiệt 12h, thiết kế tối giản.' : 'Premium 304 stainless steel bottle, 12h heat retention, minimalist design.',
    points: 1500,
    image: '/images/rewards/bottle.png',
    category: t('common.vietnamese') === 'Tiếng Việt' ? 'Sản phẩm' : 'Product'
  },
  {
    id: '4',
    title: t('common.vietnamese') === 'Tiếng Việt' ? 'Mã giảm giá Grab 50k' : 'Grab 50k Discount Code',
    description: t('common.vietnamese') === 'Tiếng Việt' ? 'Áp dụng cho dịch vụ GrabCar hoặc GrabBike trên toàn quốc.' : 'Applicable to GrabCar or GrabBike services nationwide.',
    points: 1000,
    image: '/images/rewards/grab_voucher.png',
    category: 'Voucher'
  },
  {
    id: '5',
    title: t('common.vietnamese') === 'Tiếng Việt' ? 'Sổ tay tái chế' : 'Recycled Notebook',
    description: t('common.vietnamese') === 'Tiếng Việt' ? 'Sổ tay làm từ giấy tái chế 100%, bìa cứng kraft thân thiện.' : 'Notebook made from 100% recycled paper, friendly kraft hard cover.',
    points: 300,
    image: '/images/rewards/notebook.png',
    category: t('common.vietnamese') === 'Tiếng Việt' ? 'Sản phẩm' : 'Product'
  },
  {
    id: '6',
    title: t('common.vietnamese') === 'Tiếng Việt' ? 'Bộ ống hút tre' : 'Bamboo Straw Set',
    description: t('common.vietnamese') === 'Tiếng Việt' ? 'Bộ 5 ống hút tre tự nhiên kèm cọ rửa và túi vải đựng.' : 'Natural bamboo straw set of 5 with cleaning brush and cloth bag.',
    points: 150,
    image: '/images/rewards/straws.png',
    category: t('common.vietnamese') === 'Tiếng Việt' ? 'Sản phẩm' : 'Product'
  }
])

async function handleRedeem(reward: any) {
  const currentPoints = summary.value?.points ?? 0
  if (currentPoints < reward.points) {
    toast.add({
      severity: 'warn',
      summary: t('rewards.insufficient_points'),
      detail: t('rewards.insufficient_detail'),
      life: 3000
    })
    return
  }

  try {
    await auth.redeem(token.value || '', {
      rewardTitle: reward.title,
      points: reward.points
    })

    toast.add({
      severity: 'success',
      summary: t('rewards.redeem_success'),
      detail: t('rewards.redeem_success_detail').replace('{reward}', reward.title),
      life: 5000
    })

    // Refresh points summary and global profile data
    await Promise.all([
      refresh(),
      refreshNuxtData('auth_profile'),
      refreshNuxtData('desktop_unread_notifications')
    ])
    // The profile in header uses useFetch without a key, so we might need a key or refresh by URL
    // Actually, refreshNuxtData works with keys. Let's ensure AppDesktopHeader uses a key.
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: t('rewards.redeem_fail'),
      detail: t('rewards.redeem_fail_detail'),
      life: 3500
    })
  }
}

function reasonLabel(reason: PointLedgerReason): string {
  const map: Record<PointLedgerReason, string> = {
    SIGNUP: t('rewards.reason_signup'),
    ORDER_APPROVED: t('rewards.reason_order'),
    REDEEM: t('rewards.reason_redeem')
  }
  return map[reason] ?? reason
}

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString(t('common.vietnamese') === 'Tiếng Việt' ? 'vi-VN' : 'en-US', {
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
    return `${t('rewards.tracking_code')}: ${entry.trackingCode}`
  }
  return null
}
</script>

<template>
  <div class="min-h-[100dvh] bg-slate-50 pb-28">
    <AppPageHeader :title="t('rewards.title')" />
    <div class="hidden md:block px-8 py-6">
      <h1 class="text-2xl font-extrabold text-slate-900">{{ t('rewards.header_title') }}</h1>
      <p class="text-sm text-slate-500">{{ t('rewards.header_subtitle') }}</p>
    </div>

    <div class="px-5 pt-4">
      <!-- Points Card -->
      <div
        class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white shadow-[0_20px_50px_rgba(16,185,129,0.35)]"
      >
        <div class="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" aria-hidden="true" />
        <div class="absolute -bottom-10 left-1/3 h-24 w-24 rounded-full bg-white/5" aria-hidden="true" />
        <p class="text-xs font-bold uppercase tracking-wider text-emerald-100/90">{{ t('rewards.current_points') }}</p>
        <p v-if="pending" class="mt-2 text-4xl font-black tabular-nums">…</p>
        <p v-else class="mt-2 text-4xl font-black tabular-nums">
          {{ summary?.points ?? 0 }}
        </p>
        <p class="mt-2 text-sm text-emerald-50/95">
          {{ t('rewards.points_desc') }}
        </p>
      </div>

      <!-- Redemption Section -->
      <div class="mt-8">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-extrabold text-slate-900">{{ t('rewards.redeem_title') }}</h2>
          <NuxtLink to="#" class="text-xs font-bold text-emerald-600 hover:underline">{{ t('rewards.view_all') }}</NuxtLink>
        </div>
        
        <div class="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
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
        <h2 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">{{ t('rewards.history_title') }}</h2>

        <div
          v-if="error"
          class="mt-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          {{ t('rewards.error_history') }}
          <button
            type="button"
            class="ml-2 font-bold underline"
            @click="() => refresh()"
          >
            {{ t('rewards.retry') }}
          </button>
        </div>

        <div
          v-else-if="!pending && (!summary?.entries?.length)"
          class="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500"
        >
          {{ t('rewards.no_transactions') }}
        </div>

        <ul v-else class="mt-3 flex flex-col gap-2">
          <li
            v-for="e in summary?.entries ?? []"
            :key="e.id"
            class="flex gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
          >
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
              :class="e.amount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'"
              aria-hidden="true"
            >
              <i :class="[e.amount > 0 ? 'pi pi-plus' : 'pi pi-gift', 'text-sm font-bold']" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-bold text-slate-900">{{ reasonLabel(e.reason) }}</p>
              <p v-if="orderHint(e)" class="mt-0.5 text-xs text-slate-500">{{ orderHint(e) }}</p>
              <p class="mt-1 text-xs text-slate-400">{{ formatWhen(e.createdAt) }}</p>
            </div>
            <div class="shrink-0 text-right">
              <p 
                class="text-base font-extrabold tabular-nums"
                :class="e.amount > 0 ? 'text-emerald-600' : 'text-rose-600'"
              >
                {{ e.amount > 0 ? '+' : '' }}{{ e.amount }}
              </p>
              <p class="text-[10px] font-semibold uppercase text-slate-400">{{ t('rewards.points_unit') }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <AppBottomNav />
  </div>
</template>
