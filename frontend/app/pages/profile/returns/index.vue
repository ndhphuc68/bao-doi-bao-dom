<script setup lang="ts">
import { formatOrderCreated, userOrderStatusClass, userOrderStatusLabel } from '~/utils/recycling-order-display'

definePageMeta({ middleware: ['require-auth'] })

const token = useCookie('auth_token')
const { recyclingRequests } = useApi()

const { data: orders, pending, error, refresh } = await useAsyncData(
  'user_recycling_orders',
  async () => {
    const t = token.value
    if (!t) return []
    return recyclingRequests.listMine(t)
  },
  { watch: [token] }
)
</script>

<template>
  <div class="min-h-[100dvh] bg-slate-50 pb-28">
    <AppPageHeader title="Đơn hoàn trả của tôi" back-to="/profile" />

    <div class="px-5 pt-4">
      <p class="mb-4 text-sm leading-relaxed text-slate-600">
        Các đơn bạn đã đặt lịch hoàn trả. Theo dõi trạng thái thu gom và xử lý tại điểm thu.
      </p>

      <div v-if="pending" class="py-12 text-center text-sm text-slate-500">Đang tải…</div>
      <div v-else-if="error" class="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">
        Không tải được danh sách. Thử lại sau.
      </div>
      <div v-else-if="!orders?.length" class="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
        Bạn chưa có đơn nào. Đặt lịch tại mục Hoàn trả trên trang chủ.
      </div>
      <div v-else class="space-y-3">
        <NuxtLink
          v-for="o in orders"
          :key="o.id"
          :to="`/profile/returns/${o.id}`"
          class="block rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition active:scale-[0.99] hover:border-emerald-200"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
              <p class="font-mono text-sm font-bold text-slate-900">{{ o.trackingCode }}</p>
              <p class="mt-0.5 truncate text-sm font-semibold text-slate-800">{{ o.deviceName }}</p>
              <p class="truncate text-xs text-slate-500">{{ o.deviceType }} · {{ o.scheduledDate }} · {{ o.scheduledTime }}</p>
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

      <Button label="Làm mới" icon="pi pi-refresh" class="mt-6 w-full !rounded-2xl" severity="secondary" outlined @click="refresh" />
    </div>
  </div>
</template>
