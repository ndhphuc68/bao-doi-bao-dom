<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'

definePageMeta({
  layout: 'admin',
  middleware: ['require-super-admin']
})

type UserRow = {
  id: string
  email: string
  name: string
  phoneNumber?: string
  points: number
  role: string
  collectionPointId?: string | null
}

const token = useCookie('admin_auth_token')
const { apiFetch } = useApi()
const toast = useToast()

const { data: rows, pending, refresh } = await useAsyncData('admin_all_users', () =>
  apiFetch<UserRow[]>('/admin/users', {
    headers: { Authorization: `Bearer ${token.value}` }
  })
)

// Edit User
const editDialog = ref(false)
const editingUser = ref<Partial<UserRow>>({})
const saving = ref(false)

const openEdit = (u: UserRow) => {
  editingUser.value = { ...u }
  editDialog.value = true
}

const saveUser = async () => {
  if (!editingUser.value.id) return
  saving.value = true
  try {
    await apiFetch(`/admin/users/${editingUser.value.id}`, {
      method: 'PATCH',
      body: {
        name: editingUser.value.name,
        phoneNumber: editingUser.value.phoneNumber
      },
      headers: { Authorization: `Bearer ${token.value}` }
    })
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật thông tin user', life: 3000 })
    editDialog.value = false
    refresh()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể cập nhật user', life: 3000 })
  } finally {
    saving.value = false
  }
}

// Point History
const historyDialog = ref(false)
const historyLoading = ref(false)
const userHistory = ref<any>(null)
const selectedUserForHistory = ref<UserRow | null>(null)

const openHistory = async (u: UserRow) => {
  selectedUserForHistory.value = u
  historyDialog.value = true
  historyLoading.value = true
  try {
    userHistory.value = await apiFetch(`/admin/users/${u.id}/points`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải lịch sử điểm', life: 3000 })
  } finally {
    historyLoading.value = false
  }
}

// Delete User
const deleteDialog = ref(false)
const userToDelete = ref<UserRow | null>(null)
const deleting = ref(false)

const confirmDelete = (u: UserRow) => {
  userToDelete.value = u
  deleteDialog.value = true
}

const deleteUser = async () => {
  if (!userToDelete.value) return
  deleting.value = true
  try {
    await apiFetch(`/admin/users/${userToDelete.value.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.value}` }
    })
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa người dùng', life: 3000 })
    deleteDialog.value = false
    refresh()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xóa người dùng', life: 3000 })
  } finally {
    deleting.value = false
  }
}

function getReasonLabel(reason: string) {
  const map: Record<string, string> = {
    SIGNUP: 'Thành viên mới',
    ORDER_APPROVED: 'Hoàn trả thiết bị',
    REDEEM: 'Đổi quà tặng'
  }
  return map[reason] ?? reason
}

function formatDate(d: string) {
  return new Date(d).toLocaleString('vi-VN')
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <Toast />
    
    <div>
      <h1 class="text-xl font-bold tracking-tight">Tất cả users</h1>
      <p class="text-sm text-slate-600">Danh sách người dùng (admin tổng).</p>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div v-if="pending" class="p-4 text-sm text-slate-500 italic">Đang tải dữ liệu…</div>
      <div v-else-if="!rows?.length" class="p-4 text-sm text-slate-500">Không có dữ liệu.</div>
      <div v-else class="overflow-auto">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50">
            <tr class="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th class="px-4 py-3">Email</th>
              <th class="px-4 py-3">Tên</th>
              <th class="px-4 py-3">SĐT</th>
              <th class="px-4 py-3">Điểm</th>
              <th class="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="u in rows" :key="u.id" class="hover:bg-slate-50 transition-colors">
              <td class="px-4 py-3 font-medium">{{ u.email }}</td>
              <td class="px-4 py-3 text-slate-700">{{ u.name }}</td>
              <td class="px-4 py-3 text-slate-500 font-mono text-xs">{{ u.phoneNumber || '—' }}</td>
              <td class="px-4 py-3 font-bold text-emerald-700">{{ u.points }}</td>
              <td class="px-4 py-3 text-right whitespace-nowrap">
                <div class="flex justify-end gap-1">
                  <Button 
                    icon="pi pi-pencil" 
                    text 
                    rounded 
                    size="small" 
                    title="Chỉnh sửa"
                    class="!text-slate-500 hover:!text-emerald-600"
                    @click="openEdit(u)" 
                  />
                  <Button 
                    icon="pi pi-history" 
                    text 
                    rounded 
                    size="small" 
                    title="Lịch sử điểm"
                    class="!text-slate-500 hover:!text-sky-600"
                    @click="openHistory(u)" 
                  />
                  <Button 
                    icon="pi pi-trash" 
                    text 
                    rounded 
                    size="small" 
                    title="Xóa user"
                    class="!text-slate-400 hover:!text-rose-600"
                    @click="confirmDelete(u)" 
                  />
                </div>
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
          <label class="text-xs font-bold uppercase text-slate-500">Email</label>
          <InputText :value="editingUser.email" disabled class="!bg-slate-50" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase text-slate-500">Họ và tên</label>
          <InputText v-model="editingUser.name" placeholder="Nhập tên..." />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase text-slate-500">Số điện thoại</label>
          <InputText v-model="editingUser.phoneNumber" placeholder="Nhập SĐT..." />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Hủy" text class="!text-slate-500" @click="editDialog = false" />
          <Button label="Lưu thay đổi" :loading="saving" @click="saveUser" />
        </div>
      </template>
    </Dialog>

    <!-- Point History Dialog -->
    <Dialog v-model:visible="historyDialog" :header="`Lịch sử điểm: ${selectedUserForHistory?.name}`" modal class="w-[600px]" :draggable="false">
      <div v-if="historyLoading" class="py-10 text-center text-slate-500">
        <i class="pi pi-spin pi-spinner mr-2" /> Đang tải lịch sử...
      </div>
      <div v-else-if="!userHistory?.entries?.length" class="py-10 text-center text-slate-400 italic">
        Chưa có giao dịch điểm nào.
      </div>
      <div v-else class="max-h-[400px] overflow-auto rounded-xl border border-slate-100">
        <table class="w-full text-sm text-left">
          <thead class="bg-slate-50 text-xs font-bold text-slate-500">
            <tr>
              <th class="p-3">Thời gian</th>
              <th class="p-3">Lý do</th>
              <th class="p-3 text-right">Số điểm</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="e in userHistory.entries" :key="e.id">
              <td class="p-3 text-slate-500 text-xs">{{ formatDate(e.createdAt) }}</td>
              <td class="p-3">
                <div class="font-medium text-slate-700">{{ getReasonLabel(e.reason) }}</div>
                <div v-if="e.trackingCode" class="text-[10px] text-slate-400 font-mono">Đơn: {{ e.trackingCode }}</div>
              </td>
              <td class="p-3 text-right font-bold" :class="e.amount > 0 ? 'text-emerald-600' : 'text-rose-600'">
                {{ e.amount > 0 ? '+' : '' }}{{ e.amount }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <template #footer>
        <div class="flex justify-between items-center w-full">
          <div class="text-sm font-bold text-slate-700">
            Tổng điểm hiện tại: <span class="text-emerald-700 text-lg">{{ userHistory?.points ?? 0 }}</span>
          </div>
          <Button label="Đóng" text @click="historyDialog = false" />
        </div>
      </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:visible="deleteDialog" header="Xác nhận xóa" modal class="w-[350px]" :draggable="false">
      <div class="py-2">
        <p class="text-slate-700">Bạn có chắc chắn muốn xóa người dùng <strong class="text-rose-600">{{ userToDelete?.email }}</strong>?</p>
        <p class="mt-2 text-xs text-slate-500 italic">Hành động này không thể hoàn tác và sẽ xóa toàn bộ dữ liệu liên quan.</p>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Hủy" text class="!text-slate-500" @click="deleteDialog = false" />
          <Button label="Xóa vĩnh viễn" severity="danger" :loading="deleting" @click="deleteUser" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

