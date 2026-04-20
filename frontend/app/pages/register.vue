<script setup>
import { computed, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { getApiErrorMessage } from '~/utils/api/errors'

definePageMeta({
  middleware: ['redirect-if-logged-in']
})

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const router = useRouter()
const { auth } = useApi()
const toast = useToast()

const canSubmit = computed(() => {
  if (!email.value.trim()) return false
  if (!password.value) return false
  if (password.value !== confirmPassword.value) return false
  return true
})

const handleRegister = async () => {
  if (!canSubmit.value) {
    if (!email.value.trim()) {
      toast.add({ severity: 'warn', summary: 'Thiếu thông tin', detail: 'Vui lòng nhập email.', life: 3000 })
      return
    }
    if (!password.value) {
      toast.add({ severity: 'warn', summary: 'Thiếu thông tin', detail: 'Vui lòng nhập mật khẩu.', life: 3000 })
      return
    }
    if (password.value !== confirmPassword.value) {
      toast.add({ severity: 'warn', summary: 'Chưa đúng', detail: 'Mật khẩu nhập lại không khớp.', life: 3000 })
      return
    }
    return
  }

  try {
    const res = await auth.register({
      email: email.value.trim(),
      password: password.value,
      name: name.value.trim() || undefined
    })
    const token = useCookie('auth_token')
    token.value = res.access_token
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đăng ký thành công!', life: 2500 })
    router.push('/home')
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Đăng ký thất bại', detail: getApiErrorMessage(err), life: 3500 })
  }
}
</script>

<template>
  <div class="relative flex w-full flex-col px-5 py-6 sm:px-7">
    <div
      class="pointer-events-none absolute left-0 top-0 h-28 w-28 rounded-full bg-emerald-100/80 blur-3xl"
      aria-hidden="true"
    />

    <div class="relative mb-5 flex justify-center">
      <div
        class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md"
      >
        <i class="pi pi-user-plus text-2xl" aria-hidden="true" />
      </div>
    </div>

    <div class="relative flex flex-col gap-5">
      <div>
        <h1 class="mb-1 text-center text-2xl font-bold tracking-tight text-slate-900">Tạo tài khoản</h1>
        <p class="text-center text-sm leading-snug text-slate-600">Đăng ký để bắt đầu hành trình tái chế.</p>
      </div>

      <div class="flex flex-col gap-4">
        <div>
          <label for="register-name" class="mb-2 block text-sm font-medium text-slate-800">Họ và tên (tuỳ chọn)</label>
          <IconField>
            <InputIcon class="pi pi-user !text-slate-400" />
            <InputText
              id="register-name"
              v-model="name"
              type="text"
              placeholder="Nguyễn Văn A"
              fluid
              class="rounded-2xl"
            />
          </IconField>
        </div>

        <div>
          <label for="register-email" class="mb-2 block text-sm font-medium text-slate-800">Email</label>
          <IconField>
            <InputIcon class="pi pi-envelope !text-slate-400" />
            <InputText
              id="register-email"
              v-model="email"
              type="email"
              placeholder="email@gmail.com"
              fluid
              class="rounded-2xl"
            />
          </IconField>
        </div>

        <div>
          <label for="register-pass" class="mb-2 block text-sm font-medium text-slate-800">Mật khẩu</label>
          <Password
            id="register-pass"
            v-model="password"
            placeholder="••••••••"
            :feedback="false"
            toggle-mask
            fluid
            input-class="rounded-2xl"
          />
        </div>

        <div>
          <label for="register-pass2" class="mb-2 block text-sm font-medium text-slate-800">Nhập lại mật khẩu</label>
          <Password
            id="register-pass2"
            v-model="confirmPassword"
            placeholder="••••••••"
            :feedback="false"
            toggle-mask
            fluid
            input-class="rounded-2xl"
          />
        </div>

        <Button label="Đăng ký" fluid rounded :disabled="!canSubmit" @click="handleRegister" />

        <p class="text-center text-sm text-slate-600">
          Đã có tài khoản?
          <NuxtLink to="/login" class="ml-1 font-semibold text-emerald-600 hover:underline">Đăng nhập</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

