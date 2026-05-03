<script setup>
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { getApiErrorMessage } from '~/utils/api/errors'

const { t } = useI18n()
const localePath = useLocalePath()

definePageMeta({
  middleware: ['redirect-if-logged-in']
})
useHead({ title: t('login.title') })

const email = ref('')
const password = ref('')
const router = useRouter()
const { auth } = useApi()
const toast = useToast()

const handleLogin = async () => {
  try {
    const res = await auth.login({ email: email.value, password: password.value })

    const token = useCookie('auth_token')
    token.value = res.access_token
    toast.add({ severity: 'success', summary: t('common.vietnamese') === 'Tiếng Việt' ? 'Thành công' : 'Success', detail: t('login.success'), life: 2500 })
    router.push(localePath('/home'))
  } catch (err) {
    toast.add({ severity: 'error', summary: t('login.fail'), detail: getApiErrorMessage(err), life: 3500 })
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
        <h2 class="mb-4 text-4xl font-black tracking-tight lg:text-5xl">{{ t('login.hero_title') }}</h2>
        <p class="max-w-md text-lg font-medium text-emerald-50/80">
          {{ t('login.hero_subtitle') }}
        </p>
        
        <div class="mt-12 grid grid-cols-2 gap-12">
          <div class="text-left">
            <p class="text-4xl font-black text-emerald-400">1.2k+</p>
            <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-100/60">{{ t('login.stat_devices') }}</p>
          </div>
          <div class="text-left">
            <p class="text-4xl font-black text-emerald-400">500kg</p>
            <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-100/60">{{ t('login.stat_co2') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side: Form -->
    <div class="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 md:bg-slate-50">
      <div class="w-full max-w-md space-y-8 rounded-3xl bg-white p-2 md:p-10 md:shadow-[0_20px_60px_-15px_rgba(15,23,42,0.1)] md:ring-1 md:ring-slate-200/50">
        <!-- Mobile Logo -->
        <div class="md:hidden flex justify-center mb-8">
          <div class="p-4 rounded-3xl bg-slate-50 ring-1 ring-slate-100">
            <img src="/logo_splash.png" alt="Eco Logo" class="h-20 w-20 object-contain" />
          </div>
        </div>

        <div class="text-center md:text-left">
          <h1 class="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">{{ t('login.title') }}</h1>
          <p class="mt-2 text-sm font-medium text-slate-500">{{ t('login.subtitle') }}</p>
        </div>

        <div class="space-y-6">
          <div class="space-y-2">
            <label for="login-email" class="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 px-1">{{ t('login.email_label') }}</label>
            <IconField>
              <InputIcon class="pi pi-envelope !text-slate-400" />
              <InputText
                id="login-email"
                v-model="email"
                type="email"
                :placeholder="t('login.email_placeholder')"
                fluid
                class="!rounded-2xl !py-4 !pl-12 !border-slate-100 !bg-slate-50/50 hover:!bg-white focus:!bg-white focus:!ring-emerald-500/20"
              />
            </IconField>
          </div>

          <div class="space-y-2">
            <label for="login-pass" class="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 px-1">{{ t('login.password_label') }}</label>
            <Password
              id="login-pass"
              v-model="password"
              placeholder="••••••••"
              :feedback="false"
              toggle-mask
              fluid
              input-class="!rounded-2xl !py-4 !border-slate-100 !bg-slate-50/50 hover:!bg-white focus:!bg-white"
            />
            <div class="flex justify-end pt-1">
              <Button :label="t('login.forgot_password')" link class="!p-0 !text-xs !font-bold !text-slate-400 hover:!text-emerald-600" severity="secondary" />
            </div>
          </div>

          <div class="pt-2">
            <Button
              :label="t('login.submit')"
              fluid
              rounded
              class="!py-4 !text-base !font-black shadow-xl shadow-emerald-500/20"
              @click="handleLogin"
            />
          </div>

          <div class="relative py-4">
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
              <div class="w-full border-t border-slate-100"></div>
            </div>
            <div class="relative flex justify-center text-xs font-black uppercase tracking-widest">
              <span class="bg-white px-4 text-slate-300">{{ t('login.or_join') }}</span>
            </div>
          </div>

          <p class="text-center text-sm font-medium text-slate-500">
            {{ t('login.new_to_eco') }}
            <NuxtLink :to="localePath('/register')" class="ml-1 font-black text-emerald-600 hover:underline">{{ t('login.register_now') }}</NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
