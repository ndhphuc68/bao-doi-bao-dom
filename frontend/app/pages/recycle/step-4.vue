<script setup lang="ts">
import type { CollectionPointDto } from '~/types/api'
import { useRecycleStore } from '~/stores/recycle'

const store = useRecycleStore()
const router = useRouter()
const config = useRuntimeConfig()

const { data: points } = await useFetch<CollectionPointDto[]>('/collection-points', {
  baseURL: config.public.apiBase
})

type LatLng = { latitude: number; longitude: number }

const userLocation = ref<LatLng | null>(null)
const locationError = ref<string | null>(null)
const locating = ref(false)

const selectedPoint = ref(null)
const mapFocus = ref<[number, number] | null>(null)

function selectRow(pt) {
  selectedPoint.value = pt
  if (pt && typeof pt.latitude === 'number' && typeof pt.longitude === 'number') {
    mapFocus.value = [pt.latitude, pt.longitude]
  } else {
    mapFocus.value = null
  }
}

function confirmPoint() {
  if (!selectedPoint.value) return
  store.collectionPointId = selectedPoint.value.id
  store.collectionPoint = selectedPoint.value
  router.push('/recycle/step-5')
}

function haversineKm(a: LatLng, b: LatLng) {
  const R = 6371
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180
  const lat1 = (a.latitude * Math.PI) / 180
  const lat2 = (b.latitude * Math.PI) / 180
  const s =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)))
}

function formatDistance(km: number) {
  if (!Number.isFinite(km)) return null
  if (km < 1) return `${Math.round(km * 1000)} m`
  if (km < 10) return `${km.toFixed(1)} km`
  return `${Math.round(km)} km`
}

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
        userLocation.value = null
        if (err.code === err.PERMISSION_DENIED) {
          locationError.value = 'Bạn đã từ chối quyền vị trí. Hãy bật lại để xem điểm gần nhất.'
        } else {
          locationError.value = 'Không lấy được vị trí hiện tại. Vui lòng thử lại.'
        }
        resolve()
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 }
    )
  })
  locating.value = false
}

onMounted(() => {
  // Tự xin vị trí để sắp xếp điểm gần nhất
  detectMyLocation()
})

const pointsSorted = computed(() => {
  const raw = points.value || []
  const loc = userLocation.value
  if (!loc) {
    return raw
      .map((p) => ({
      ...p,
      _distanceKm: null as number | null,
      distanceText: p.distanceText ?? null
      }))
      .slice(0, 4)
  }

  return raw
    .map((p) => {
      const km = haversineKm(loc, { latitude: p.latitude, longitude: p.longitude })
      return {
        ...p,
        _distanceKm: km,
        distanceText: formatDistance(km)
      }
    })
    .sort((a, b) => {
      if (a._distanceKm == null && b._distanceKm == null) return 0
      if (a._distanceKm == null) return 1
      if (b._distanceKm == null) return -1
      return a._distanceKm - b._distanceKm
    })
    .slice(0, 4)
})

/** Hiển thị tất cả điểm trên bản đồ (popup); danh sách bên dưới vẫn gợi ý tối đa 4 điểm gần nhất. */
const mapPois = computed(() => {
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
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col bg-slate-50">
    <AppPageHeader title="Điểm thu gom" back-to="/recycle/step-3" />

    <div class="flex min-h-0 flex-1 flex-col">
      <!-- Map -->
      <div class="relative h-[42vh] max-h-[360px] min-h-[240px] shrink-0 overflow-hidden bg-slate-200">
        <ClientOnly>
          <LeafletMap
            class="absolute inset-0"
            :pois="mapPois"
            :user-position="userPos"
            :fit-bounds="!selectedPoint"
            :focus="mapFocus"
            :focus-zoom="16"
          />
          <template #fallback>
            <div class="flex h-full items-center justify-center bg-slate-100 text-sm text-slate-500">
              Đang tải bản đồ…
            </div>
          </template>
        </ClientOnly>
      </div>

      <!-- Bottom sheet -->
      <div
        class="-mt-8 flex flex-1 flex-col rounded-t-3xl border-x border-t border-slate-100 bg-white px-5 py-5 shadow-[0_-8px_24px_rgba(15,23,42,0.10)]"
      >
        <div class="mb-3 flex justify-center">
          <div class="h-1.5 w-14 rounded-full bg-slate-200" />
        </div>

        <RecycleProgress :step="4" />

        <div class="mb-4 flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h3 class="text-lg font-bold tracking-tight text-slate-900">Các điểm quanh bạn</h3>
            <p class="mt-1 text-xs text-slate-500">
              Sắp xếp theo vị trí hiện tại (lat/long) để hiện cửa hàng gần nhất.
            </p>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-[0.99]"
            :disabled="locating"
            @click="detectMyLocation"
          >
            {{ locating ? 'Đang định vị...' : 'Lấy vị trí' }}
          </button>
        </div>

        <p
          v-if="locationError"
          class="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs text-amber-800"
        >
          {{ locationError }}
        </p>

        <div class="max-h-[min(38vh,340px)] space-y-2 overflow-y-auto pr-0.5">
          <p
            v-if="!points?.length"
            class="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-500"
          >
            Không tải được danh sách điểm thu. Kiểm tra backend và thử lại.
          </p>
          <button
            v-for="pt in pointsSorted"
            :key="pt.id"
            type="button"
            class="flex w-full cursor-pointer rounded-2xl border p-3.5 text-left transition active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            :class="
              selectedPoint?.id === pt.id
                ? 'border-emerald-500 bg-emerald-50/80 shadow-sm'
                : 'border-slate-100 bg-white hover:border-emerald-200'
            "
            @click="selectRow(pt)"
          >
            <div class="mr-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
              <Icon name="heroicons:building-storefront" class="h-6 w-6 text-emerald-600" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="mb-1 flex items-start justify-between gap-2">
                <h4 class="text-sm font-bold leading-tight text-slate-900">{{ pt.name }}</h4>
                <span
                  v-if="pt.distanceText"
                  class="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800"
                  >{{ pt.distanceText }}</span
                >
              </div>
              <p class="flex text-xs text-slate-500">
                <Icon name="heroicons:map-pin" class="mr-1 mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span class="line-clamp-2 leading-tight">{{ pt.address }}</span>
              </p>
              <p class="mt-1 flex items-center text-xs text-slate-500">
                <Icon name="heroicons:clock" class="mr-1 h-3.5 w-3.5 text-slate-400" />
                {{ pt.openHours }}
              </p>
            </div>
          </button>
        </div>

        <!-- Chi tiết + xác nhận (một cột) -->
        <div v-if="selectedPoint" class="mt-5 border-t border-slate-100 pt-5">
          <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">Chi tiết điểm thu</p>
          <div
            class="mb-3 flex aspect-[16/10] items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200"
          >
            <Icon name="heroicons:building-storefront" class="h-14 w-14 text-slate-400" />
          </div>
          <h4 class="mb-2 text-base font-bold text-slate-900">{{ selectedPoint.name }}</h4>
          <p class="mb-2 flex text-sm text-slate-600">
            <Icon name="heroicons:map-pin" class="mr-2 mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            {{ selectedPoint.address }}
          </p>
          <p class="mb-5 flex items-center text-sm text-slate-600">
            <Icon name="heroicons:clock" class="mr-2 h-4 w-4 text-emerald-600" />
            {{ selectedPoint.openHours }}
          </p>
          <button
            type="button"
            class="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-500/20 active:opacity-95"
            @click="confirmPoint"
          >
            Chọn điểm thu gom này
          </button>
        </div>

        <p v-else class="mt-4 text-center text-sm text-slate-500">Chọn một điểm để xem chi tiết và xác nhận.</p>
      </div>
    </div>
  </div>
</template>
