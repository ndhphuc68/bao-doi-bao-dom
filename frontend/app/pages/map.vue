<script setup lang="ts">
import type { CollectionPointDto } from '~/types/api'

definePageMeta({ middleware: ['require-auth'] })

const router = useRouter()
const config = useRuntimeConfig()

const { data: points } = await useFetch<CollectionPointDto[]>('/collection-points', {
  baseURL: config.public.apiBase
})

const userLocation = ref<{ latitude: number; longitude: number } | null>(null)
const locating = ref(false)
const locationError = ref<string | null>(null)

const pois = computed(() => {
  const raw = points.value || []
  return raw
    .filter((p) => typeof p.latitude === 'number' && typeof p.longitude === 'number')
    .map((p) => ({
      lat: p.latitude,
      lng: p.longitude,
      title: p.name,
      description: [p.address, p.openHours].filter(Boolean).join(' · ')
    }))
})

const userPos = computed(() =>
  userLocation.value
    ? { lat: userLocation.value.latitude, lng: userLocation.value.longitude }
    : null
)

async function detectMyLocation() {
  locationError.value = null
  if (!('geolocation' in navigator)) {
    locationError.value = 'Thiết bị không hỗ trợ định vị.'
    return
  }
  locating.value = true
  await new Promise<void>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userLocation.value = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }
        resolve()
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          locationError.value = 'Bật quyền vị trí để xem điểm gần bạn trên bản đồ.'
        }
        resolve()
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60_000 }
    )
  })
  locating.value = false
}

onMounted(() => {
  detectMyLocation()
})

function startRecycle() {
  router.push('/recycle')
}
</script>

<template>
  <div class="flex min-h-[100dvh] flex-col bg-slate-50 pb-28">
    <AppPageHeader title="Điểm thu gom" back-to="/home" />

    <div class="flex min-h-0 flex-1 flex-col px-3 pt-2">
      <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p class="text-xs text-slate-600">
          Chấm xanh: điểm thu gom · vòng tròn xanh: bạn (nếu bật định vị)
        </p>
        <Button
          :label="locating ? 'Đang định vị…' : 'Cập nhật vị trí'"
          size="small"
          rounded
          severity="secondary"
          :disabled="locating"
          @click="detectMyLocation"
        />
      </div>

      <p
        v-if="locationError"
        class="mb-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
      >
        {{ locationError }}
      </p>

      <div
        class="relative h-[min(52vh,480px)] min-h-[300px] w-full flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 shadow-inner"
      >
        <ClientOnly>
          <LeafletMap class="absolute inset-0" :pois="pois" :user-position="userPos" :fit-bounds="true" />
          <template #fallback>
            <div class="flex h-full min-h-[280px] items-center justify-center bg-slate-100 text-sm text-slate-500">
              Đang tải bản đồ…
            </div>
          </template>
        </ClientOnly>
      </div>

      <div class="mt-4 space-y-2">
        <Button
          label="Đặt lịch thu gom"
          icon="pi pi-calendar-plus"
          class="w-full !rounded-2xl !py-3.5"
          @click="startRecycle"
        />
        <p class="text-center text-xs text-slate-500">
          Chọn thiết bị và lịch trong các bước tiếp theo — bạn sẽ chọn lại điểm thu gom ở bước gần cuối.
        </p>
      </div>
    </div>

    <AppBottomNav />
  </div>
</template>
