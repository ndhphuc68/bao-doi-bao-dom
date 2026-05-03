<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
import { getApiErrorMessage } from '~/utils/api/errors'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: 'admin',
  middleware: ['require-super-admin']
})

const token = useCookie('admin_auth_token')
const toast = useToast()
const { apiFetch } = useApi()
const router = useRouter()

const form = reactive({
  email: '',
  password: '',
  name: ''
})

const loading = ref(false)

const submit = async () => {
  if (!form.email || !form.password) {
    toast.add({ severity: 'warn', summary: 'Thiếu thông tin', detail: 'Vui lòng nhập Email và Mật khẩu', life: 3000 })
    return
  }
  loading.value = true
  try {
    await apiFetch('/admin/admins', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: {
        email: form.email,
        password: form.password,
        name: form.name || form.email.split('@')[0]
      }
    })
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Tài khoản admin đã được tạo.', life: 2500 })
    router.push('/admin/admins')
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: getApiErrorMessage(e), life: 4000 })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center gap-2">
      <NuxtLink to="/admin/admins">
        <Button icon="pi pi-arrow-left" text rounded size="small" class="!text-slate-400" />
      </NuxtLink>
      <h1 class="text-xl font-bold tracking-tight">Thêm Admin mới</h1>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm max-w-2xl">
      <div class="grid grid-cols-1 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase text-slate-500">Email <span class="text-rose-500">*</span></label>
          <InputText v-model="form.email" placeholder="admin@example.com" class="rounded-xl" />
        </div>
        
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase text-slate-500">Mật khẩu <span class="text-rose-500">*</span></label>
          <Password
            v-model="form.password"
            :feedback="false"
            toggle-mask
            fluid
            input-class="rounded-xl"
            placeholder="••••••••"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase text-slate-500">Tên hiển thị</label>
          <InputText v-model="form.name" placeholder="Nguyễn Văn A" class="rounded-xl" />
        </div>

        <div class="mt-4 flex justify-end gap-2 border-t border-slate-50 pt-6">
          <NuxtLink to="/admin/admins">
            <Button label="Hủy" text class="!text-slate-500" />
          </NuxtLink>
          <Button label="Tạo tài khoản" class="!rounded-xl px-8" :loading="loading" @click="submit" />
        </div>
      </div>
    </div>
  </div>
</template>
