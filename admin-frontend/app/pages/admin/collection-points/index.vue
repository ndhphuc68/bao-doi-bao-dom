<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
import { getApiErrorMessage } from '~/utils/api/errors'

definePageMeta({
  layout: 'admin',
  middleware: ['require-super-admin']
})

type CollectionPoint = {
  id: string
  name: string
  address: string
  latitude?: number | null
  longitude?: number | null
  openHours?: string
  distanceText?: string
}

const token = useCookie('admin_auth_token')
const toast = useToast()
const { apiFetch } = useApi()

const {
  data: rows,
  pending,
  refresh
} = await useAsyncData('admin_collection_points', () =>
  apiFetch<CollectionPoint[]>('/collection-points', {
    headers: { Authorization: `Bearer ${token.value}` }
  })
)

const searchQuery = ref('')
const filteredRows = computed(() => {
  if (!rows.value) return []
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return rows.value
  return rows.value.filter(cp => 
    cp.name.toLowerCase().includes(q) || 
    cp.address.toLowerCase().includes(q)
  )
})

// Dialog Logic
const dialogVisible = ref(false)
const isEdit = ref(false)
const saving = ref(false)

const form = reactive({
  id: '',
  name: '',
  address: '',
  latitude: null as number | null,
  longitude: null as number | null,
  openHours: '08:00 - 20:00'
})

const openAdd = () => {
  isEdit.value = false
  form.id = ''
  form.name = ''
  form.address = ''
  form.latitude = null
  form.longitude = null
  form.openHours = '08:00 - 20:00'
  dialogVisible.value = true
}

const openEdit = (cp: CollectionPoint) => {
  isEdit.value = true
  form.id = cp.id
  form.name = cp.name
  form.address = cp.address
  form.latitude = cp.latitude ?? null
  form.longitude = cp.longitude ?? null
  form.openHours = cp.openHours || ''
  dialogVisible.value = true
}

const submit = async () => {
  if (!form.name || !form.address) {
    toast.add({ severity: 'warn', summary: 'Thiếu thông tin', detail: 'Vui lòng nhập Tên và Địa chỉ', life: 3000 })
    return
  }
  saving.value = true
  try {
    if (isEdit.value) {
      await apiFetch(`/collection-points/admin/${form.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token.value}` },
        body: { ...form }
      })
      toast.add({ severity: 'success', summary: 'Cập nhật thành công', life: 2500 })
    } else {
      await apiFetch('/collection-points/admin', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token.value}` },
        body: { ...form }
      })
      toast.add({ severity: 'success', summary: 'Thêm mới thành công', life: 2500 })
    }
    dialogVisible.value = false
    refresh()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: getApiErrorMessage(e), life: 4000 })
  } finally {
    saving.value = false
  }
}

// Delete Logic
const deleteDialog = ref(false)
const pointToDelete = ref<CollectionPoint | null>(null)
const deleting = ref(false)

const confirmDelete = (cp: CollectionPoint) => {
  pointToDelete.value = cp
  deleteDialog.value = true
}

const deletePoint = async () => {
  if (!pointToDelete.value) return
  deleting.value = true
  try {
    await apiFetch(`/collection-points/admin/${pointToDelete.value.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.value}` }
    })
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa điểm thu gom', life: 2500 })
    deleteDialog.value = false
    refresh()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: getApiErrorMessage(e), life: 3000 })
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <Toast />
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold tracking-tight">Quản lý Điểm thu gom</h1>
        <p class="text-sm text-slate-600">Danh sách các địa điểm tiếp nhận thiết bị điện tử cũ.</p>
      </div>
      <Button label="Thêm điểm mới" icon="pi pi-plus" class="!rounded-xl shadow-md shadow-emerald-500/10" @click="openAdd" />
    </div>

    <div class="flex items-center bg-white p-4 rounded-2xl border border-slate-200">
      <IconField class="w-full max-w-[400px]">
        <InputIcon class="pi pi-search text-slate-400" />
        <InputText v-model="searchQuery" placeholder="Tìm theo tên hoặc địa chỉ..." class="w-full rounded-xl !bg-slate-50/50" />
      </IconField>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <div v-if="pending" class="p-4 text-sm text-slate-500">Đang tải…</div>
      <div v-else-if="!filteredRows?.length" class="p-12 flex flex-col items-center justify-center text-center bg-white">
        <i class="pi pi-map-marker text-4xl text-slate-200 mb-3" />
        <p class="text-sm font-medium text-slate-500">Không tìm thấy địa điểm nào.</p>
      </div>
      <div v-else class="overflow-auto bg-white">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50">
            <tr class="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th class="px-5 py-4">Tên điểm</th>
              <th class="px-5 py-4">Địa chỉ</th>
              <th class="px-5 py-4 text-center">Tọa độ</th>
              <th class="px-5 py-4 text-center">Giờ mở cửa</th>
              <th class="px-5 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr v-for="cp in filteredRows" :key="cp.id" class="hover:bg-slate-50/50 transition-colors">
              <td class="px-5 py-4 font-bold text-slate-900">{{ cp.name }}</td>
              <td class="px-5 py-4 text-slate-600">{{ cp.address }}</td>
              <td class="px-5 py-4 text-center text-slate-500 font-mono text-xs">
                {{ cp.latitude && cp.longitude ? `${cp.latitude.toFixed(3)}, ${cp.longitude.toFixed(3)}` : '—' }}
              </td>
              <td class="px-5 py-4 text-center">
                <span class="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
                  {{ cp.openHours || '—' }}
                </span>
              </td>
              <td class="px-5 py-4 text-right">
                <div class="flex justify-end gap-1">
                  <Button icon="pi pi-pencil" text rounded size="small" class="!text-slate-500" @click="openEdit(cp)" />
                  <Button icon="pi pi-trash" text rounded size="small" class="!text-rose-500" @click="confirmDelete(cp)" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Dialog -->
    <Dialog v-model:visible="dialogVisible" :header="isEdit ? 'Chỉnh sửa điểm thu gom' : 'Thêm điểm thu gom mới'" modal class="w-[500px]" :draggable="false">
      <div class="flex flex-col gap-4 pt-2">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase text-slate-500">Tên điểm <span class="text-rose-500">*</span></label>
          <InputText v-model="form.name" placeholder="Ví dụ: EcoPoint Quận 1" class="rounded-xl" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase text-slate-500">Địa chỉ <span class="text-rose-500">*</span></label>
          <InputText v-model="form.address" placeholder="Nhập địa chỉ..." class="rounded-xl" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold uppercase text-slate-500">Vĩ độ (Lat)</label>
            <InputNumber v-model="form.latitude" :min-fraction-digits="2" :max-fraction-digits="6" fluid input-class="rounded-xl" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold uppercase text-slate-500">Kinh độ (Lng)</label>
            <InputNumber v-model="form.longitude" :min-fraction-digits="2" :max-fraction-digits="6" fluid input-class="rounded-xl" />
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase text-slate-500">Giờ hoạt động</label>
          <InputText v-model="form.openHours" placeholder="08:00 - 20:00" class="rounded-xl" />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2 border-t border-slate-50 pt-4 mt-2">
          <Button label="Hủy" text class="!text-slate-500" @click="dialogVisible = false" />
          <Button :label="isEdit ? 'Lưu thay đổi' : 'Thêm mới'" class="px-6 rounded-xl" :loading="saving" @click="submit" />
        </div>
      </template>
    </Dialog>

    <!-- Delete Confirmation -->
    <Dialog v-model:visible="deleteDialog" header="Xác nhận xóa" modal class="w-[350px]" :draggable="false">
      <div class="py-2">
        <p class="text-slate-700">Xóa vĩnh viễn điểm thu gom <strong class="text-rose-600">{{ pointToDelete?.name }}</strong>?</p>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2 border-t border-slate-50 pt-4 mt-2">
          <Button label="Hủy" text class="!text-slate-500" @click="deleteDialog = false" />
          <Button label="Xóa vĩnh viễn" severity="danger" class="px-6 rounded-xl" :loading="deleting" @click="deletePoint" />
        </div>
      </template>
    </Dialog>
  </div>
</template>
