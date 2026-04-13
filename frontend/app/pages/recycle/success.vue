<script setup>
import { useRecycleStore } from '~/stores/recycle'

const store = useRecycleStore()
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-emerald-50/50 to-slate-50">
    <AppPageHeader title="Hoàn thành" />

    <div class="flex flex-1 flex-col items-center px-6 pb-8 pt-2 text-center sm:px-10">
      <div class="relative mb-8">
        <div class="absolute inset-0 scale-125 rounded-full bg-emerald-400/20 blur-2xl" />
        <div
          class="relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg shadow-emerald-500/20 ring-4 ring-emerald-100"
        >
          <div
            class="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-inner"
          >
            <i class="pi pi-check text-3xl" aria-hidden="true" />
          </div>
        </div>
      </div>

      <h2 class="mb-3 max-w-sm text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        Đặt lịch hoàn trả<br />thành công
      </h2>
      <p class="mb-8 max-w-md text-pretty text-sm leading-relaxed text-slate-600">
        Bạn đã đăng ký hoàn trả 1 thiết bị điện tử tới
        <span class="font-semibold text-slate-800">{{ store.collectionPoint?.name || 'Điểm thu gom' }}</span
        >. Vui lòng mang thiết bị đến đúng thời gian đã hẹn.
      </p>

      <Card class="mb-10 w-full max-w-md text-left shadow-lg" :pt="{ root: { class: 'rounded-3xl overflow-hidden' } }">
        <template #content>
          <p class="mb-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600">Mã xác nhận</p>
          <h3 class="mb-6 font-mono text-3xl font-black tracking-widest text-slate-900">
            {{ store.trackingCode || 'ECO-2045' }}
          </h3>
          <Divider />
          <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Thời gian</p>
          <p class="text-sm font-bold text-slate-800">{{ store.scheduledDate }} · {{ store.scheduledTime }}</p>
        </template>
      </Card>
    </div>

    <div
      class="mt-auto flex flex-col gap-3 border-t border-slate-100 bg-white/95 px-5 py-6 shadow-[0_-15px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:px-8"
    >
      <Button label="Về trang chủ" fluid rounded size="large" icon="pi pi-home" @click="navigateTo('/home')" />
      <Button
        label="Xem biên nhận"
        fluid
        rounded
        severity="secondary"
        outlined
        icon="pi pi-file"
        @click="navigateTo('/home')"
      />
    </div>
  </div>
</template>
