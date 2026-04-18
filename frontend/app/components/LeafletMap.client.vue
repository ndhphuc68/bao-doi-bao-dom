<script setup lang="ts">
import L from 'leaflet'

type LatLngTuple = [number, number]

type MapPoi = {
  lat: number
  lng: number
  title: string
  description?: string
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const props = withDefaults(
  defineProps<{
    center?: LatLngTuple
    zoom?: number
    /** Single marker (back-compat) */
    marker?: LatLngTuple | null
    /** Multiple markers (legacy: chỉ tọa độ) */
    markers?: LatLngTuple[]
    /** Điểm thu gom / POI có popup (ưu tiên hơn markers khi có phần tử) */
    pois?: MapPoi[]
    /** Vị trí người dùng (vòng tròn xanh) */
    userPosition?: { lat: number; lng: number } | null
    /** Auto fit bounds to markers */
    fitBounds?: boolean
    /** Pan/zoom to this location (e.g. selected point) */
    focus?: LatLngTuple | null
    /** Zoom level when focusing */
    focusZoom?: number
  }>(),
  {
    center: () => [10.7769, 106.7009], // HCMC default
    zoom: 13,
    marker: () => [10.7769, 106.7009],
    markers: () => [],
    pois: () => [],
    userPosition: null,
    fitBounds: true,
    focus: null,
    focusZoom: 16
  }
)

const containerEl = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let markerLayer: L.Marker | null = null
let markersLayer: L.LayerGroup | null = null
let invalidateTimeouts: ReturnType<typeof setTimeout>[] = []

function invalidateMapSize() {
  if (!map) return
  map.invalidateSize({ animate: false })
}

function scheduleInvalidateSize() {
  nextTick(() => {
    invalidateMapSize()
    requestAnimationFrame(invalidateMapSize)
  })
}

onMounted(() => {
  if (!containerEl.value) return

  map = L.map(containerEl.value, {
    zoomControl: true,
    attributionControl: true
  }).setView(props.center, props.zoom)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  markersLayer = L.layerGroup().addTo(map)

  renderMarkers()

  scheduleInvalidateSize()
  invalidateTimeouts = [200, 600].map((ms) => window.setTimeout(invalidateMapSize, ms))
  window.addEventListener('resize', invalidateMapSize)
})

function renderMarkers() {
  if (!map) return

  markersLayer?.clearLayers()

  const poiList = (props.pois || []).filter(
    (p) => Number.isFinite(p.lat) && Number.isFinite(p.lng)
  )
  if (poiList.length > 0) {
    const boundsPts: L.LatLng[] = []
    for (const p of poiList) {
      const html = `<div class="leaflet-poi-popup text-sm"><strong>${escapeHtml(p.title)}</strong>${p.description ? `<br/><span class="text-slate-600">${escapeHtml(p.description)}</span>` : ''}</div>`
      L.marker([p.lat, p.lng]).bindPopup(html).addTo(markersLayer!)
      boundsPts.push(L.latLng(p.lat, p.lng))
    }
    const u = props.userPosition
    if (u && Number.isFinite(u.lat) && Number.isFinite(u.lng)) {
      L.circleMarker([u.lat, u.lng], {
        radius: 9,
        color: '#2563eb',
        fillColor: '#93c5fd',
        fillOpacity: 0.9,
        weight: 2
      })
        .bindPopup('Vị trí của bạn')
        .addTo(markersLayer!)
      boundsPts.push(L.latLng(u.lat, u.lng))
    }
    if (props.fitBounds && boundsPts.length) {
      map.fitBounds(L.latLngBounds(boundsPts), { padding: [36, 36] })
    }
    scheduleInvalidateSize()
    markerLayer?.remove()
    markerLayer = null
    return
  }

  // Multi-markers (tọa độ thuần)
  const ms = (props.markers || []).filter(Boolean)
  if (ms.length) {
    for (const m of ms) {
      L.marker(m).addTo(markersLayer!)
    }
    if (props.fitBounds) {
      const bounds = L.latLngBounds(ms.map((t) => L.latLng(t[0], t[1])))
      map.fitBounds(bounds, { padding: [28, 28] })
    }
    scheduleInvalidateSize()
    markerLayer?.remove()
    markerLayer = null
    return
  }

  // Fallback to single marker behavior
  if (!props.marker) {
    markerLayer?.remove()
    markerLayer = null
    return
  }
  if (!markerLayer) {
    markerLayer = L.marker(props.marker).addTo(map)
    return
  }
  markerLayer.setLatLng(props.marker)
}

watch(
  () => props.center,
  (center) => {
    if (!map) return
    map.setView(center, map.getZoom())
  }
)

watch(
  () => props.zoom,
  (zoom) => {
    if (!map) return
    map.setZoom(zoom)
  }
)

watch(
  () => props.marker,
  () => renderMarkers()
)

watch(
  () => props.markers,
  () => renderMarkers(),
  { deep: true }
)

watch(
  () => props.pois,
  () => renderMarkers(),
  { deep: true }
)

watch(
  () => props.userPosition,
  () => renderMarkers(),
  { deep: true }
)

watch(
  () => props.fitBounds,
  () => renderMarkers()
)

watch(
  () => props.focus,
  (pos) => {
    if (!map || !pos) return
    map.setView(pos, props.focusZoom ?? map.getZoom(), { animate: true })
  }
)

onBeforeUnmount(() => {
  for (const t of invalidateTimeouts) window.clearTimeout(t)
  invalidateTimeouts = []
  window.removeEventListener('resize', invalidateMapSize)
  markerLayer?.remove()
  markerLayer = null
  markersLayer?.remove()
  markersLayer = null
  map?.remove()
  map = null
})
</script>

<template>
  <div
    ref="containerEl"
    class="h-full min-h-[240px] w-full rounded-2xl border border-slate-200 bg-slate-100 shadow-sm"
  />
</template>

