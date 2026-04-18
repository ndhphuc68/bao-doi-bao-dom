<script setup>
import { computed } from 'vue'
import { useRecycleStore } from '~/stores/recycle'

const store = useRecycleStore()
const router = useRouter()

const pointName = computed(() => store.collectionPoint?.name || 'Điểm thu gom')

const scheduledLabel = computed(() => {
  const d = store.scheduledDate
  const t = store.scheduledTime?.trim() || '—'
  if (!d) return t
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(String(d)) ? `${d}T12:00:00` : d
  const parsed = new Date(iso)
  const dateStr = Number.isNaN(parsed.getTime())
    ? d
    : parsed.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  return `${dateStr} · ${t}`
})

const deviceLine = computed(() => {
  const n = store.deviceName?.trim()
  const t = store.deviceType?.trim()
  if (n && t) return `${n} · ${t}`
  return n || t || ''
})
</script>

<template>
  <div class="flex min-h-dvh min-h-0 flex-1 flex-col bg-slate-50">
    <AppPageHeader title="Hoàn thành" />

    <div class="flex flex-1 flex-col overflow-y-auto">
      <div class="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-4 pt-6 sm:px-6">
        <!-- Icon -->
        <div class="mb-8 flex justify-center">
          <div class="relative">
            <div
              class="absolute -inset-3 rounded-full bg-gradient-to-br from-emerald-100/90 to-teal-100/60 blur-md"
              aria-hidden="true"
            />
            <div
              class="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md shadow-emerald-900/10 ring-1 ring-emerald-100"
            >
              <div
                class="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-inner"
              >
                <i class="pi pi-check text-2xl" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>

        <h1 class="mb-2 text-center text-2xl font-bold leading-snug tracking-tight text-slate-900 sm:text-[1.65rem]">
          Đặt lịch hoàn trả thành công
        </h1>
        <p class="mx-auto mb-8 max-w-sm text-center text-sm leading-relaxed text-slate-600">
          Bạn đã đăng ký hoàn trả một thiết bị điện tử tới
          <span class="font-semibold text-slate-800">{{ pointName }}</span
          >. Vui lòng mang thiết bị đến đúng thời gian đã hẹn.
        </p>

        <div
          v-if="deviceLine"
          class="mb-6 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-center text-sm text-slate-700 shadow-sm"
        >
          <span class="text-slate-500">Thiết bị: </span>
          <span class="font-semibold text-slate-900">{{ deviceLine }}</span>
        </div>

        <!-- Thẻ thông tin -->
        <div
          class="rounded-2xl border border-slate-200/90 bg-white px-5 py-5 shadow-sm shadow-slate-900/5"
        >
          <p class="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
            Mã xác nhận
          </p>
          <p class="mb-5 font-mono text-2xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-[1.75rem]">
            {{ store.trackingCode || '—' }}
          </p>
          <div class="mb-1 h-px w-full bg-slate-100" />
          <p class="mb-1.5 mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Thời gian
          </p>
          <p class="flex items-center justify-start gap-2 text-base font-semibold text-slate-900">
            <i class="pi pi-calendar text-emerald-600/90" aria-hidden="true" />
            {{ scheduledLabel }}
          </p>
        </div>

        <div class="min-h-6 flex-1" />
      </div>
    </div>

    <!-- CTA -->
    <div
      class="border-t border-slate-200/90 bg-white/95 px-5 py-5 backdrop-blur-md supports-[padding:max(0px)]:pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6"
    >
      <div class="mx-auto w-full max-w-md">
        <Button
          label="Về trang chủ"
          fluid
          icon="pi pi-home"
          class="!rounded-2xl !py-3 font-semibold"
          @click="router.push('/home')"
        />
      </div>
    </div>
  </div>
</template>
