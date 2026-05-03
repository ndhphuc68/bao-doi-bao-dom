<script setup lang="ts">
const localePath = useLocalePath()
definePageMeta({
  middleware: ['require-auth']
})

const router = useRouter()
const { wastePosts } = useApi()
const mediaUrl = useMediaUrl()

const { t } = useI18n()
useHead({
  title: t('nav.home')
})

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h >= 5 && h < 11) return t('home.greeting_morning')
  if (h >= 11 && h < 13) return t('home.greeting_noon')
  if (h >= 13 && h < 18) return t('home.greeting_afternoon')
  return t('home.greeting_evening')
})

const shortcuts = computed(() => [
  {
    label: t('home.shortcut_find_points'),
    icon: 'pi pi-map-marker',
    to: '/map'
  },
  {
    label: t('home.shortcut_recycle'),
    icon: 'pi pi-sync',
    to: '/recycle'
  },
  {
    label: t('home.shortcut_devices'),
    icon: 'pi pi-desktop',
    to: '/devices'
  },
  {
    label: t('home.shortcut_rewards'),
    icon: 'pi pi-star',
    to: '/rewards'
  }
])

const thumbClasses = [
  'from-emerald-600/90 to-teal-800',
  'from-slate-600 to-slate-800',
  'from-sky-600 to-indigo-900',
  'from-amber-500 to-orange-800'
]

function excerptFromBody(body: string, max = 120) {
  if (!body) return ''
  // 1. Strip HTML tags
  let cleanText = body.replace(/<[^>]*>?/gm, '')
  // 2. Decode common HTML entities
  cleanText = cleanText
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
  
  const t = cleanText.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  return `${t.slice(0, max).trimEnd()}…`
}

const { data: posts, pending: postsPending } = await useAsyncData('waste_posts_home', () => wastePosts.list())

const { data: unreadCount } = await useAsyncData('unread_notifications_count', () => 
  useCookie('auth_token').value ? useApi().notifications.unreadCount(useCookie('auth_token').value!) : Promise.resolve(0)
)

const homeArticles = computed(() => (posts.value || []).slice(0, 4))

function joinCampaign() {
  router.push(localePath('/recycle'))
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col bg-slate-50">
    <!-- Header -->
    <!-- Mobile Header: Hide on md -->
    <header class="sticky top-0 z-20 flex items-center justify-between bg-white/95 px-4 py-3 backdrop-blur-md md:hidden">
      <div class="flex min-w-0 items-center gap-3">
        <Avatar
          image="/logo_splash.png"
          shape="circle"
          size="large"
          class="!h-12 !w-12 border border-slate-100 bg-white"
        />
        <div class="min-w-0">
          <p class="truncate text-sm font-bold leading-tight text-slate-900">
            {{ greeting }}, {{ t('home.welcome_user') }}
          </p>
          <p class="text-xs text-slate-500">Eco · Đà Nẵng</p>
        </div>
      </div>
      <div class="relative">
        <Button 
          icon="pi pi-bell" 
          rounded 
          text 
          severity="secondary" 
          aria-label="Thông báo" 
          @click="router.push(localePath('/notifications'))"
        />
        <div 
          v-if="unreadCount > 0"
          class="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </div>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto px-4 pb-28 pt-2">
      <!-- Hero -->
      <div
        class="relative mb-6 overflow-hidden rounded-3xl bg-slate-900 px-5 py-7 text-white shadow-lg shadow-emerald-900/20"
      >
        <!-- Background Image -->
        <div class="absolute inset-0 z-0">
          <img src="/banner_campaign.png" alt="Campaign Banner" class="h-full w-full object-cover opacity-70" />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent"></div>
        </div>

        <!-- Content -->
        <div class="relative z-10">
          <span
            class="mb-3 inline-block rounded-full bg-emerald-400/25 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-50 ring-1 ring-white/20"
          >
            {{ t('home.hero_badge') }}
          </span>
          <h2 class="mb-5 max-w-[95%] text-xl font-extrabold leading-snug tracking-tight">
            {{ t('home.hero_title') }}
          </h2>
          <Button
            :label="t('home.hero_button')"
            rounded
            class="!border-0 !bg-white/20 !text-white backdrop-blur-md hover:!bg-white/30"
            @click="joinCampaign"
          />
        </div>
      </div>

      <div class="mb-6">
        <h3 class="mb-3 text-base font-bold text-slate-900">{{ t('home.shortcuts_title') }}</h3>
        <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
          <NuxtLink
            v-for="item in shortcuts"
            :key="item.to"
            :to="localePath(item.to)"
            v-ripple
            class="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm transition active:scale-[0.98]"
          >
            <div
              class="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"
            >
              <i :class="[item.icon, 'text-xl']" />
            </div>
            <span class="text-xs font-semibold leading-snug text-slate-800">{{ item.label }}</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Tin tức từ admin -->
      <div class="mb-4">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-base font-bold text-slate-900">{{ t('home.news_title') }}</h3>
          <NuxtLink :to="localePath('/articles')" class="text-xs font-semibold text-emerald-600"> {{ t('home.view_all') }} </NuxtLink>
        </div>

        <p v-if="postsPending" class="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
          {{ t('home.loading') }}
        </p>
        <p v-else-if="!homeArticles.length" class="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
          {{ t('home.no_posts') }}
        </p>
        <div v-else class="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
          <NuxtLink
            v-for="(a, i) in homeArticles"
            :key="a.id"
            :to="localePath(`/articles/${a.id}`)"
            class="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition active:scale-[0.99]"
          >
            <div class="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 shadow-inner">
              <img
                v-if="a.imageUrl"
                :src="mediaUrl(a.imageUrl)"
                :alt="a.title"
                class="h-full w-full object-cover"
              />
              <div v-else class="h-full w-full bg-gradient-to-br" :class="thumbClasses[i % thumbClasses.length]" />
            </div>
            <div class="min-w-0 flex-1 py-0.5">
              <h4 class="mb-1 line-clamp-2 text-sm font-extrabold leading-snug text-slate-900">
                {{ a.title }}
              </h4>
              <p class="text-[10px] font-medium text-slate-400">
                <i class="pi pi-calendar mr-1 text-[9px]" />
                {{ new Date(a.createdAt).toLocaleDateString(t('common.vietnamese') === 'Tiếng Việt' ? 'vi-VN' : 'en-US') }}
              </p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </main>

    <AppBottomNav />
  </div>
</template>
