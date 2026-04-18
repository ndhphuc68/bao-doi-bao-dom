<script setup lang="ts">
definePageMeta({ middleware: ['require-auth'] })

const { wastePosts } = useApi()
const mediaUrl = useMediaUrl()

const thumbClasses = [
  'from-emerald-600/90 to-teal-800',
  'from-slate-600 to-slate-800',
  'from-sky-600 to-indigo-900',
  'from-amber-500 to-orange-800'
]

function excerptFromBody(body: string, max = 160) {
  const t = body.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  return `${t.slice(0, max).trimEnd()}…`
}

const { data: posts, pending, error, refresh } = await useAsyncData('waste_posts_all', () => wastePosts.list())
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col bg-slate-50">
    <AppPageHeader title="Thông tin rác thải điện tử" back-to="/home" />

    <main class="flex-1 overflow-y-auto px-4 pb-28 pt-2">
      <p v-if="pending" class="py-8 text-center text-sm text-slate-500">Đang tải…</p>
      <p v-else-if="error" class="py-8 text-center text-sm text-rose-600">Không tải được bài viết. Thử lại sau.</p>
      <p v-else-if="!posts?.length" class="py-8 text-center text-sm text-slate-500">
        Chưa có bài viết nào. Admin sẽ cập nhật nội dung sớm.
      </p>
      <div v-else class="space-y-3">
        <NuxtLink
          v-for="(a, i) in posts"
          :key="a.id"
          :to="`/articles/${a.id}`"
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
            <h4 class="mb-1 line-clamp-2 text-sm font-bold leading-snug text-slate-900">
              {{ a.title }}
            </h4>
            <p class="line-clamp-3 text-xs leading-relaxed text-slate-600">
              {{ excerptFromBody(a.body) }}
            </p>
          </div>
        </NuxtLink>
      </div>

      <div class="mt-6 flex justify-center">
        <Button label="Tải lại" text size="small" @click="refresh" />
      </div>
    </main>

    <AppBottomNav />
  </div>
</template>
