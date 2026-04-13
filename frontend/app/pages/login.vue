<script setup>
import { ref } from 'vue'
import { getApiErrorMessage, isEmailAlreadyRegistered } from '~/utils/api/errors'

definePageMeta({
  middleware: ['require-onboarding']
})

const email = ref('demo@gmail.com')
const password = ref('password123')
const router = useRouter()
const { auth } = useApi()

const handleLogin = async () => {
  try {
    let res
    try {
      res = await auth.register({ email: email.value, password: password.value })
    } catch (e) {
      if (isEmailAlreadyRegistered(e)) {
        res = await auth.login({ email: email.value, password: password.value })
      } else {
        throw e
      }
    }

    const token = useCookie('auth_token')
    token.value = res.access_token
    alert('Đăng nhập thành công!')
    router.push('/home')
  } catch (err) {
    alert(getApiErrorMessage(err))
  }
}
</script>

<template>
  <div class="relative flex w-full flex-col px-5 py-6 sm:px-7">
    <div
      class="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-emerald-100/80 blur-3xl"
      aria-hidden="true"
    />

    <div class="relative mb-5 flex justify-center">
      <div
        class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md"
      >
        <i class="pi pi-sync text-2xl" aria-hidden="true" />
      </div>
    </div>

    <div class="relative flex flex-col gap-5">
      <div>
        <h1 class="mb-1 text-center text-2xl font-bold tracking-tight text-slate-900">Chào mừng bạn</h1>
        <p class="text-center text-sm leading-snug text-slate-600">Đăng nhập để tiếp tục hành trình tái chế.</p>
      </div>

      <div class="flex flex-col gap-4">
        <div>
          <label for="login-email" class="mb-2 block text-sm font-medium text-slate-800">Số điện thoại hoặc Email</label>
          <IconField>
            <InputIcon class="pi pi-envelope !text-slate-400" />
            <InputText
              id="login-email"
              v-model="email"
              type="email"
              placeholder="email@gmail.com"
              fluid
              class="rounded-2xl"
            />
          </IconField>
        </div>

        <div>
          <label for="login-pass" class="mb-2 block text-sm font-medium text-slate-800">Mật khẩu</label>
          <Password
            id="login-pass"
            v-model="password"
            placeholder="••••••••"
            :feedback="false"
            toggle-mask
            fluid
            input-class="rounded-2xl"
          />
          <div class="mt-2 flex justify-end">
            <Button label="Quên mật khẩu?" link class="!p-0 !text-xs" severity="secondary" />
          </div>
        </div>

        <Button label="Đăng nhập" fluid rounded @click="handleLogin" />

        <p class="text-center text-sm text-slate-600">
          Chưa có tài khoản?
          <span class="ml-1 font-semibold text-emerald-600">Đăng ký ngay</span>
        </p>

        <Divider align="center" type="solid">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Hoặc</span>
        </Divider>

        <div class="flex flex-col gap-2.5">
          <Button type="button" outlined severity="secondary" fluid rounded class="!border-slate-200">
            <Icon name="simple-icons:google" class="mr-2 h-5 w-5" />
            Tiếp tục với Google
          </Button>
          <Button type="button" severity="contrast" fluid rounded>
            <Icon name="simple-icons:apple" class="mr-2 h-5 w-5" />
            Tiếp tục với Apple
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
