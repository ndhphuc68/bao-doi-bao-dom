<script setup>
import { computed } from 'vue'
import { useRecycleStore } from '~/stores/recycle'
import { getApiErrorMessage } from '~/utils/api/errors'
import { dataUrlToFile } from '~/utils/image'

const store = useRecycleStore()
const router = useRouter()
const mediaUrl = useMediaUrl()
const { recyclingRequests, uploads } = useApi()

const timeSlots = ['08:30 - 10:00', '10:00 - 12:00', '13:30 - 15:00', '15:00 - 17:00']

const dateModel = computed({
  get() {
    const s = store.scheduledDate
    if (!s) return null
    const [y, m, d] = s.split('-').map(Number)
    return new Date(y, (m || 1) - 1, d || 1)
  },
  set(v) {
    if (!v) return
    const d = v instanceof Date ? v : new Date(v)
    store.scheduledDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
})

const bookAppointment = async () => {
  try {
    const token = useCookie('auth_token').value
    if (!token) {
      alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.')
      await router.push('/login')
      return
    }
    if (store.images.length && store.images[0].startsWith('data:')) {
      const files = store.images.map((src, i) => dataUrlToFile(src, `eco-${i}.jpg`))
      const { urls } = await uploads.recyclingImages(token, files)
      store.images.splice(0, store.images.length, ...urls)
    }

    const data = await recyclingRequests.create(token, {
      deviceType: store.deviceType,
      deviceName: store.deviceName,
      manufacturer: store.manufacturer,
      condition: store.condition,
      collectionPointId: store.collectionPointId,
      scheduledDate: store.scheduledDate,
      scheduledTime: store.scheduledTime || '08:30 - 10:00',
      images: [...store.images]
    })

    store.trackingCode = data.trackingCode
    router.push('/recycle/processing')
  } catch (err) {
    alert(getApiErrorMessage(err))
  }
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col bg-white">
    <AppPageHeader title="Chọn thời gian hoàn trả" back-to="/recycle/step-4" />

    <div class="flex-1 space-y-5 px-5 pb-6 pt-2 sm:px-8">
      <RecycleProgress :step="5" />

      <h3 class="text-lg font-bold text-slate-900">Tóm tắt đăng ký</h3>
      <Card class="shadow-sm" :pt="{ root: { class: 'rounded-2xl border border-slate-100 overflow-hidden' } }">
        <template #content>
          <div class="flex items-start gap-4 pl-1">
            <Avatar
              icon="pi pi-desktop"
              size="large"
              shape="rounded"
              class="!bg-slate-100 !text-slate-600 shrink-0"
            />
            <div class="min-w-0 flex-1">
              <p class="text-sm font-bold text-slate-900">
                {{ store.deviceName || 'Thiết bị chưa chọn' }} — {{ store.manufacturer || 'Hãng' }}
              </p>
              <p class="mt-1 flex items-center text-xs font-medium text-emerald-700">
                <i class="pi pi-building mr-1 text-xs" />
                {{ store.collectionPoint?.name || 'Chưa có điểm thu' }}
              </p>
            </div>
          </div>
          <div v-if="store.images.length" class="mt-4 border-t border-slate-100 pt-4">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Ảnh thiết bị</p>
            <div class="flex flex-wrap gap-2">
              <img
                v-for="(src, idx) in store.images"
                :key="idx"
                :src="mediaUrl(src)"
                alt=""
                class="h-14 w-14 rounded-lg border border-slate-100 object-cover sm:h-16 sm:w-16"
              />
            </div>
          </div>
        </template>
      </Card>

      <h3 class="text-base font-bold text-slate-900">Chọn ngày và giờ hoàn trả</h3>

      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-slate-800">Ngày hoàn trả</label>
        <ClientOnly>
          <DatePicker
            v-model="dateModel"
            date-format="dd/mm/yy"
            show-icon
            fluid
            icon-display="input"
            :show-button-bar="true"
            class="rounded-2xl"
          />
          <template #fallback>
            <InputText v-model="store.scheduledDate" type="date" fluid class="rounded-2xl" />
          </template>
        </ClientOnly>
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-slate-800">Khung giờ</label>
        <Select
          v-model="store.scheduledTime"
          :options="timeSlots"
          placeholder="Chọn giờ"
          fluid
          show-clear
          class="rounded-2xl"
        />
      </div>
    </div>

    <div
      class="border-t border-slate-100 bg-white/95 px-5 py-5 shadow-[0_-12px_40px_rgba(15,23,42,0.04)] backdrop-blur-sm sm:px-8"
    >
      <Button label="Xác nhận đặt lịch" fluid rounded size="large" @click="bookAppointment" />
    </div>
  </div>
</template>
