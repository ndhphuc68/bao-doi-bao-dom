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
        <div v-if="post.imageUrl" class="mb-6 overflow-hidden rounded-xl shadow-sm">
          <img :src="mediaUrl(post.imageUrl)" :alt="post.title" class="h-64 w-full object-cover md:h-[32rem]" />
        </div>
        <h1 class="mb-2 text-2xl font-extrabold leading-tight text-slate-900">{{ post.title }}</h1>
        <p class="mb-4 text-xs text-slate-400 text-opacity-80 font-medium">
          {{ new Date(post.createdAt).toLocaleString(t('common.vietnamese') === 'Tiếng Việt' ? 'vi-VN' : 'en-US') }}
        </p>
        <div class="article-content max-w-none text-base leading-relaxed text-slate-700" v-html="post.body"></div>
      </article>
      <p v-else class="py-12 text-center text-sm text-rose-600">
        {{ error ? t('home.error_loading') : t('home.no_posts') }}
      </p>
    </main>

    <AppBottomNav />
  </div>
</template>

<style scoped>
.article-content :deep(p) {
  margin-bottom: 1rem;
}
.article-content :deep(strong) {
  font-weight: 700;
  color: #0f172a;
}
.article-content :deep(ul), .article-content :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 1.25rem;
}
.article-content :deep(ul) {
  list-style-type: disc;
}
.article-content :deep(ol) {
  list-style-type: decimal;
}
.article-content :deep(li) {
  margin-bottom: 0.25rem;
}
.article-content :deep(h1), .article-content :deep(h2), .article-content :deep(h3) {
  font-weight: 800;
  color: #0f172a;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  line-height: 1.3;
}
.article-content :deep(h1) {
  font-size: 1.5rem;
}
.article-content :deep(h2) {
  font-size: 1.25rem;
}
.article-content :deep(h3) {
  font-size: 1.125rem;
}
.article-content :deep(img) {
  border-radius: 0.75rem;
  margin: 1.5rem 0;
}
</style>
