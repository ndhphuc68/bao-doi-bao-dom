<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
import { getApiErrorMessage } from '~/utils/api/errors'
import { userOrderStatusLabel } from '~/utils/recycling-order-display'

definePageMeta({ middleware: ['require-auth'] })

const route = useRoute()
const router = useRouter()

const returnsListPath = computed(() =>
  String(route.query.from || '') === 'recycle' ? '/recycle' : '/profile/returns'
)
const token = useCookie('auth_token')
const toast = useToast()
const mediaUrl = useMediaUrl()
const { recyclingRequests, returnRequests } = useApi()

const orderKey = computed(() => `user_order_${String(route.params.id || '')}`)

const { data: order, pending, error, refresh } = await useAsyncData(
  orderKey,
  async () => {
    const t = token.value
    const oid = String(route.params.id || '')
    if (!t || !oid) return null
    return recyclingRequests.getMine(t, oid)
  },
  { watch: [orderKey, token] }
)

const orderImages = computed(() => {
  const raw = order.value?.images
  if (!raw?.length) return []
  return raw.map((s) => mediaUrl(s)).filter(Boolean)
})

const userStatusLine = computed(() =>
  order.value ? userOrderStatusLabel(order.value.status, order.value.returnStatus) : ''
)

const canCancelReturn = computed(() => order.value?.returnStatus === 'PENDING')

const cancelling = ref(false)
async function cancelReturn() {
  if (!order.value || !token.value) return
  if (!confirm('Bạn có chắc muốn huỷ yêu cầu đang chờ kiểm hàng?')) return
  cancelling.value = true
  try {
    await returnRequests.cancelMine(token.value, order.value.id)
    toast.add({ severity: 'success', summary: 'Đã huỷ', detail: 'Yêu cầu đã được huỷ.', life: 2500 })
    await refresh()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: getApiErrorMessage(e), life: 4000 })
  } finally {
    cancelling.value = false
  }
}
</script>

<template>
  <div class="min-h-[100dvh] bg-slate-50 pb-28">
    <AppPageHeader title="Chi tiết đơn" :back-to="returnsListPath" />

    <div class="px-5 pt-4">
      <div v-if="pending" class="py-12 text-center text-sm text-slate-500">Đang tải…</div>
      <div v-else-if="error || !order" class="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">
        Không tìm thấy đơn hoặc bạn không có quyền xem.
      </div>

      <div v-else class="space-y-4">
        <div class="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Mã đơn</p>
          <p class="mt-1 font-mono text-xl font-bold text-slate-900">{{ order.trackingCode }}</p>
          <p class="mt-3 text-lg font-bold text-slate-900">{{ order.deviceName }}</p>
          <p class="text-sm text-slate-600">{{ order.deviceType }} · {{ order.manufacturer }}</p>
        </div>

        <div class="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <p class="text-xs font-semibold text-slate-500">Điểm thu gom</p>
          <p class="mt-1 font-semibold text-slate-900">{{ order.collectionPoint?.name || '—' }}</p>
          <p v-if="order.collectionPoint?.address" class="mt-1 text-sm text-slate-600">{{ order.collectionPoint.address }}</p>
          <p class="mt-3 text-xs font-semibold text-slate-500">Lịch hẹn</p>
          <p class="mt-1 font-semibold text-slate-900">{{ order.scheduledDate }} · {{ order.scheduledTime }}</p>
        </div>

        <div class="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <p class="text-xs font-semibold text-slate-500">Trạng thái</p>
          <p class="mt-1 text-base font-semibold text-slate-900">{{ userStatusLine }}</p>
          <p v-if="order.returnReason?.trim()" class="mt-3 text-xs font-semibold text-slate-500">Ghi chú của bạn</p>
          <p v-if="order.returnReason?.trim()" class="mt-1 whitespace-pre-wrap text-sm text-slate-800">{{ order.returnReason }}</p>
          <p v-if="order.returnAdminNote?.trim()" class="mt-3 text-xs font-semibold text-slate-500">Phản hồi từ điểm thu</p>
          <p v-if="order.returnAdminNote?.trim()" class="mt-1 whitespace-pre-wrap text-sm text-slate-700">{{ order.returnAdminNote }}</p>
        </div>

        <div v-if="orderImages.length" class="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <p class="text-xs font-semibold text-slate-500">Ảnh thiết bị</p>
          <div class="mt-3 grid grid-cols-3 gap-2">
            <a
              v-for="(src, idx) in orderImages"
              :key="idx"
              :href="src"
              target="_blank"
              rel="noopener noreferrer"
              class="overflow-hidden rounded-xl border border-slate-100 bg-slate-50"
            >
              <img :src="src" :alt="`Ảnh ${idx + 1}`" class="aspect-square w-full object-cover" loading="lazy" />
            </a>
          </div>
        </div>

        <Button
          v-if="canCancelReturn"
          label="Huỷ yêu cầu chờ kiểm hàng"
          severity="danger"
          outlined
          class="w-full !rounded-2xl"
          :loading="cancelling"
          @click="cancelReturn"
        />

        <Button
          label="Quay lại danh sách"
          severity="secondary"
          outlined
          class="w-full !rounded-2xl"
          @click="router.push(returnsListPath)"
        />
      </div>
    </div>
  </div>
</template>
