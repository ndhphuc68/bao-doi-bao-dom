<script setup>
import { computed, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { getApiErrorMessage } from '~/utils/api/errors'

definePageMeta({
  middleware: ['redirect-if-logged-in']
})
useHead({ title: 'Đăng ký tài khoản' })

const name = ref('')
const phone = ref('')
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
      name: name.value.trim() || undefined,
      phoneNumber: phone.value.trim() || undefined
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
  <div class="flex min-h-[100dvh] w-full flex-col md:flex-row">
    <!-- Left Side: PC Illustration & Branding -->
    <div class="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-slate-900 md:flex">
      <div class="absolute inset-0 z-0">
        <img src="/banner_campaign.png" class="h-full w-full object-cover opacity-40 brightness-50" alt="Eco Background" />
        <div class="absolute inset-0 bg-gradient-to-br from-emerald-600/80 via-slate-900/90 to-slate-950"></div>
      </div>
      
      <div class="relative z-10 flex flex-col items-center px-12 text-center text-white">
        <div class="mb-8 rounded-3xl bg-white p-5 shadow-2xl shadow-emerald-500/20 transition-transform hover:scale-105">
          <img src="/logo_splash.png" alt="Eco Logo" class="h-24 w-24 object-contain" />
        </div>
        <h2 class="mb-4 text-4xl font-black tracking-tight lg:text-5xl">Bắt đầu hành trình của bạn.</h2>
        <p class="max-w-md text-lg font-medium text-emerald-50/80">
          Trở thành một phần của mạng lưới tái chế rác thải điện tử lớn nhất miền Trung và bắt đầu tích điểm ngay hôm nay.
        </p>
        
        <div class="mt-12 flex items-center gap-4 rounded-2xl bg-white/10 p-6 backdrop-blur-md">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">
            <i class="pi pi-gift text-xl"></i>
          </div>
          <div class="text-left">
            <p class="text-sm font-black text-white">Quà tặng đặc biệt</p>
            <p class="text-xs text-emerald-100/70">Nhận ngay 400 điểm thưởng khi đăng ký thành công.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side: Form -->
    <div class="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 md:bg-slate-50">
      <div class="w-full max-w-md space-y-6 rounded-3xl bg-white p-2 md:p-10 md:shadow-[0_20px_60px_-15px_rgba(15,23,42,0.1)] md:ring-1 md:ring-slate-200/50">
        <!-- Mobile Logo -->
        <div class="md:hidden flex justify-center mb-6">
          <div class="p-3 rounded-2xl bg-slate-50 ring-1 ring-slate-100">
            <img src="/logo_splash.png" alt="Eco Logo" class="h-14 w-14 object-contain" />
          </div>
        </div>

        <div class="text-center md:text-left">
          <h1 class="text-3xl font-black tracking-tight text-slate-900">Tạo tài khoản</h1>
          <p class="mt-2 text-sm font-medium text-slate-500">Tham gia cùng hàng ngàn Eco-ers bảo vệ môi trường.</p>
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label for="register-name" class="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Họ tên</label>
              <InputText
                id="register-name"
                v-model="name"
                type="text"
                placeholder="Nguyễn Văn A"
                fluid
                class="!rounded-2xl !py-3 !border-slate-100 !bg-slate-50/50 hover:!bg-white focus:!bg-white"
              />
            </div>
            <div class="space-y-1.5">
              <label for="register-phone" class="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Số điện thoại</label>
              <InputText
                id="register-phone"
                v-model="phone"
                type="tel"
                placeholder="0912345678"
                fluid
                class="!rounded-2xl !py-3 !border-slate-100 !bg-slate-50/50 hover:!bg-white focus:!bg-white"
              />
            </div>
          </div>

          <div class="space-y-1.5">
            <label for="register-email" class="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Email</label>
            <InputText
              id="register-email"
              v-model="email"
              type="email"
              placeholder="example@gmail.com"
              fluid
              class="!rounded-2xl !py-3 !border-slate-100 !bg-slate-50/50 hover:!bg-white focus:!bg-white"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label for="register-pass" class="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Mật khẩu</label>
              <Password
                id="register-pass"
                v-model="password"
                placeholder="••••••••"
                :feedback="false"
                toggle-mask
                fluid
                input-class="!rounded-2xl !py-3 !border-slate-100 !bg-slate-50/50"
              />
            </div>
            <div class="space-y-1.5">
              <label for="register-pass2" class="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Xác nhận</label>
              <Password
                id="register-pass2"
                v-model="confirmPassword"
                placeholder="••••••••"
                :feedback="false"
                toggle-mask
                fluid
                input-class="!rounded-2xl !py-3 !border-slate-100 !bg-slate-50/50"
              />
            </div>
          </div>

          <div class="pt-4">
            <Button
              label="Đăng ký ngay"
              fluid
              rounded
              :disabled="!canSubmit"
              class="!py-4 !text-base !font-black shadow-xl shadow-emerald-500/20"
              @click="handleRegister"
            />
          </div>

          <p class="text-center text-sm font-medium text-slate-500">
            Đã có tài khoản?
            <NuxtLink to="/login" class="ml-1 font-black text-emerald-600 hover:underline">Đăng nhập</NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
