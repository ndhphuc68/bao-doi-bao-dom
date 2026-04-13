<script setup lang="ts">
import type { CollectionPointDto } from '~/types/api'
import { useRecycleStore } from '~/stores/recycle'

const store = useRecycleStore()
const router = useRouter()
const config = useRuntimeConfig()

const { data: points } = await useFetch<CollectionPointDto[]>('/collection-points', {
  baseURL: config.public.apiBase
})

const selectedPoint = ref(null)

function selectRow(pt) {
  selectedPoint.value = pt
}

function confirmPoint() {
  if (!selectedPoint.value) return
  store.collectionPointId = selectedPoint.value.id
  store.collectionPoint = selectedPoint.value
  router.push('/recycle/step-5')
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col bg-slate-50">
    <AppPageHeader title="Điểm thu gom" back-to="/recycle/step-3" />

    <div class="flex min-h-0 flex-1 flex-col">
      <!-- Map -->
      <div class="relative h-44 shrink-0 overflow-hidden bg-slate-200">
        <div
          class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sky-100 via-emerald-50/50 to-slate-100"
        >
          <div class="absolute inset-0 opacity-40">
            <div
              class="h-full w-full bg-[linear-gradient(#94a3b8_1px,transparent_1px),linear-gradient(90deg,#94a3b8_1px,transparent_1px)] bg-[size:24px_24px]"
            />
          </div>
          <Icon name="heroicons:map" class="relative z-[1] h-20 w-20 text-sky-200/90 drop-shadow-sm" />
        </div>
        <div class="absolute left-[30%] top-1/4 z-[2] -translate-x-1/2 -translate-y-1/2">
          <Icon
            name="heroicons:map-pin-solid"
            class="h-7 w-7 animate-bounce text-rose-500 drop-shadow-md"
            style="animation-delay: 0.1s"
          />
        </div>
        <div class="absolute right-[28%] top-[42%] z-[2] -translate-x-1/2 -translate-y-1/2">
          <Icon
            name="heroicons:map-pin-solid"
            class="h-7 w-7 animate-bounce text-rose-500 drop-shadow-md"
            style="animation-delay: 0.35s"
          />
        </div>
      </div>

      <div class="flex flex-1 flex-col rounded-t-3xl border-x border-t border-slate-100 bg-white px-5 py-5 shadow-[0_-8px_24px_rgba(15,23,42,0.06)]">
        <RecycleProgress :step="4" />

        <h3 class="mb-4 text-lg font-bold tracking-tight text-slate-900">Các điểm quanh bạn</h3>

        <div class="max-h-[min(38vh,340px)] space-y-2 overflow-y-auto pr-0.5">
          <p
            v-if="!points?.length"
            class="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-500"
          >
            Không tải được danh sách điểm thu. Kiểm tra backend và thử lại.
          </p>
          <button
            v-for="pt in points || []"
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
