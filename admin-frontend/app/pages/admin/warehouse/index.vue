<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { getApiErrorMessage } from '~/utils/api/errors'

definePageMeta({
  layout: 'admin',
  middleware: ['require-admin']
})

type Row = {
  id: string
  recyclingRequestId: string
  trackingCode: string
  deviceName: string
  deviceType: string
  manufacturer?: string
  storedAt: string
  storedByUserId?: string
  shipmentId: string | null
}

const token = useCookie('admin_auth_token')
const toast = useToast()
const { apiFetch } = useApi()
const router = useRouter()

const q = ref('')
const availableOnly = ref(false)
const queryParams = computed(() => {
  const p = new URLSearchParams()
  if (q.value.trim()) p.set('q', q.value.trim())
  if (availableOnly.value) p.set('availableOnly', 'true')
  const s = p.toString()
  return s ? `?${s}` : ''
})

const { data: rows, pending, error, refresh } = await useAsyncData(
  'admin_warehouse',
  () =>
    apiFetch<Row[]>(`/admin/warehouse${queryParams.value}`, {
      headers: { Authorization: `Bearer ${token.value}` }
    }),
  { watch: [queryParams] }
)

/** Chọn trên bảng — xóa khi đổi tìm kiếm/lọc (không xóa khi chỉ refetch cùng bộ lọc). */
const selectedIds = ref<string[]>([])
watch(queryParams, () => {
  selectedIds.value = []
})

function rowSelectable(r: Row) {
  return !r.shipmentId
}

function isSelected(id: string) {
  return selectedIds.value.includes(id)
}

function toggleRow(id: string, checked: boolean) {
  const cur = selectedIds.value
  if (checked) {
    if (!cur.includes(id)) selectedIds.value = [...cur, id]
  } else {
    selectedIds.value = cur.filter((x) => x !== id)
  }
}

function toggleSelectAllAvailable(checked: boolean) {
  const list = rows.value?.filter(rowSelectable) ?? []
  if (!checked) {
    selectedIds.value = []
    return
  }
  selectedIds.value = list.map((r) => r.id)
}

const selectableRows = computed(() => rows.value?.filter(rowSelectable) ?? [])
const allSelectableSelected = computed(() => {
  const s = selectableRows.value
  if (!s.length) return false
  return s.every((r) => selectedIds.value.includes(r.id))
})

const createOpen = ref(false)
const createSaving = ref(false)
/** Bản chụp ID khi mở dialog — tránh mất lựa chọn nếu bảng refetch giữa lúc mở và bấm Tạo. */
const shipmentItemIdsSnapshot = ref<string[]>([])
const formNote = ref('')
const formRecipientName = ref('')
const formRecipientPhone = ref('')
const formRecipientAddress = ref('')

watch(createOpen, (open) => {
  if (!open) {
    formNote.value = ''
    formRecipientName.value = ''
    formRecipientPhone.value = ''
    formRecipientAddress.value = ''
    shipmentItemIdsSnapshot.value = []
  }
})

const selectedCount = computed(() => selectedIds.value.length)
const snapshotCount = computed(() => shipmentItemIdsSnapshot.value.length)

function openCreateShipmentDialog() {
  const ids = [...selectedIds.value]
  if (!ids.length) {
    toast.add({
      severity: 'warn',
      summary: 'Chưa chọn',
      detail: 'Chọn ít nhất một thiết bị còn trong kho.',
      life: 2800
    })
    return
  }
  shipmentItemIdsSnapshot.value = ids
  createOpen.value = true
}

async function submitCreateShipment() {
  const warehouseItemIds = [...shipmentItemIdsSnapshot.value]
  if (!warehouseItemIds.length) {
    toast.add({
      severity: 'warn',
      summary: 'Chưa chọn',
      detail: 'Đóng và chọn lại thiết bị trong kho.',
      life: 2800
    })
    return
  }
  createSaving.value = true
  try {
    const created = await apiFetch<{ id: string }>(`/admin/warehouse/shipments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: {
        warehouseItemIds,
        note: formNote.value.trim() || undefined,
        recipientName: formRecipientName.value.trim() || undefined,
        recipientPhone: formRecipientPhone.value.trim() || undefined,
        recipientAddress: formRecipientAddress.value.trim() || undefined
      }
    })
    toast.add({
      severity: 'success',
      summary: 'Đã tạo đơn gửi hàng',
      detail: 'Phiếu đã được lưu.',
      life: 2500
    })
    createOpen.value = false
    selectedIds.value = []
    await refresh()
    await router.push(`/admin/warehouse/shipments/${created.id}`)
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: getApiErrorMessage(err),
      life: 4000
    })
  } finally {
    createSaving.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex flex-col gap-1 border-b border-slate-200 pb-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">Kho lưu trữ</h1>
          <p class="mt-1 text-sm text-slate-600">
            Danh sách thiết bị đã nhập kho. Chọn thiết bị để lập đơn gửi hàng (xuất kho).
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <NuxtLink to="/admin/warehouse/shipments">
            <Button label="Đơn gửi hàng" icon="pi pi-truck" size="small" outlined class="!rounded-xl" />
          </NuxtLink>
          <Button label="Tải lại" icon="pi pi-refresh" size="small" outlined class="!rounded-xl" :loading="pending" @click="refresh" />
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <IconField class="min-w-[240px] flex-1">
        <InputIcon class="pi pi-search !text-slate-400" />
        <InputText v-model="q" placeholder="Tìm theo mã, tên, loại thiết bị…" fluid class="!rounded-xl" />
      </IconField>
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2 text-sm text-slate-700">
          <input
            id="wh-available"
            v-model="availableOnly"
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <label for="wh-available" class="cursor-pointer select-none">Chỉ còn trong kho (chưa gửi)</label>
        </div>
        <Button
          label="Tạo đơn gửi hàng"
          icon="pi pi-plus"
          size="small"
          class="!rounded-xl"
          :disabled="!selectedCount"
          @click="openCreateShipmentDialog"
        />
      </div>
    </div>

    <div v-if="error" class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
      {{ getApiErrorMessage(error) }}
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <div v-if="pending" class="p-6 text-sm text-slate-500">Đang tải…</div>
      <div v-else-if="!rows?.length" class="p-6 text-sm text-slate-500">Chưa có hàng trong kho.</div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-[980px] w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50">
            <tr class="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th class="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  :checked="allSelectableSelected"
                  :disabled="!selectableRows.length"
                  aria-label="Chọn tất cả còn trong kho"
                  @change="toggleSelectAllAvailable(($event.target as HTMLInputElement).checked)"
                />
              </th>
              <th class="px-4 py-3">Mã</th>
              <th class="px-4 py-3">Thiết bị</th>
              <th class="px-4 py-3">Hãng</th>
              <th class="px-4 py-3">Nhập kho</th>
              <th class="px-4 py-3">Gửi hàng</th>
              <th class="px-4 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr v-for="r in rows" :key="r.id" class="hover:bg-slate-50">
              <td class="px-3 py-3">
                <input
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-40"
                  :checked="isSelected(r.id)"
                  :disabled="!rowSelectable(r)"
                  :aria-label="`Chọn ${r.trackingCode}`"
                  @change="toggleRow(r.id, ($event.target as HTMLInputElement).checked)"
                />
              </td>
              <td class="px-4 py-3 font-mono text-xs">{{ r.trackingCode }}</td>
              <td class="px-4 py-3">
                <div class="font-semibold text-slate-900">{{ r.deviceName }}</div>
                <div class="text-xs text-slate-500">{{ r.deviceType }}</div>
              </td>
              <td class="px-4 py-3 text-slate-700">{{ r.manufacturer || '—' }}</td>
              <td class="px-4 py-3 text-slate-700">{{ new Date(r.storedAt).toLocaleString('vi-VN') }}</td>
              <td class="px-4 py-3">
                <NuxtLink
                  v-if="r.shipmentId"
                  :to="`/admin/warehouse/shipments/${r.shipmentId}`"
                  class="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  Xem phiếu
                </NuxtLink>
                <span v-else class="text-xs text-slate-500">—</span>
              </td>
              <td class="px-4 py-3 text-right">
                <NuxtLink :to="`/admin/orders/${r.recyclingRequestId}`">
                  <Button label="Xem đơn" size="small" class="!rounded-xl" />
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Dialog
      v-model:visible="createOpen"
      modal
      header="Tạo đơn gửi hàng"
      class="w-[min(100%,32rem)]"
      :draggable="false"
      @hide="createOpen = false"
    >
      <div class="flex flex-col gap-4 text-sm">
        <p class="text-slate-600">
          Đang chọn <span class="font-semibold text-slate-900">{{ snapshotCount }}</span> thiết bị để xuất kho.
        </p>
        <div>
          <label class="mb-1 block text-xs font-medium text-slate-700">Người nhận (tuỳ chọn)</label>
          <InputText v-model="formRecipientName" placeholder="Họ tên" fluid class="!rounded-xl" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-slate-700">Số điện thoại</label>
          <InputText v-model="formRecipientPhone" placeholder="Điện thoại" fluid class="!rounded-xl" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-slate-700">Địa chỉ giao</label>
          <Textarea v-model="formRecipientAddress" rows="3" auto-resize class="w-full !rounded-xl" placeholder="Địa chỉ…" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-slate-700">Ghi chú nội bộ</label>
          <Textarea v-model="formNote" rows="3" auto-resize class="w-full !rounded-xl" placeholder="Ghi chú…" />
        </div>
      </div>
      <template #footer>
        <Button label="Huỷ" severity="secondary" outlined class="!rounded-xl" @click="createOpen = false" />
        <Button
          label="Tạo phiếu"
          icon="pi pi-check"
          class="!rounded-xl"
          :loading="createSaving"
          :disabled="!snapshotCount"
          @click="submitCreateShipment"
        />
      </template>
    </Dialog>
  </div>
</template>
