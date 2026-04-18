<script setup lang="ts">
import { getApiErrorMessage } from '~/utils/api/errors'

definePageMeta({
  layout: 'admin',
  middleware: ['require-admin']
})

type Row = {
  id: string
  createdAt: string
  status: string
  note: string | null
  recipientName: string | null
  recipientPhone: string | null
  recipientAddress: string | null
  itemCount: number
}

const token = useCookie('admin_auth_token')
const { apiFetch } = useApi()

const { data: rows, pending, error, refresh } = await useAsyncData('admin_warehouse_shipments', () =>
  apiFetch<Row[]>(`/admin/warehouse/shipments`, {
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

function statusClass(st: string): string {
  const base = 'rounded-full px-2 py-1 text-xs font-semibold'
  switch (st) {
    case 'CREATED':
      return `${base} bg-sky-50 text-sky-800`
    case 'DISPATCHED':
      return `${base} bg-emerald-50 text-emerald-800`
    case 'CANCELLED':
      return `${base} bg-slate-100 text-slate-600`
    default:
      return `${base} bg-slate-100 text-slate-700`
  }
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
      <div class="flex items-center gap-2">
        <NuxtLink to="/admin/warehouse">
          <Button icon="pi pi-arrow-left" severity="secondary" outlined class="!rounded-xl" aria-label="Về kho" />
        </NuxtLink>
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">Đơn gửi hàng</h1>
          <p class="mt-1 text-sm text-slate-600">Các phiếu xuất kho đã lập từ danh sách thiết bị trong kho.</p>
        </div>
      </div>
      <Button label="Tải lại" icon="pi pi-refresh" size="small" outlined class="!rounded-xl" :loading="pending" @click="refresh" />
    </div>

    <div v-if="error" class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
      {{ getApiErrorMessage(error) }}
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <div v-if="pending" class="p-6 text-sm text-slate-500">Đang tải…</div>
      <div v-else-if="!rows?.length" class="p-6 text-sm text-slate-500">Chưa có đơn gửi hàng.</div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-[860px] w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50">
            <tr class="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th class="px-4 py-3">Thời gian</th>
              <th class="px-4 py-3">Người nhận</th>
              <th class="px-4 py-3">Số lượng</th>
              <th class="px-4 py-3">Trạng thái</th>
              <th class="px-4 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr v-for="r in rows" :key="r.id" class="hover:bg-slate-50">
              <td class="px-4 py-3 text-slate-700">{{ new Date(r.createdAt).toLocaleString('vi-VN') }}</td>
              <td class="px-4 py-3">
                <div class="font-semibold text-slate-900">{{ r.recipientName || '—' }}</div>
                <div class="text-xs text-slate-500">{{ r.recipientPhone || '' }}</div>
              </td>
              <td class="px-4 py-3 text-slate-700">{{ r.itemCount }}</td>
              <td class="px-4 py-3">
                <span :class="statusClass(r.status)">{{ statusLabel(r.status) }}</span>
              </td>
              <td class="px-4 py-3 text-right">
                <NuxtLink :to="`/admin/warehouse/shipments/${r.id}`">
                  <Button label="Chi tiết" size="small" class="!rounded-xl" />
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
