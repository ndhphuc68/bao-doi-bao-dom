<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
import { getApiErrorMessage } from '~/utils/api/errors'

definePageMeta({
  layout: 'admin',
  middleware: ['require-super-admin']
})

type StoreAdmin = {
  id: string
  email: string
  name: string
  role: string
  collectionPointId?: string | null
  collectionPoint?: { id: string; name: string } | null
}

const token = useCookie('admin_auth_token')
const toast = useToast()
const { apiFetch } = useApi()

const form = reactive({
  email: '',
  password: '',
  name: ''
})

const {
  data: rows,
  pending,
  refresh
} = await useAsyncData('admin_store_admins', () =>
  apiFetch<StoreAdmin[]>('/admin/store-admins', {
    headers: { Authorization: `Bearer ${token.value}` }
  })
)

const submit = async () => {
  try {
    await apiFetch('/admin/store-admins', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: {
        email: form.email,
        password: form.password,
        name: form.name || form.email.split('@')[0]
      }
    })
    toast.add({ severity: 'success', summary: 'Đã tạo', detail: 'Tài khoản admin cửa hàng đã được thêm.', life: 2500 })
    form.email = ''
    form.password = ''
    form.name = ''
    await refresh()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: getApiErrorMessage(e), life: 4000 })
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 class="text-xl font-bold tracking-tight">Quản lý admin cửa hàng</h1>
      <p class="text-sm text-slate-600">Chỉ admin tổng tạo tài khoản admin cửa hàng.</p>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div class="mb-3 text-sm font-semibold text-slate-800">Tạo tài khoản mới</div>
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label class="mb-1 block text-xs font-medium text-slate-600">Email</label>
          <InputText v-model="form.email" fluid class="rounded-xl" placeholder="store@shop.com" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-slate-600">Mật khẩu</label>
          <Password
            v-model="form.password"
            :feedback="false"
            toggle-mask
            fluid
            input-class="rounded-xl"
            placeholder="••••••••"
          />
        </div>
        <div class="md:col-span-2">
          <label class="mb-1 block text-xs font-medium text-slate-600">Tên hiển thị</label>
          <InputText v-model="form.name" fluid class="rounded-xl" placeholder="Nguyễn Văn A" />
        </div>
      </div>
      <div class="mt-4 flex justify-end">
        <Button label="Tạo admin cửa hàng" class="!rounded-xl" :loading="pending" @click="submit" />
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200">
      <div v-if="pending" class="p-4 text-sm text-slate-500">Đang tải…</div>
      <div v-else-if="!rows?.length" class="p-4 text-sm text-slate-500">Chưa có admin cửa hàng.</div>
      <div v-else class="overflow-auto">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50">
            <tr class="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th class="px-4 py-3">Email</th>
              <th class="px-4 py-3">Tên</th>
              <th class="px-4 py-3">Cửa hàng</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr v-for="r in rows" :key="r.id" class="hover:bg-slate-50">
              <td class="px-4 py-3">{{ r.email }}</td>
              <td class="px-4 py-3">{{ r.name }}</td>
              <td class="px-4 py-3">{{ r.collectionPoint?.name || r.collectionPointId || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
