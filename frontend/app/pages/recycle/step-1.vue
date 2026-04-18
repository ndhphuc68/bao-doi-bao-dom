<script setup>
import { useRecycleStore } from '~/stores/recycle'

const router = useRouter()
const store = useRecycleStore()

const devices = [
  { id: 'phone', name: 'Điện thoại', icon: 'heroicons:device-phone-mobile' },
  { id: 'mouse', name: 'Chuột', icon: 'heroicons:computer-desktop' },
  { id: 'desktop', name: 'Máy tính để bàn', icon: 'heroicons:tv' },
  { id: 'other', name: 'Khác', icon: 'heroicons:cube' }
]

const selectDevice = (id) => {
  store.setDevice(devices.find((d) => d.id === id).name)
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col bg-white">
    <AppPageHeader title="Thu gom thiết bị" back-to="/recycle" />

    <div class="flex-1 px-5 pb-6 pt-2 sm:px-8">
      <RecycleProgress :step="1" />

      <h3 class="mb-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
        Bạn muốn thu gom loại thiết bị nào?
      </h3>
      <p class="mb-6 text-sm text-slate-600">Chọn thiết bị điện tử bạn muốn gửi tái chế.</p>

      <div class="grid grid-cols-2 gap-3 sm:gap-4">
        <Card
          v-for="device in devices"
          :key="device.id"
          v-ripple
          class="cursor-pointer shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
          :class="
            store.deviceType === device.name
              ? '!border-2 !border-emerald-500 !bg-emerald-50/80'
              : '!border !border-slate-100'
          "
          :pt="{ body: { class: '!p-4 sm:!p-5' }, root: { class: 'rounded-2xl overflow-hidden' } }"
          @click="selectDevice(device.id)"
        >
          <template #content>
            <div class="flex flex-col items-center text-center">
              <div
                class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl transition-colors"
                :class="
                  store.deviceType === device.name
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                "
              >
                <Icon :name="device.icon" class="h-8 w-8" />
              </div>
              <span
                class="text-sm font-semibold"
                :class="store.deviceType === device.name ? 'text-emerald-800' : 'text-slate-700'"
                >{{ device.name }}</span
              >
            </div>
          </template>
        </Card>
      </div>
    </div>

    <div class="border-t border-slate-100 bg-white/90 px-5 py-5 backdrop-blur-sm sm:px-8">
      <Button
        label="Tiếp tục"
        fluid
        rounded
        size="large"
        :disabled="!store.deviceType"
        @click="store.deviceType ? router.push('/recycle/step-2') : null"
      />
    </div>
  </div>
</template>
