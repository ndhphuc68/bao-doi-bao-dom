<script setup lang="ts">
import L from 'leaflet'

type LatLngTuple = [number, number]

const props = withDefaults(
  defineProps<{
    center?: LatLngTuple
    zoom?: number
    marker?: LatLngTuple | null
  }>(),
  {
    center: () => [10.7769, 106.7009], // HCMC default
    zoom: 13,
    marker: () => [10.7769, 106.7009]
  }
)

const containerEl = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let markerLayer: L.Marker | null = null

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

  if (props.marker) {
    markerLayer = L.marker(props.marker).addTo(map)
  }
})

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
  (pos) => {
    if (!map) return
    if (!pos) {
      markerLayer?.remove()
      markerLayer = null
      return
    }
    if (!markerLayer) {
      markerLayer = L.marker(pos).addTo(map)
      return
    }
    markerLayer.setLatLng(pos)
  }
)

onBeforeUnmount(() => {
  markerLayer?.remove()
  markerLayer = null
  map?.remove()
  map = null
})
</script>

<template>
  <div ref="containerEl" class="h-full w-full rounded-2xl border border-slate-200 bg-slate-100 shadow-sm" />
</template>

