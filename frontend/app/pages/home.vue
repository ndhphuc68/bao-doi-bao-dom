<script setup>
definePageMeta({
  middleware: ['require-auth']
})

const router = useRouter()

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h >= 5 && h < 11) return 'Chào buổi sáng'
  if (h >= 11 && h < 13) return 'Chào buổi trưa'
  if (h >= 13 && h < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
})

const shortcuts = [
  {
    label: 'Tìm điểm thu gom',
    icon: 'pi pi-map-marker',
    to: '/recycle/step-4'
  },
  {
    label: 'Hoàn trả thiết bị',
    icon: 'pi pi-sync',
    to: '/recycle/step-1'
  },
  {
    label: 'Thiết bị hỗ trợ',
    icon: 'pi pi-desktop',
    to: '/devices'
  },
  {
    label: 'Điểm thưởng',
    icon: 'pi pi-star',
    to: '/rewards'
  }
]

const articles = [
  {
    title: 'Tác hại của rác thải điện tử',
    excerpt: 'Rác điện tử chứa chất độc hại — xử lý đúng cách giúp bảo vệ sức khỏe và môi trường.',
    thumbClass: 'from-emerald-600/90 to-teal-800'
  },
  {
    title: 'Rác thải điện tử là gì?',
    excerpt: 'Điện thoại cũ, pin, thiết bị gia dụng hết hạn… đều được xếp vào nhóm này.',
    thumbClass: 'from-slate-600 to-slate-800'
  }
]

function joinCampaign() {
  router.push('/recycle/step-1')
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col bg-slate-50">
    <!-- Header -->
    <header class="sticky top-0 z-20 flex items-center justify-between bg-white/95 px-4 py-3 backdrop-blur-md">
      <div class="flex min-w-0 items-center gap-3">
        <Avatar
          icon="pi pi-user"
          shape="circle"
          size="large"
          class="!h-12 !w-12 !bg-emerald-100 !text-emerald-700"
        />
        <div class="min-w-0">
          <p class="truncate text-sm font-bold leading-tight text-slate-900">
            {{ greeting }}, Chào bạn!
          </p>
          <p class="text-xs text-slate-500">Eco · Đà Nẵng</p>
        </div>
      </div>
      <Button icon="pi pi-bell" rounded text severity="secondary" aria-label="Thông báo" />
    </header>

    <main class="flex-1 overflow-y-auto px-4 pb-28 pt-2">
      <!-- Hero -->
      <div
        class="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 px-5 py-7 text-white shadow-lg shadow-emerald-900/20"
      >
        <div
          class="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl"
        />
        <div
          class="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-teal-400/15 blur-3xl"
        />
        <div
          class="pointer-events-none absolute inset-0 opacity-[0.12] bg-[radial-gradient(circle_at_30%_20%,#fff_0%,transparent_50%)]"
        />

        <span
          class="mb-3 inline-block rounded-full bg-emerald-400/25 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-50 ring-1 ring-white/20"
        >
          Chiến dịch mới
        </span>
        <h2 class="mb-5 max-w-[95%] text-xl font-extrabold leading-snug tracking-tight">
          Cùng nhau giảm rác thải điện tử tại Đà Nẵng.
        </h2>
        <Button
          label="Tham gia ngay"
          rounded
          class="!border-0 !bg-white/15 !text-white backdrop-blur-sm hover:!bg-white/25"
          @click="joinCampaign"
        />
      </div>

      <!-- Lối tắt -->
      <div class="mb-6">
        <h3 class="mb-3 text-base font-bold text-slate-900">Lối tắt nhanh</h3>
        <div class="grid grid-cols-2 gap-3">
          <NuxtLink
            v-for="item in shortcuts"
            :key="item.to"
            :to="item.to"
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

      <!-- Tin tức -->
      <div class="mb-4">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-base font-bold text-slate-900">Thông tin rác thải điện tử</h3>
          <button type="button" class="text-xs font-semibold text-emerald-600">Xem tất cả</button>
        </div>
        <div class="space-y-3">
          <article
            v-for="(a, i) in articles"
            :key="i"
            class="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
          >
            <div
              class="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br shadow-inner"
              :class="a.thumbClass"
            />
            <div class="min-w-0 flex-1 py-0.5">
              <h4 class="mb-1 line-clamp-2 text-sm font-bold leading-snug text-slate-900">
                {{ a.title }}
              </h4>
              <p class="line-clamp-2 text-xs leading-relaxed text-slate-600">
                {{ a.excerpt }}
              </p>
            </div>
          </article>
        </div>
      </div>
    </main>

    <AppBottomNav />
  </div>
</template>
