<script setup>
import { useRecycleStore } from '~/stores/recycle'

const store = useRecycleStore()
const router = useRouter()
const mediaUrl = useMediaUrl()

const fileInputId = 'recycle-step2-images'
const maxImages = 3

const brands = ['Apple', 'Samsung', 'MSI', 'Logitech', 'Khác']

const conditionOptions = [
  { label: 'Còn hoạt động', value: 'WORKING' },
  { label: 'Không hoạt động', value: 'NOT_WORKING' }
]

function isAllowedImage(file) {
  return file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg'
}

async function onFilesSelected(event) {
  const input = event.target
  const files = input.files ? [...input.files] : []
  const remaining = maxImages - store.images.length
  if (remaining <= 0 || !files.length) {
    input.value = ''
    return
  }

  const toRead = files.filter(isAllowedImage).slice(0, remaining)
  const dataUrls = await Promise.all(
    toRead.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = () => reject(reader.error)
          reader.readAsDataURL(file)
        })
    )
  )

  store.images.push(...dataUrls)
  input.value = ''
}

function removeImage(index) {
  store.images.splice(index, 1)
}

const nextStep = () => {
  router.push('/recycle/step-3')
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col bg-white">
    <AppPageHeader title="Thông tin thiết bị" back-to="/recycle/step-1" />

    <div class="flex-1 space-y-5 px-5 pb-6 pt-2 sm:px-8">
      <RecycleProgress :step="2" />

      <div class="flex flex-col gap-2">
        <label for="dev-name" class="text-sm font-medium text-slate-800">Tên thiết bị</label>
        <InputText
          id="dev-name"
          v-model="store.deviceName"
          placeholder="Ví dụ: Chuột máy tính"
          fluid
          class="rounded-2xl"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="dev-brand" class="text-sm font-medium text-slate-800">Hãng sản xuất</label>
        <Select
          id="dev-brand"
          v-model="store.manufacturer"
          :options="brands"
          placeholder="Chọn hãng"
          fluid
          show-clear
          class="rounded-2xl"
        />
      </div>

      <div class="flex flex-col gap-2">
        <span class="text-sm font-medium text-slate-800">Tình trạng</span>
        <SelectButton
          v-model="store.condition"
          :options="conditionOptions"
          option-label="label"
          option-value="value"
          fluid
          :allow-empty="false"
        />
      </div>

      <div class="flex flex-col gap-2">
        <span class="text-sm font-medium text-slate-800">Tải ảnh lên</span>

        <div v-if="store.images.length" class="mb-2 flex flex-wrap gap-2">
          <div
            v-for="(src, idx) in store.images"
            :key="idx"
            class="relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
          >
            <img :src="mediaUrl(src)" alt="" class="h-full w-full object-cover" />
            <button
              type="button"
              class="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-xs text-white backdrop-blur-sm"
              aria-label="Xóa ảnh"
              @click="removeImage(idx)"
            >
              ×
            </button>
          </div>
        </div>

        <input
          :id="fileInputId"
          type="file"
          class="sr-only"
          accept="image/jpeg,image/jpg,image/png"
          multiple
          @change="onFilesSelected"
        />

        <label
          v-if="store.images.length < maxImages"
          :for="fileInputId"
          class="block cursor-pointer"
        >
          <Card
            class="border-2 border-dashed border-slate-200 bg-slate-50/80 transition-colors hover:border-emerald-300 hover:bg-emerald-50/30"
            :pt="{ body: { class: '!py-8 !text-center' }, root: { class: 'rounded-2xl' } }"
          >
            <template #content>
              <Icon name="heroicons:camera" class="mx-auto mb-2 h-8 w-8 text-emerald-600" />
              <p class="mb-1 text-sm font-semibold text-emerald-700">Nhấn để chụp hoặc tải lên</p>
              <p class="text-xs text-slate-500">
                Tối đa {{ maxImages }} ảnh (JPG, PNG) · đã chọn {{ store.images.length }}/{{ maxImages }}
              </p>
            </template>
          </Card>
        </label>

        <Card
          v-else
          class="border-2 border-dashed border-emerald-200 bg-emerald-50/40"
          :pt="{ body: { class: '!py-6 !text-center' }, root: { class: 'rounded-2xl' } }"
        >
          <template #content>
            <p class="text-sm font-medium text-emerald-800">Đã đủ {{ maxImages }} ảnh</p>
            <p class="mt-1 text-xs text-slate-600">Xóa một ảnh ở trên nếu muốn thay thế.</p>
          </template>
        </Card>
      </div>
    </div>

    <div class="border-t border-slate-100 px-5 py-5 sm:px-8">
      <Button
        label="Tiếp tục"
        fluid
        rounded
        size="large"
        :disabled="!store.deviceName || !store.manufacturer"
        @click="nextStep"
      />
    </div>
  </div>
</template>
