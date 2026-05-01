<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { getApiErrorMessage } from '~/utils/api/errors'

const email = ref('demo@gmail.com')
const password = ref('password123')
const router = useRouter()
const toast = useToast()
const { apiFetch } = useApi()

useHead({
  title: 'Eco Admin - Đăng nhập'
})

const handleLogin = async () => {
  try {
    const res = await apiFetch<{ access_token: string }>('/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })

    const token = useCookie('admin_auth_token')
    token.value = res.access_token
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đăng nhập thành công!', life: 2500 })
    router.push('/admin')
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Đăng nhập thất bại', detail: getApiErrorMessage(err), life: 3500 })
  }
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-md flex-col gap-5 px-6 py-10">
    <div class="text-center">
      <div
        class="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white p-2 shadow-sm ring-1 ring-slate-200/50"
      >
        <img src="/logo_splash.png" alt="Eco Logo" class="h-full w-full object-contain" />
      </div>
      <h1 class="text-2xl font-bold tracking-tight">Eco Admin</h1>
      <p class="mt-1 text-sm text-slate-600">Đăng nhập để vào trang quản trị.</p>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex flex-col gap-4">
        <div>
          <label for="admin-login-email" class="mb-2 block text-sm font-medium text-slate-800">Email</label>
          <IconField>
            <InputIcon class="pi pi-envelope !text-slate-400" />
            <InputText
              id="admin-login-email"
              v-model="email"
              type="email"
              placeholder="email@gmail.com"
              fluid
              class="rounded-2xl"
            />
          </IconField>
        </div>

        <div>
          <label for="admin-login-pass" class="mb-2 block text-sm font-medium text-slate-800">Mật khẩu</label>
          <Password
            id="admin-login-pass"
            v-model="password"
            placeholder="••••••••"
            :feedback="false"
            toggle-mask
            fluid
            input-class="rounded-2xl"
          />
        </div>

        <Button label="Đăng nhập" fluid rounded @click="handleLogin" />
      </div>
    </div>
  </div>
</template>
