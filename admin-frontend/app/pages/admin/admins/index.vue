<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
import { getApiErrorMessage } from '~/utils/api/errors'

definePageMeta({
  layout: 'admin',
  middleware: ['require-super-admin']
})

type Admin = {
  id: string
  email: string
  name: string
  role: string
  phoneNumber?: string
}

const token = useCookie('admin_auth_token')
const toast = useToast()
const { apiFetch } = useApi()

const {
  data: rows,
  pending,
  refresh
} = await useAsyncData('admin_admins', () =>
  apiFetch<Admin[]>('/admin/admins', {
    headers: { Authorization: `Bearer ${token.value}` }
  })
)

const searchQuery = ref('')

const filteredRows = computed(() => {
  if (!rows.value) return []
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return rows.value
  return rows.value.filter(a => 
    a.email.toLowerCase().includes(q) || 
    a.name.toLowerCase().includes(q)
  )
})

const editDialog = ref(false)
const editingAdmin = ref<Partial<Admin>>({})
const saving = ref(false)

const openEdit = (a: Admin) => {
  editingAdmin.value = { ...a }
  editDialog.value = true
}

const saveAdmin = async () => {
  if (!editingAdmin.value.id) return
  saving.value = true
  try {
    await apiFetch(`/admin/admins/${editingAdmin.value.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { name: editingAdmin.value.name }
    })
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật', life: 2500 })
    editDialog.value = false
    refresh()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: getApiErrorMessage(e), life: 3000 })
  } finally {
    saving.value = false
  }
}

const deleteDialog = ref(false)
const adminToDelete = ref<Admin | null>(null)
const deleting = ref(false)

const confirmDelete = (a: Admin) => {
  adminToDelete.value = a
  deleteDialog.value = true
}

const deleteAdmin = async () => {
  if (!adminToDelete.value) return
  deleting.value = true
  try {
    await apiFetch(`/admin/users/${adminToDelete.value.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.value}` }
    })
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa tài khoản', life: 2500 })
    deleteDialog.value = false
    refresh()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: getApiErrorMessage(e), life: 3000 })
  } finally {
    deleting.value = false
  }
}

function formatRole(role: string) {
  if (role === 'SUPER_ADMIN') return 'Quản trị viên'
  if (role === 'USER') return 'Người dùng'
  return role
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold tracking-tight">Quản lý tài khoản Admin</h1>
        <p class="text-sm text-slate-600">Quản lý danh sách các admin có quyền truy cập hệ thống.</p>
      </div>
      <NuxtLink to="/admin/admins/create">
        <Button label="Thêm Admin mới" icon="pi pi-plus" class="!rounded-xl shadow-md shadow-emerald-500/10" />
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="flex items-center bg-white p-4 rounded-2xl border border-slate-200">
      <IconField class="w-full max-w-[400px]">
        <InputIcon class="pi pi-search text-slate-400" />
        <InputText v-model="searchQuery" placeholder="Tìm theo tên hoặc email..." class="w-full rounded-xl !bg-slate-50/50" />
      </IconField>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <div v-if="pending" class="p-4 text-sm text-slate-500">Đang tải…</div>
      <div v-else-if="!filteredRows?.length" class="p-12 flex flex-col items-center justify-center text-center bg-white">
        <i class="pi pi-users text-4xl text-slate-200 mb-3" />
        <p class="text-sm font-medium text-slate-500">Không tìm thấy tài khoản nào.</p>
      </div>
      <div v-else class="overflow-auto bg-white">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50">
            <tr class="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th class="px-5 py-4">Email</th>
              <th class="px-5 py-4">Tên hiển thị</th>
              <th class="px-5 py-4">SĐT</th>
              <th class="px-5 py-4">Vai trò</th>
              <th class="px-5 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr v-for="r in filteredRows" :key="r.id" class="hover:bg-slate-50/50 transition-colors">
              <td class="px-5 py-4 font-medium">{{ r.email }}</td>
              <td class="px-5 py-4 text-slate-700">{{ r.name }}</td>
              <td class="px-5 py-4 text-slate-600 font-mono text-xs">{{ r.phoneNumber || '—' }}</td>
              <td class="px-5 py-4"><Badge :value="formatRole(r.role)" severity="info" /></td>
              <td class="px-5 py-4 text-right">
                <Button icon="pi pi-pencil" text rounded size="small" @click="openEdit(r)" class="!text-slate-500" title="Sửa" />
                <Button icon="pi pi-trash" text rounded size="small" @click="confirmDelete(r)" class="!text-rose-500" title="Xóa" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Dialog -->
    <Dialog v-model:visible="editDialog" header="Chỉnh sửa thông tin" modal class="w-[400px]" :draggable="false">
      <div class="flex flex-col gap-4 pt-2">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase text-slate-500 tracking-wide">Họ và tên</label>
          <InputText v-model="editingAdmin.name" placeholder="Nhập tên..." class="rounded-xl" />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2 border-t border-slate-50 pt-4 mt-2">
          <Button label="Hủy" text class="!text-slate-500" @click="editDialog = false" />
          <Button label="Lưu thay đổi" class="px-6 rounded-xl" :loading="saving" @click="saveAdmin" />
        </div>
      </template>
    </Dialog>

    <!-- Delete Confirmation -->
    <Dialog v-model:visible="deleteDialog" header="Xác nhận xóa" modal class="w-[350px]" :draggable="false">
      <div class="py-2">
        <p class="text-slate-700 leading-relaxed">Xóa vĩnh viễn tài khoản admin <strong class="text-rose-600">{{ adminToDelete?.email }}</strong>?</p>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2 border-t border-slate-50 pt-4 mt-2">
          <Button label="Hủy" text class="!text-slate-500" @click="deleteDialog = false" />
          <Button label="Xóa vĩnh viễn" severity="danger" class="px-6 rounded-xl" :loading="deleting" @click="deleteAdmin" />
        </div>
      </template>
    </Dialog>
  </div>
</template>
