<script setup lang="ts">
const config = useRuntimeConfig()
const token = useCookie('auth_token')
const router = useRouter()
const route = useRoute()

const { data: profile } = await useFetch<{
  name?: string
  points?: number
}>('/auth/profile', {
  key: 'auth_profile',
  baseURL: config.public.apiBase as string,
  headers: { Authorization: `Bearer ${token.value}` }
})

const { data: unreadCount } = await useAsyncData('desktop_unread_notifications', () => 
  token.value ? useApi().notifications.unreadCount(token.value) : Promise.resolve(0)
)

const navLinks = [
  { to: '/home', label: 'Trang chủ', icon: 'pi pi-home' },
  { to: '/recycle', label: 'Hoàn trả', icon: 'pi pi-sync' },
  { to: '/community', label: 'Cộng đồng', icon: 'pi pi-users' },
  { to: '/rewards', label: 'Ưu đãi', icon: 'pi pi-gift' },
  { to: '/profile', label: 'Hồ sơ', icon: 'pi pi-user' }
]

function isActive(path: string) {
  if (path === '/home') return route.path === '/home'
  if (path === '/recycle') return route.path === '/recycle' || route.path.startsWith('/recycle/')
  return route.path === path
}

function logout() {
  token.value = null
  router.push('/login')
}
</script>

<template>
  <header class="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-xl">
    <div class="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
      <!-- Logo & Branding -->
      <NuxtLink to="/home" class="flex items-center gap-3 group">
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200 transition-transform group-hover:scale-105">
          <img src="/logo_splash.png" alt="Eco Logo" class="h-full w-full object-contain" />
        </div>
        <div class="flex flex-col">
          <span class="text-xl font-black leading-none tracking-tighter text-emerald-600 sm:block">Eco</span>
          <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tái chế</span>
        </div>
      </NuxtLink>

      <!-- Navigation Links -->
      <nav class="hidden items-center gap-1 md:flex lg:gap-2">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all"
          :class="
            isActive(link.to)
              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
              : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-600'
          "
        >
          <i :class="[link.icon, 'text-base']" />
          <span>{{ link.label }}</span>
        </NuxtLink>
      </nav>

      <!-- User Actions -->
      <div class="flex items-center gap-3 lg:gap-5">
        <div class="hidden items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 ring-1 ring-emerald-100 sm:flex">
          <i class="pi pi-star-fill text-amber-500" />
          <span class="text-sm font-bold text-emerald-800">{{ profile?.points ?? 0 }} <span class="hidden lg:inline">điểm</span></span>
        </div>

        <div class="relative">
          <Button
            icon="pi pi-bell"
            rounded
            text
            severity="secondary"
            class="!h-10 !w-10"
            @click="router.push('/notifications')"
          />
          <div
            v-if="unreadCount > 0"
            class="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white"
          >
            {{ unreadCount > 99 ? '99+' : unreadCount }}
          </div>
        </div>

        <div class="h-8 w-px bg-slate-200" />

        <Button
          icon="pi pi-sign-out"
          label="Đăng xuất"
          severity="secondary"
          text
          class="!hidden !text-xs !font-bold lg:!flex"
          @click="logout"
        />
        <Button
          icon="pi pi-sign-out"
          severity="secondary"
          text
          rounded
          class="!h-10 !w-10 lg:!hidden"
          @click="logout"
        />
      </div>
    </div>
  </header>
</template>
