<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
definePageMeta({ middleware: ['require-auth'] })

const route = useRoute()
const { wastePosts } = useApi()
const mediaUrl = useMediaUrl()

const postId = computed(() => String(route.params.id || ''))

const { data: post, pending, error } = await useAsyncData(
  () => `waste_post_${postId.value}`,
  () => wastePosts.get(postId.value),
  { watch: [postId] }
)
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col bg-slate-50">
    <AppPageHeader :title="t('home.news_title')" :back-to="localePath('/articles')" />

    <main class="flex-1 overflow-y-auto px-4 pb-28 pt-2">
      <div v-if="pending" class="py-12 text-center text-sm text-slate-500">{{ t('home.loading') }}</div>
      <article v-else-if="post" class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div v-if="post.imageUrl" class="mb-4 overflow-hidden rounded-xl">
          <img :src="mediaUrl(post.imageUrl)" :alt="post.title" class="max-h-56 w-full object-cover" />
        </div>
        <h1 class="mb-2 text-lg font-extrabold leading-snug text-slate-900">{{ post.title }}</h1>
        <p class="mb-4 text-xs text-slate-400">
          {{ new Date(post.createdAt).toLocaleString(t('common.vietnamese') === 'Tiếng Việt' ? 'vi-VN' : 'en-US') }}
        </p>
        <div class="prose prose-sm max-w-none text-sm leading-relaxed text-slate-700" v-html="post.body"></div>
      </article>
      <p v-else class="py-12 text-center text-sm text-rose-600">
        {{ error ? t('home.error_loading') : t('home.no_posts') }}
      </p>
    </main>

    <AppBottomNav />
  </div>
</template>
