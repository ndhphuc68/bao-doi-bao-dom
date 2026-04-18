<script setup lang="ts">
import { getApiErrorMessage } from '~/utils/api/errors'

definePageMeta({
  layout: 'admin',
  middleware: ['require-admin']
})

type Row = {
  id: string
  trackingCode: string
  deviceName: string
  deviceType: string
  status: string
  returnStatus?: string
  scheduledDate: string
  scheduledTime: string
  collectionPoint?: { name?: string }
  user?: { email?: string; name?: string }
}

const token = useCookie('admin_auth_token')
const { apiFetch } = useApi()
const q = ref('')
const createdDate = ref('') // YYYY-MM-DD
const recyclingStatus = ref('')
const returnStatus = ref('')

const recyclingStatusOptions = [
  { label: 'Tất cả', value: '' },
  { label: 'Chờ thu gom', value: 'PENDING' },
  { label: 'Đã thu gom', value: 'COMPLETED' },
  { label: 'Kho lưu trữ', value: 'STORED' },
  { label: 'Đã huỷ', value: 'CANCELLED' }
]

const returnStatusOptions = [
  { label: 'Tất cả', value: '' },
  { label: 'Chờ kiểm hàng', value: 'PENDING' },
  { label: 'Đã nhập kho', value: 'APPROVED' },
  { label: 'Từ chối', value: 'REJECTED' },
  { label: 'Đã huỷ', value: 'CANCELLED' }
]

const queryParams = computed(() => {
  const p = new URLSearchParams()
  if (q.value.trim()) p.set('q', q.value.trim())
  if (createdDate.value) p.set('date', createdDate.value)
  if (recyclingStatus.value) p.set('status', recyclingStatus.value)
  if (returnStatus.value) p.set('returnStatus', returnStatus.value)
  const s = p.toString()
  return s ? `?${s}` : ''
})

const {
  data: rows,
  pending,
  error,
  refresh
} = await useAsyncData(
  'admin_recycling',
  async () => {
    return apiFetch<Row[]>(`/admin/recycling-requests${queryParams.value}`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
  },
  { watch: [queryParams] }
)

function recyclingStatusLabel(st: string): string {
  const map: Record<string, string> = {
    PENDING: 'Chờ thu gom',
    COMPLETED: 'Đã thu gom',
    STORED: 'Kho lưu trữ',
    CANCELLED: 'Đã huỷ'
  }
  return map[st] ?? st
}

function recyclingStatusClass(st: string): string {
  const base = 'rounded-full px-2 py-1 text-xs font-semibold'
  switch (st) {
    case 'PENDING':
      return `${base} bg-amber-50 text-amber-800`
    case 'COMPLETED':
      return `${base} bg-sky-50 text-sky-800`
    case 'STORED':
      return `${base} bg-emerald-50 text-emerald-800`
    case 'CANCELLED':
      return `${base} bg-slate-100 text-slate-600`
    default:
      return `${base} bg-slate-100 text-slate-700`
  }
}

function returnStatusLabel(st?: string | null): string {
  const map: Record<string, string> = {
    PENDING: 'Chờ kiểm hàng',
    APPROVED: 'Đã nhập kho',
    REJECTED: 'Từ chối',
    CANCELLED: 'Đã huỷ'
  }
  if (!st || st === 'NONE') return '—'
  return map[st] ?? st
}

function returnStatusClass(st?: string | null): string {
  const base = 'rounded-full px-2 py-1 text-xs font-semibold'
  switch (st) {
    case 'PENDING':
      return `${base} bg-amber-50 text-amber-800`
    case 'APPROVED':
      return `${base} bg-emerald-50 text-emerald-800`
    case 'REJECTED':
      return `${base} bg-rose-50 text-rose-800`
    case 'CANCELLED':
      return `${base} bg-slate-100 text-slate-600`
    default:
      return `${base} bg-slate-50 text-slate-600`
  }
}

function clearDate() {
  createdDate.value = ''
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div>
      <h1 class="text-xl font-bold tracking-tight">Đơn</h1>
      <p class="text-sm text-slate-600">
        Danh sách đơn thu gom. Nếu có yêu cầu hoàn trả thì sẽ hiển thị trạng thái xử lý và cho phép vào chi tiết để xác nhận/từ chối.
      </p>
    </div>

    <div class="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4 shadow-sm">
      <div class="mb-3 text-xs font-semibold uppercase tracking-wide text-emerald-900/70">Bộ lọc</div>
      <div class="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-end">
        <div class="lg:col-span-4">
          <label class="mb-1.5 block text-xs font-medium text-slate-700">Tìm kiếm</label>
          <IconField>
            <InputIcon class="pi pi-search !text-slate-400" />
            <InputText v-model="q" placeholder="Mã, thiết bị, email…" fluid class="!rounded-xl border-slate-200 bg-white" />
          </IconField>
        </div>
        <div class="lg:col-span-3">
          <label class="mb-1.5 block text-xs font-medium text-slate-700">Ngày tạo đơn</label>
          <div class="flex gap-2">
            <input
              v-model="createdDate"
              type="date"
              class="min-h-[42px] w-full flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <Button
              v-if="createdDate"
              type="button"
              icon="pi pi-times"
              severity="secondary"
              outlined
              class="!rounded-xl shrink-0"
              aria-label="Xoá bộ lọc ngày"
              title="Xoá ngày"
              @click="clearDate"
            />
          </div>
        </div>
        <div class="lg:col-span-3">
          <label class="mb-1.5 block text-xs font-medium text-slate-700">Trạng thái thu gom</label>
          <Dropdown
            v-model="recyclingStatus"
            :options="recyclingStatusOptions"
            option-label="label"
            option-value="value"
            fluid
            class="!rounded-xl border-slate-200 bg-white"
          />
        </div>
        <div class="lg:col-span-2">
          <label class="mb-1.5 block text-xs font-medium text-slate-700">Trạng thái hoàn trả</label>
          <Dropdown
            v-model="returnStatus"
            :options="returnStatusOptions"
            option-label="label"
            option-value="value"
            fluid
            class="!rounded-xl border-slate-200 bg-white"
          />
        </div>
      </div>
    </div>

    <div v-if="error" class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
      {{ getApiErrorMessage(error) }}
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200">
      <div v-if="pending" class="p-4 text-sm text-slate-500">Đang tải…</div>
      <div v-else-if="!rows?.length" class="p-4 text-sm text-slate-500">Chưa có đơn.</div>
      <div v-else class="overflow-auto">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50">
            <tr class="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th class="px-4 py-3">Mã</th>
              <th class="px-4 py-3">Thiết bị</th>
              <th class="px-4 py-3">Điểm thu</th>
              <th class="px-4 py-3">User</th>
              <th class="px-4 py-3">Lịch</th>
              <th class="px-4 py-3">Thu gom</th>
              <th class="px-4 py-3">Hoàn trả</th>
              <th class="px-4 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr v-for="r in rows" :key="r.id" class="hover:bg-slate-50">
              <td class="px-4 py-3 font-mono text-xs">{{ r.trackingCode }}</td>
              <td class="px-4 py-3">
                <div class="font-semibold text-slate-900">{{ r.deviceName }}</div>
                <div class="text-xs text-slate-500">{{ r.deviceType }}</div>
              </td>
              <td class="px-4 py-3 text-slate-700">{{ r.collectionPoint?.name || '—' }}</td>
              <td class="px-4 py-3">
                <div class="font-semibold text-slate-900">{{ r.user?.name || '—' }}</div>
                <div class="text-xs text-slate-500">{{ r.user?.email || '—' }}</div>
              </td>
              <td class="px-4 py-3 text-slate-700">{{ r.scheduledDate }} · {{ r.scheduledTime }}</td>
              <td class="px-4 py-3">
                <span :class="recyclingStatusClass(r.status)">{{ recyclingStatusLabel(r.status) }}</span>
              </td>
              <td class="px-4 py-3">
                <span :class="returnStatusClass(r.returnStatus)">{{ returnStatusLabel(r.returnStatus) }}</span>
              </td>
              <td class="px-4 py-3 text-right">
                <NuxtLink :to="`/admin/orders/${r.id}`">
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
