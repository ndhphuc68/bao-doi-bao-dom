<script setup lang="ts">
definePageMeta({ middleware: ['require-auth'] })

const config = useRuntimeConfig()
const token = useCookie('auth_token')
const { data: profile } = await useFetch<{
  name?: string
  email?: string
  role?: string
  points?: number
}>('/auth/profile', {
  baseURL: config.public.apiBase as string,
  headers: { Authorization: `Bearer ${token.value}` }
})

type JwtPayload = Record<string, unknown>

function decodeJwt(token: string | null | undefined): JwtPayload | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length < 2) return null
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    )
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

function maskPhone(raw: string) {
  const digits = raw.replace(/\D/g, '')
  if (digits.length < 7) return '09x-xxx-xxxx'
  const a = digits.slice(0, 2) || '09'
  return `${a}x-xxx-xxxx`
}

const router = useRouter()
const payload = computed(() => decodeJwt(token.value))

function roleLabel(role?: string) {
  if (role === 'SUPER_ADMIN') return 'Admin tổng'
  if (role === 'STORE_ADMIN') return 'Admin cửa hàng'
  return 'Người dùng'
}

const displayName = computed(() => {
  if (profile.value?.name?.trim()) return profile.value.name.trim()
  const p = payload.value || {}
  const name = typeof p.name === 'string' ? p.name.trim() : ''
  const email = typeof p.email === 'string' ? p.email.trim() : ''
  return name || (email ? email.split('@')[0] : '') || 'Người dùng mới'
})

const displayRole = computed(() => roleLabel(profile.value?.role))

const displayPhone = computed(() => {
  const p = payload.value || {}
  const phone = typeof p.phone === 'string' ? p.phone.trim() : ''
  if (!phone) return '09x-xxx-xxxx'
  return maskPhone(phone)
})

function logout() {
  token.value = null
  router.push('/login')
}
</script>

<template>
  <div class="min-h-[100dvh] bg-slate-50 pb-28">
    <AppPageHeader title="Hồ sơ cá nhân" />

    <div class="px-5 pt-4">
      <div class="flex flex-col items-center text-center">
        <div class="relative">
          <div class="rounded-full bg-white p-1 shadow-sm ring-4 ring-emerald-500/35">
            <Avatar icon="pi pi-user" size="xlarge" shape="circle" class="!bg-emerald-50 !text-emerald-700" />
          </div>
          <div
            class="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md"
            aria-hidden="true"
          >
            <i class="pi pi-check text-xs" />
          </div>
        </div>

        <h2 class="mt-3 text-lg font-extrabold tracking-tight text-slate-900">{{ displayName }}</h2>
        <p class="mt-0.5 text-xs font-semibold text-slate-500">{{ displayPhone }}</p>
        <p class="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">
          {{ displayRole }}
        </p>
        <NuxtLink
          to="/rewards"
          class="mt-3 inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800 ring-1 ring-emerald-200/80 transition hover:bg-emerald-100"
        >
          <i class="pi pi-star-fill text-amber-500" aria-hidden="true" />
          <span>Điểm xanh: {{ profile?.points ?? '—' }}</span>
          <i class="pi pi-angle-right text-emerald-600/80" aria-hidden="true" />
        </NuxtLink>
      </div>

      <div class="mt-5 rounded-3xl bg-white p-2 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
        <p class="px-3 pb-2 pt-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          Tài khoản &amp; hoạt động
        </p>

        <NuxtLink
          to="/profile/edit"
          class="flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-slate-50 active:scale-[0.995]"
        >
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <i class="pi pi-pencil" aria-hidden="true" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-slate-900">Chỉnh sửa thông tin</p>
          </div>
          <i class="pi pi-angle-right text-slate-400" aria-hidden="true" />
        </NuxtLink>

        <NuxtLink
          to="/profile/history"
          class="flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-slate-50 active:scale-[0.995]"
        >
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <i class="pi pi-history" aria-hidden="true" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-slate-900">Lịch sử đóng góp</p>
            <p class="text-xs text-slate-400">Trống</p>
          </div>
          <i class="pi pi-angle-right text-slate-400" aria-hidden="true" />
        </NuxtLink>

        <NuxtLink
          to="/profile/returns"
          class="flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-slate-50 active:scale-[0.995]"
        >
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <i class="pi pi-list" aria-hidden="true" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-slate-900">Đơn hoàn trả của tôi</p>
            <p class="text-xs text-slate-400">Theo dõi trạng thái đơn đã đặt</p>
          </div>
          <i class="pi pi-angle-right text-slate-400" aria-hidden="true" />
        </NuxtLink>

        <NuxtLink
          to="/profile/badges"
          class="flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-slate-50 active:scale-[0.995]"
        >
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <i class="pi pi-trophy" aria-hidden="true" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-slate-900">Điểm thưởng &amp; Huy hiệu</p>
          </div>
          <i class="pi pi-angle-right text-slate-400" aria-hidden="true" />
        </NuxtLink>

        <NuxtLink
          to="/profile/support"
          class="flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-slate-50 active:scale-[0.995]"
        >
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <i class="pi pi-question-circle" aria-hidden="true" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-slate-900">Trung tâm hỗ trợ</p>
          </div>
          <i class="pi pi-angle-right text-slate-400" aria-hidden="true" />
        </NuxtLink>
      </div>

      <button
        type="button"
        class="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 shadow-sm active:opacity-95"
        @click="logout"
      >
        <i class="pi pi-sign-out" aria-hidden="true" />
        Đăng xuất
      </button>
    </div>

    <AppBottomNav />
  </div>
</template>
