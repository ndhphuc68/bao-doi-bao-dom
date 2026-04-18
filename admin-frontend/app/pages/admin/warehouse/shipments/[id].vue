<script setup lang="ts">
import { computed } from 'vue'
import { getApiErrorMessage } from '~/utils/api/errors'

definePageMeta({
  layout: 'admin',
  middleware: ['require-admin']
})

type Line = {
  lineId: string
  warehouseItemId?: string
  trackingCode?: string
  deviceName?: string
  deviceType?: string
  manufacturer?: string
  recyclingRequestId?: string
}

type ShipmentDetail = {
  id: string
  createdAt: string
  status: string
  note: string | null
  recipientName: string | null
  recipientPhone: string | null
  recipientAddress: string | null
  createdByUserId: string | null
  items: Line[]
}

const route = useRoute()
const token = useCookie('admin_auth_token')
const { apiFetch } = useApi()

const id = computed(() => String(route.params.id || ''))

const { data: shipment, pending, error, refresh } = await useAsyncData(
  `admin_warehouse_shipment_${id.value}`,
  () =>
    apiFetch<ShipmentDetail>(`/admin/warehouse/shipments/${id.value}`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
)

function statusLabel(st: string): string {
  const map: Record<string, string> = {
    CREATED: 'Đã lập phiếu',
    DISPATCHED: 'Đã gửi',
    CANCELLED: 'Đã huỷ'
  }
  return map[st] ?? st
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
      <div class="flex items-center gap-2">
        <NuxtLink to="/admin/warehouse/shipments">
          <Button icon="pi pi-arrow-left" severity="secondary" outlined class="!rounded-xl" aria-label="Danh sách" />
        </NuxtLink>
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">Chi tiết đơn gửi hàng</h1>
          <p class="mt-1 font-mono text-sm text-slate-600">{{ id }}</p>
        </div>
      </div>
      <div class="flex gap-2">
        <NuxtLink to="/admin/warehouse">
          <Button label="Kho" icon="pi pi-box" size="small" outlined class="!rounded-xl" />
        </NuxtLink>
        <Button label="Tải lại" icon="pi pi-refresh" size="small" outlined class="!rounded-xl" :loading="pending" @click="refresh" />
      </div>
    </div>

    <div v-if="error" class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
      {{ getApiErrorMessage(error) }}
    </div>
    <div v-else-if="pending || !shipment" class="rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">Đang tải…</div>

    <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
      <div class="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
        <div class="border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Thiết bị trong phiếu ({{ shipment.items.length }})
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-white">
              <tr class="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th class="px-4 py-3">Mã</th>
                <th class="px-4 py-3">Thiết bị</th>
                <th class="px-4 py-3">Hãng</th>
                <th class="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              <tr v-for="line in shipment.items" :key="line.lineId" class="hover:bg-slate-50">
                <td class="px-4 py-3 font-mono text-xs">{{ line.trackingCode || '—' }}</td>
                <td class="px-4 py-3">
                  <div class="font-semibold text-slate-900">{{ line.deviceName || '—' }}</div>
                  <div class="text-xs text-slate-500">{{ line.deviceType || '' }}</div>
                </td>
                <td class="px-4 py-3 text-slate-700">{{ line.manufacturer || '—' }}</td>
                <td class="px-4 py-3 text-right">
                  <NuxtLink v-if="line.recyclingRequestId" :to="`/admin/orders/${line.recyclingRequestId}`">
                    <Button label="Đơn thu gom" size="small" outlined class="!rounded-xl" />
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="flex flex-col gap-4 rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div>
          <div class="text-xs font-semibold uppercase tracking-wider text-slate-500">Trạng thái</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">{{ statusLabel(shipment.status) }}</div>
        </div>
        <div>
          <div class="text-xs font-semibold uppercase tracking-wider text-slate-500">Thời gian lập</div>
          <div class="mt-1 text-sm text-slate-800">{{ new Date(shipment.createdAt).toLocaleString('vi-VN') }}</div>
        </div>
        <div class="rounded-xl bg-slate-50 p-3">
          <div class="text-xs font-semibold uppercase tracking-wider text-slate-500">Người nhận</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">{{ shipment.recipientName || '—' }}</div>
          <div class="text-sm text-slate-600">{{ shipment.recipientPhone || '—' }}</div>
          <div class="mt-2 whitespace-pre-wrap text-sm text-slate-700">{{ shipment.recipientAddress || '—' }}</div>
        </div>
        <div>
          <div class="text-xs font-semibold uppercase tracking-wider text-slate-500">Ghi chú</div>
          <div class="mt-1 whitespace-pre-wrap text-sm text-slate-800">{{ shipment.note || '—' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
