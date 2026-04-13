<script setup>
import { useRecycleStore } from '~/stores/recycle'

const store = useRecycleStore()
const router = useRouter()
const mediaUrl = useMediaUrl()

const nextStep = () => {
  router.push('/recycle/step-4')
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col bg-white">
    <AppPageHeader title="Xác nhận thông tin" back-to="/recycle/step-2" />

    <div class="flex-1 px-5 pb-6 pt-2 sm:px-8">
      <RecycleProgress :step="3" />

      <h3 class="mb-4 text-lg font-bold text-slate-900">Tóm tắt thiết bị</h3>

      <Card class="relative mb-8 overflow-hidden shadow-sm" :pt="{ root: { class: 'rounded-2xl border border-slate-100' } }">
        <template #content>
          <Tag value="+10 điểm" severity="success" class="absolute right-4 top-4 z-10" />
          <div
            class="relative mb-4 h-32 overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200/80"
          >
            <img
              v-if="store.images[0]"
              :src="mediaUrl(store.images[0])"
              alt=""
              class="h-full w-full object-cover"
            />
            <div v-else class="flex h-full items-center justify-center">
              <Icon name="heroicons:photo" class="h-12 w-12 text-slate-400" />
            </div>
          </div>
          <h4 class="mb-2 text-lg font-bold text-slate-900">{{ store.deviceName || store.deviceType || 'Thiết bị' }}</h4>
          <div class="space-y-1.5">
            <div class="flex items-center text-sm text-slate-600">
              <Icon name="heroicons:tag" class="mr-2 h-4 w-4 text-slate-400" /> Hãng:
              {{ store.manufacturer || 'MSI' }}
            </div>
            <div
              class="flex items-center text-sm"
              :class="store.condition === 'WORKING' ? 'text-emerald-600' : 'text-rose-600'"
            >
              <Icon
                :name="store.condition === 'WORKING' ? 'heroicons:check-circle' : 'heroicons:x-circle'"
                class="mr-2 h-4 w-4"
              />
              Tình trạng:
              {{ store.condition === 'WORKING' ? 'Hoạt động' : 'Không hoạt động' }}
            </div>
          </div>
        </template>
      </Card>

      <div class="mb-4 flex items-center justify-between">
        <h3 class="font-bold text-slate-900">Hình ảnh đã tải lên</h3>
        <Badge :value="`${store.images.length}/3`" severity="secondary" />
      </div>
      <div v-if="store.images.length" class="mb-6 flex flex-wrap gap-3">
        <img
          v-for="(src, idx) in store.images"
          :key="idx"
          :src="mediaUrl(src)"
          alt=""
          class="h-24 w-24 rounded-xl border border-slate-200 object-cover"
        />
      </div>
      <div
        v-else
        class="mb-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center"
      >
        <p class="text-sm text-slate-600">Chưa có ảnh.</p>
        <NuxtLink
          to="/recycle/step-2"
          class="mt-2 inline-flex text-sm font-semibold text-emerald-700 underline underline-offset-2"
        >
          Quay lại bước 2 để tải ảnh
        </NuxtLink>
      </div>
    </div>

    <div class="border-t border-slate-100 px-5 py-5 sm:px-8">
      <Button label="Tiếp tục" fluid rounded size="large" @click="nextStep" />
    </div>
  </div>
</template>
