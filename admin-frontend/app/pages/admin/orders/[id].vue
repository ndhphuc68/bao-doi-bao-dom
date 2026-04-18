<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { getApiErrorMessage } from '~/utils/api/errors'

definePageMeta({
  layout: 'admin',
  middleware: ['require-admin']
})

type AdminOrder = {
  id: string
  trackingCode?: string
  deviceName?: string
  deviceType?: string
  manufacturer?: string
  images?: string[]
  scheduledDate?: string
  scheduledTime?: string
  status?: string
  returnStatus?: string
  returnReason?: string | null
  returnAdminNote?: string | null
  returnDecidedAt?: string | null
  createdAt: string
  user?: { id: string; email?: string; name?: string }
}

const route = useRoute()
const router = useRouter()
const token = useCookie('admin_auth_token')
const toast = useToast()
const { apiFetch } = useApi()

const id = computed(() => String(route.params.id || ''))
const saving = ref(false)

async function fetchOrder(): Promise<AdminOrder> {
  try {
    return await apiFetch<AdminOrder>(`/admin/recycling-requests/${id.value}`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
  } catch {
    const rr = await apiFetch<any>(`/admin/return-requests/${id.value}`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    return rr?.recyclingRequest
      ? {
          ...rr.recyclingRequest,
          id: rr.recyclingRequest.id,
          returnReason: rr.reason,
          returnAdminNote: rr.adminNote,
          returnDecidedAt: rr.decidedAt,
          returnStatus: rr.status,
          createdAt: rr.recyclingRequest.createdAt || rr.createdAt,
          user: rr.user
        }
      : rr
  }
}

const { data: order, pending, error, refresh } = await useAsyncData(`admin_order_${id.value}`, fetchOrder)

const mediaUrl = useMediaUrl()

const orderImages = computed(() => {
  const raw = order.value?.images
  if (!raw?.length) return []
  return raw.map((s) => mediaUrl(s)).filter(Boolean)
})

function recyclingStatusLabel(st?: string | null): string {
  const map: Record<string, string> = {
    PENDING: 'Chờ thu gom',
    COMPLETED: 'Đã thu gom',
    STORED: 'Kho lưu trữ',
    CANCELLED: 'Đã huỷ'
  }
  if (!st) return '—'
  return map[st] ?? st
}

function returnStatusLabel(st?: string | null): string {
  const map: Record<string, string> = {
    PENDING: 'Chờ kiểm hàng',
    APPROVED: 'Đã nhập kho',
    REJECTED: 'Từ chối',
    CANCELLED: 'Đã huỷ',
    RECEIVED: 'Đã nhận (cũ)',
    COMPLETED: 'Hoàn tất (cũ)'
  }
  if (!st || st === 'NONE') return '—'
  return map[st] ?? st
}

const canDecide = computed(() => {
  const st = order.value?.status
  const rs = order.value?.returnStatus
  if (st === 'CANCELLED' || st === 'STORED') return false
  if (rs === 'APPROVED' || rs === 'REJECTED' || rs === 'CANCELLED') return false
  return true
})

const adminNoteDraft = ref('')
watch(
  () => order.value?.returnAdminNote,
  (v) => {
    adminNoteDraft.value = String(v || '')
  },
  { immediate: true }
)

const doDecision = async (decision: 'APPROVE' | 'REJECT') => {
  if (!order.value) return
  saving.value = true
  try {
    await apiFetch(`/admin/recycling-requests/${order.value.id}/decision`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { decision, adminNote: adminNoteDraft.value || undefined }
    })
    const detail =
      decision === 'APPROVE' ? 'Đã xác nhận và nhập kho' : 'Đã từ chối đơn hàng'
    toast.add({ severity: 'success', summary: 'Thành công', detail, life: 2500 })
    await refresh()
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: getApiErrorMessage(err), life: 3500 })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-2 border-b border-slate-200 pb-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <Button icon="pi pi-arrow-left" severity="secondary" outlined class="!rounded-xl" @click="router.push('/admin/orders')" />
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-slate-900">Chi tiết đơn</h1>
            <p class="mt-1 text-sm text-slate-600">Thu gom và hoàn trả là một đơn. Nếu có yêu cầu hoàn trả, admin xử lý tại đây.</p>
          </div>
        </div>
        <Button label="Tải lại" icon="pi pi-refresh" size="small" outlined class="!rounded-xl" :loading="pending" @click="refresh" />
      </div>
    </div>

    <div v-if="error" class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
      {{ getApiErrorMessage(error) }}
    </div>
    <div v-else-if="pending || !order" class="rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">Đang tải…</div>

    <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
      <div class="rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div class="text-xs font-semibold uppercase tracking-wider text-slate-500">Mã đơn</div>
              <div class="mt-1 font-mono text-lg font-semibold text-slate-900">{{ order.trackingCode || order.id }}</div>
              <div class="mt-1 text-base font-semibold text-slate-900">{{ order.deviceName || '—' }}</div>
              <div class="text-sm text-slate-600">{{ order.deviceType || '—' }} · {{ order.manufacturer || '—' }}</div>
            </div>
            <div class="text-right">
              <div class="text-xs font-semibold uppercase tracking-wider text-slate-500">Trạng thái thu gom</div>
              <div class="mt-1 text-sm font-semibold text-slate-900">{{ recyclingStatusLabel(order.status) }}</div>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div class="rounded-xl bg-slate-50 p-3">
              <div class="text-xs font-semibold uppercase tracking-wider text-slate-500">Khách hàng</div>
              <div class="mt-1 text-sm font-semibold text-slate-900">{{ order.user?.name || '—' }}</div>
              <div class="text-sm text-slate-600">{{ order.user?.email || '—' }}</div>
            </div>
            <div class="rounded-xl bg-slate-50 p-3">
              <div class="text-xs font-semibold uppercase tracking-wider text-slate-500">Lịch hẹn</div>
              <div class="mt-1 text-sm font-semibold text-slate-900">{{ order.scheduledDate || '—' }}</div>
              <div class="text-sm text-slate-600">{{ order.scheduledTime || '—' }}</div>
            </div>
          </div>

          <div class="rounded-xl border border-slate-200 p-3">
            <div class="text-xs font-semibold uppercase tracking-wider text-slate-500">Lý do hoàn trả (nếu có)</div>
            <div class="mt-1 whitespace-pre-wrap text-sm text-slate-800">{{ order.returnReason || '—' }}</div>
          </div>

          <div class="rounded-xl border border-slate-200 p-3">
            <div class="text-xs font-semibold uppercase tracking-wider text-slate-500">Ảnh thiết bị</div>
            <div v-if="!orderImages.length" class="mt-2 text-sm text-slate-500">Chưa có ảnh.</div>
            <div v-else class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <a
                v-for="(src, idx) in orderImages"
                :key="idx"
                :href="src"
                target="_blank"
                rel="noopener noreferrer"
                class="group block overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
              >
                <img :src="src" :alt="`Ảnh ${idx + 1}`" class="h-28 w-full object-cover transition group-hover:opacity-95 sm:h-32" loading="lazy" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div class="flex flex-col gap-4">
          <div>
            <div class="text-xs font-semibold uppercase tracking-wider text-slate-500">Trạng thái hoàn trả</div>
            <div class="mt-2 text-sm font-semibold text-slate-900">{{ returnStatusLabel(order.returnStatus) }}</div>
          </div>

          <div>
            <div class="text-xs font-semibold uppercase tracking-wider text-slate-500">Ghi chú admin</div>
            <Textarea v-model="adminNoteDraft" rows="5" auto-resize class="mt-2 w-full !rounded-2xl" placeholder="Ghi chú nội bộ…" />
          </div>

          <div>
            <div class="text-xs font-semibold uppercase tracking-wider text-slate-500">Hành động</div>
            <div class="mt-2 flex flex-col gap-2">
              <Button
                label="Xác nhận đơn hàng"
                severity="success"
                class="!rounded-2xl"
                :loading="saving"
                :disabled="!canDecide"
                @click="doDecision('APPROVE')"
              />
              <Button
                label="Từ chối đơn hàng"
                severity="danger"
                outlined
                class="!rounded-2xl"
                :loading="saving"
                :disabled="!canDecide"
                @click="doDecision('REJECT')"
              />
              <div v-if="!canDecide" class="text-sm text-slate-500">Đơn đã được xử lý (nhập kho / từ chối / huỷ) hoặc đã ở trạng thái kết thúc.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

