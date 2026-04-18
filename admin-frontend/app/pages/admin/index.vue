<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['require-admin']
})

type RecyclingDashboardStats = {
  totalDevices: number
  totalDevicesTrendPct: number | null
  thisMonthCount: number
  thisMonthTrendPct: number | null
  lastMonthCount: number
  last30Count: number
  trend: { monthIndex: number; label: string; yearMonth: string; count: number }[]
  groups: { key: string; label: string; count: number; percent: number }[]
}

const token = useCookie('admin_auth_token')
const { apiFetch } = useApi()

const { data: stats, pending, error, refresh } = await useAsyncData(
  'admin_recycling_stats',
  () =>
    apiFetch<RecyclingDashboardStats>('/admin/stats/recycling', {
      headers: { Authorization: `Bearer ${token.value}` }
    })
)

const accent = '#2E7D32'
const accentFill = 'rgba(46, 125, 50, 0.14)'

const chartLabels = computed(() =>
  (stats.value?.trend ?? []).map((p) => monthAxisLabel(p.yearMonth))
)
const chartValues = computed(() => (stats.value?.trend ?? []).map((p) => p.count))

function monthAxisLabel(ym: string) {
  if (!ym || !ym.includes('-')) return '—'
  const [y, m] = ym.split('-')
  return `${m}/${y}`
}

function formatTrendPct(n: number | null) {
  if (n === null) return '—'
  const sign = n > 0 ? '+' : ''
  return `${sign}${n}%`
}

function trendArrowClass(n: number | null) {
  if (n === null) return 'text-slate-400'
  return n >= 0 ? 'text-emerald-700' : 'text-rose-600'
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p class="mt-1 text-sm text-slate-600">
          Báo cáo &amp; thống kê đơn thu gom — 6 tháng gần nhất và phân loại theo nhóm thiết bị.
        </p>
      </div>
      <Button
        icon="pi pi-sliders-h"
        label="Bộ lọc"
        severity="secondary"
        outlined
        class="!rounded-2xl shrink-0"
        disabled
        title="Sắp có"
      />
    </div>

    <div v-if="pending" class="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">
      Đang tải số liệu…
    </div>
    <div
      v-else-if="error"
      class="flex flex-col items-center gap-3 rounded-3xl border border-rose-200 bg-rose-50/80 p-8 text-center"
    >
      <p class="text-sm font-medium text-rose-800">Không tải được báo cáo.</p>
      <Button label="Thử lại" class="!rounded-2xl" @click="() => refresh()" />
    </div>

    <template v-else>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div
          class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm ring-1 ring-slate-100/80"
        >
          <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Tổng thiết bị</div>
          <div class="mt-2 flex items-end justify-between gap-2">
            <span class="text-3xl font-bold tabular-nums text-slate-900">{{ stats?.totalDevices ?? 0 }}</span>
            <span
              class="inline-flex items-center gap-0.5 text-sm font-semibold"
              :class="trendArrowClass(stats?.totalDevicesTrendPct ?? null)"
            >
              <i
                v-if="stats?.totalDevicesTrendPct != null"
                class="pi text-xs"
                :class="(stats.totalDevicesTrendPct ?? 0) >= 0 ? 'pi-arrow-up' : 'pi-arrow-down'"
                aria-hidden="true"
              />
              {{ formatTrendPct(stats?.totalDevicesTrendPct ?? null) }}
            </span>
          </div>
          <p class="mt-2 text-xs text-slate-500">So với 30 ngày trước (lượng đơn)</p>
        </div>

        <div
          class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm ring-1 ring-slate-100/80"
        >
          <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Tháng này</div>
          <div class="mt-2 flex items-end justify-between gap-2">
            <span class="text-3xl font-bold tabular-nums text-slate-900">{{ stats?.thisMonthCount ?? 0 }}</span>
            <span
              class="inline-flex items-center gap-0.5 text-sm font-semibold"
              :class="trendArrowClass(stats?.thisMonthTrendPct ?? null)"
            >
              <i
                v-if="stats?.thisMonthTrendPct != null"
                class="pi text-xs"
                :class="(stats.thisMonthTrendPct ?? 0) >= 0 ? 'pi-arrow-up' : 'pi-arrow-down'"
                aria-hidden="true"
              />
              {{ formatTrendPct(stats?.thisMonthTrendPct ?? null) }}
            </span>
          </div>
          <p class="mt-2 text-xs text-slate-500">So với tháng trước</p>
        </div>

        <div
          class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm ring-1 ring-slate-100/80"
        >
          <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Tháng trước</div>
          <div class="mt-2 text-3xl font-bold tabular-nums text-slate-900">{{ stats?.lastMonthCount ?? 0 }}</div>
          <p class="mt-2 text-xs text-slate-500">Đơn trong tháng kỳ trước</p>
        </div>

        <div
          class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm ring-1 ring-slate-100/80"
        >
          <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">30 ngày gần nhất</div>
          <div class="mt-2 text-3xl font-bold tabular-nums text-slate-900">{{ stats?.last30Count ?? 0 }}</div>
          <p class="mt-2 text-xs text-slate-500">Rolling 30 ngày</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:items-start">
        <div
          class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm ring-1 ring-slate-100/80 lg:col-span-3"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-lg font-bold text-slate-900">Xu hướng thu hồi</h2>
              <p class="mt-0.5 text-sm text-slate-500">Dữ liệu 6 tháng gần nhất</p>
            </div>
            <div class="text-right">
              <div class="text-xs font-medium uppercase tracking-wide text-slate-400">Tổng (mọi thời điểm)</div>
              <div class="text-2xl font-bold tabular-nums text-slate-900">{{ stats?.totalDevices ?? 0 }}</div>
            </div>
          </div>
          <div class="mt-6 h-[min(360px,42vw)] min-h-[260px] w-full">
            <RecoveryLineChart
              :labels="chartLabels"
              :values="chartValues"
              :stroke="accent"
              :fill="accentFill"
            />
          </div>
        </div>

        <div
          class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm ring-1 ring-slate-100/80 lg:col-span-2"
        >
          <h2 class="text-lg font-bold text-slate-900">Phân loại theo nhóm</h2>
          <p class="mt-0.5 text-sm text-slate-500">Theo loại thiết bị khai báo</p>
          <ul class="mt-6 space-y-5">
            <li v-for="g in stats?.groups ?? []" :key="g.key">
              <div class="flex items-center justify-between gap-3 text-sm">
                <span class="font-medium text-slate-800">{{ g.label }}</span>
                <span class="tabular-nums font-semibold text-slate-700">{{ g.percent }}%</span>
              </div>
              <div class="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :style="{
                    width: `${Math.min(100, g.percent)}%`,
                    backgroundColor: accent
                  }"
                />
              </div>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </div>
</template>
