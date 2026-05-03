<script setup lang="ts">
const localePath = useLocalePath()
const route = useRoute()

const { t } = useI18n()

const tabs = computed(() => [
  { to: '/home', label: t('nav.home'), icon: 'pi pi-home' },
  { to: '/recycle', label: t('nav.recycle'), icon: 'pi pi-sync' },
  { to: '/community', label: t('nav.community'), icon: 'pi pi-users' },
  { to: '/rewards', label: t('nav.rewards'), icon: 'pi pi-gift' },
  { to: '/profile', label: t('nav.profile'), icon: 'pi pi-user' }
])

function isActive(path: string) {
  const p = localePath(path)
  // For home, also match root path
  if (path === '/home') return route.path === p || route.path === localePath('/')
  if (path === '/recycle') return route.path === p || route.path.startsWith(p + '/')
  return route.path === p
}
</script>

<template>
  <nav
    class="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-slate-200/90 bg-white/95 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pt-2 shadow-[0_-8px_30px_rgba(15,23,42,0.06)] backdrop-blur-md md:hidden"
    aria-label="Điều hướng chính"
  >
    <div class="flex items-end justify-around px-1">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="localePath(tab.to)"
        class="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold transition-colors sm:text-[11px]"
        :class="
          isActive(tab.to)
            ? 'text-emerald-600'
            : 'text-slate-400 hover:text-slate-600'
        "
      >
        <i
          :class="[tab.icon, 'text-lg sm:text-xl', isActive(tab.to) ? 'text-emerald-600' : '']"
          aria-hidden="true"
        />
        <span class="truncate">{{ tab.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>
