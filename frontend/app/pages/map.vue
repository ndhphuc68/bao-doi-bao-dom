<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
import type { CollectionPointDto } from '~/types/api'

definePageMeta({ middleware: ['require-auth'] })

const router = useRouter()
const config = useRuntimeConfig()
const mediaUrl = useMediaUrl()

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
      description: [p.address, p.openHours].filter(Boolean).join(' · '),
      imageUrl: p.imageUrl
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
    locationError.value = t('map.not_supported')
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
          locationError.value = t('map.permission_denied')
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
  router.push(localePath('/recycle'))
}
</script>

<template>
  <div class="flex min-h-[100dvh] flex-col bg-slate-50 pb-28">
    <AppPageHeader :title="t('map.title')" :back-to="localePath('/home')" />

    <div class="flex min-h-0 flex-1 flex-col px-3 pt-2">
      <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p class="text-xs text-slate-600">
          {{ t('map.legend') }}
        </p>
        <Button
          :label="locating ? t('map.locating') : t('map.update_location')"
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
              {{ t('map.loading_map') }}
            </div>
          </template>
        </ClientOnly>
      </div>

      <!-- Nearby Points List -->
      <div v-if="points?.length" class="mt-6 flex-1 space-y-4">
        <h3 class="px-1 text-sm font-bold text-slate-800 uppercase tracking-wider">{{ t('map.nearby_points') }}</h3>
        <div class="space-y-3">
          <div 
            v-for="p in points" 
            :key="p.id"
            class="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition active:scale-[0.98]"
          >
            <div class="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 shadow-inner">
              <img v-if="p.imageUrl" :src="mediaUrl(p.imageUrl)" class="h-full w-full object-cover" />
              <div v-else class="h-full w-full flex items-center justify-center bg-emerald-50 text-emerald-200">
                <i class="pi pi-map-marker text-2xl" />
              </div>
            </div>
            <div class="flex-1 py-1">
              <h4 class="text-sm font-bold text-slate-900 line-clamp-1">{{ p.name }}</h4>
              <p class="mt-0.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">{{ p.address }}</p>
              <div class="mt-2 flex items-center gap-3">
                <span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {{ p.openHours || '08:00 - 20:00' }}
                </span>
                <span v-if="p.distanceText" class="text-[10px] font-medium text-slate-400">
                  <i class="pi pi-directions text-[9px] mr-0.5" /> {{ p.distanceText }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 space-y-2">
        <Button
          :label="t('map.start_recycle')"
          icon="pi pi-calendar-plus"
          class="w-full !rounded-2xl !py-3.5"
          @click="startRecycle"
        />
        <p class="text-center text-xs text-slate-500">
          {{ t('map.guide') }}
        </p>
      </div>
    </div>

    <AppBottomNav />
  </div>
</template>
