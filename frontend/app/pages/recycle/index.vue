<script setup lang="ts">
import { formatOrderCreated, userOrderStatusClass, userOrderStatusLabel } from '~/utils/recycling-order-display'

definePageMeta({ middleware: ['require-auth'] })

const router = useRouter()
const token = useCookie('auth_token')
const { recyclingRequests } = useApi()

const { data: orders, pending, error, refresh } = await useAsyncData(
  'recycle_hub_orders',
  async () => {
    const t = token.value
    if (!t) return []
    return recyclingRequests.listMine(t)
  },
  { watch: [token] }
)

function goNewRequest() {
  router.push('/recycle/step-1')
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col bg-slate-50">
    <AppPageHeader title="Hoàn trả" back-to="/home" />

    <div class="flex-1 overflow-y-auto px-4 pb-28 pt-2">
      <div class="mb-5 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 px-5 py-5 text-white shadow-lg shadow-emerald-900/15">
        <p class="text-sm font-semibold text-emerald-50/95">Tạo yêu cầu mới</p>
        <p class="mt-1 text-xs leading-relaxed text-emerald-100/90">
          Đặt lịch thu gom thiết bị điện tử tại điểm thu gần bạn.
        </p>
        <Button
          label="Tạo đơn hoàn trả"
          icon="pi pi-plus"
          class="mt-4 !w-full !rounded-2xl !border-0 !bg-white !py-3 !font-bold !text-emerald-800"
          @click="goNewRequest"
        />
      </div>

      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-base font-bold text-slate-900">Đơn của tôi</h2>
        <button
          type="button"
          class="text-xs font-semibold text-emerald-600 active:opacity-80"
          @click="refresh"
        >
          Làm mới
        </button>
      </div>

      <div v-if="pending" class="py-12 text-center text-sm text-slate-500">Đang tải…</div>
      <div
        v-else-if="error"
        class="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800"
      >
        Không tải được danh sách. Thử lại sau.
      </div>
      <div
        v-else-if="!orders?.length"
        class="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center"
      >
        <p class="text-sm text-slate-600">Bạn chưa có đơn hoàn trả nào.</p>
        <Button
          label="Tạo đơn đầu tiên"
          icon="pi pi-sync"
          class="mt-4 !rounded-2xl"
          @click="goNewRequest"
        />
      </div>
      <div v-else class="space-y-3">
        <NuxtLink
          v-for="o in orders"
          :key="o.id"
          :to="`/profile/returns/${o.id}?from=recycle`"
          class="block rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition active:scale-[0.99] hover:border-emerald-200"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
              <p class="font-mono text-sm font-bold text-slate-900">{{ o.trackingCode }}</p>
              <p class="mt-0.5 truncate text-sm font-semibold text-slate-800">{{ o.deviceName }}</p>
              <p class="truncate text-xs text-slate-500">
                {{ o.deviceType }} · {{ o.scheduledDate }} · {{ o.scheduledTime }}
              </p>
              <p class="mt-1 text-[11px] text-slate-400">Tạo: {{ formatOrderCreated(o.createdAt) }}</p>
            </div>
            <i class="pi pi-angle-right shrink-0 text-slate-400" aria-hidden="true" />
          </div>
          <div class="mt-3 flex flex-wrap gap-2">
            <span :class="userOrderStatusClass(o.status, o.returnStatus)">
              {{ userOrderStatusLabel(o.status, o.returnStatus) }}
            </span>
          </div>
        </NuxtLink>
      </div>
    </div>

    <AppBottomNav />
  </div>
</template>
