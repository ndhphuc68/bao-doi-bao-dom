<script setup lang="ts">
import { computed } from 'vue'

/** Biểu đồ line + vùng tô — SVG thuần, không dùng chart.js (tránh lỗi resolve Vite/Docker). */
const props = withDefaults(
  defineProps<{
    labels: string[]
    values: number[]
    stroke?: string
    fill?: string
  }>(),
  {
    stroke: '#2E7D32',
    fill: 'rgba(46, 125, 50, 0.14)'
  }
)

const W = 640
const H = 260
const pad = { l: 48, r: 16, t: 16, b: 44 }

const chart = computed(() => {
  const n = Math.min(props.labels.length, props.values.length)
  const vals = Array.from({ length: n }, (_, i) => Number(props.values[i]) || 0)
  const labs = Array.from({ length: n }, (_, i) => props.labels[i] ?? '')

  const maxVal = Math.max(1, ...vals)
  const plotW = W - pad.l - pad.r
  const plotH = H - pad.t - pad.b
  const bottom = pad.t + plotH

  const pts = vals.map((v, i) => {
    const x =
      n <= 1 ? pad.l + plotW / 2 : pad.l + (i / Math.max(1, n - 1)) * plotW
    const y = pad.t + plotH - (v / maxVal) * plotH
    return { x, y, v, label: labs[i] }
  })

  let areaD = ''
  let lineD = ''
  if (pts.length === 0) {
    return { pts: [], areaD, lineD, maxVal, gridLines: [] as { y: number; t: string }[], empty: true }
  }
  if (pts.length === 1) {
    const p = pts[0]
    const half = 6
    areaD = `M ${p.x - half} ${bottom} L ${p.x - half} ${p.y} L ${p.x + half} ${p.y} L ${p.x + half} ${bottom} Z`
    lineD = `M ${p.x} ${bottom} L ${p.x} ${p.y}`
  } else {
    areaD =
      `M ${pts[0].x} ${bottom} L ${pts[0].x} ${pts[0].y}` +
      pts.slice(1).map((p) => ` L ${p.x} ${p.y}`).join('') +
      ` L ${pts[pts.length - 1].x} ${bottom} Z`
    lineD =
      `M ${pts[0].x} ${pts[0].y}` +
      pts.slice(1).map((p) => ` L ${p.x} ${p.y}`).join('')
  }

  const yTickVals = [maxVal, Math.round(maxVal / 2), 0]
  const gridLines = yTickVals.map((tv) => {
    const y = pad.t + plotH - (tv / maxVal) * plotH
    return { y, t: String(Math.round(tv)) }
  })

  return { pts, areaD, lineD, maxVal, gridLines, empty: false }
})
</script>

<template>
  <div class="flex h-full min-h-[200px] w-full items-stretch">
    <svg
      class="h-full w-full max-h-[320px] min-h-[200px]"
      :viewBox="`0 0 ${W} ${H}`"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      :aria-label="'Biểu đồ xu hướng theo tháng'"
    >
      <template v-if="chart.empty">
        <text :x="W / 2" :y="H / 2" text-anchor="middle" class="fill-slate-400 text-sm">Chưa có dữ liệu</text>
      </template>
      <template v-else>
        <g v-for="(g, i) in chart.gridLines" :key="i">
          <line
            :x1="pad.l"
            :y1="g.y"
            :x2="W - pad.r"
            :y2="g.y"
            stroke="rgba(148, 163, 184, 0.35)"
            stroke-width="1"
          />
          <text :x="pad.l - 8" :y="g.y + 4" text-anchor="end" class="fill-slate-500" style="font-size: 11px">
            {{ g.t }}
          </text>
        </g>

        <path :d="chart.areaD" :fill="fill" />
        <path
          :d="chart.lineD"
          fill="none"
          :stroke="stroke"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <g v-for="(p, i) in chart.pts" :key="i">
          <circle :cx="p.x" :cy="p.y" r="5" :fill="stroke" stroke="#fff" stroke-width="2">
            <title>{{ p.label }}: {{ p.v }}</title>
          </circle>
        </g>

        <g v-for="(p, i) in chart.pts" :key="'l-' + i">
          <text
            :x="p.x"
            :y="H - 12"
            text-anchor="middle"
            class="fill-slate-500"
            style="font-size: 11px; font-weight: 500"
          >
            {{ p.label }}
          </text>
        </g>
      </template>
    </svg>
  </div>
</template>
