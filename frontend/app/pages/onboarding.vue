<script setup>
const router = useRouter()

const onboardingDone = useCookie('eco_onboarding_done', {
  maxAge: 60 * 60 * 24 * 365,
  path: '/',
  sameSite: 'lax'
})

const slides = [
  {
    title: 'Giảm rác thải điện tử',
    body: 'Tái chế đúng cách giúp giảm ô nhiễm và bảo vệ tài nguyên cho thế hệ sau.',
    icon: 'heroicons:globe-alt'
  },
  {
    title: 'Tìm điểm thu gom gần bạn',
    body: 'Bản đồ và danh sách điểm thu được cập nhật, dễ chọn nơi phù hợp nhất.',
    icon: 'heroicons:map-pin'
  },
  {
    title: 'Tích điểm đổi quà',
    body: 'Mỗi thiết bị hoàn trả đều được ghi nhận — đổi quà xanh và ưu đãi từ đối tác.',
    icon: 'heroicons:gift'
  }
]

const step = ref(1)
const total = slides.length

const current = computed(() => slides[step.value - 1])

function next() {
  if (step.value < total) {
    step.value += 1
  } else {
    onboardingDone.value = '1'
    router.push('/login')
  }
}

function skip() {
  onboardingDone.value = '1'
  router.push('/login')
}
</script>

<template>
  <div class="relative flex min-h-full flex-col px-6 py-8 sm:px-10 sm:py-12">
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-emerald-100/50 to-transparent"
      aria-hidden="true"
    />

    <div class="relative mx-auto w-full max-w-lg flex-1">
      <div class="mb-8 flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-400"
          >{{ step }}/{{ total }}</span
        >
        <Button label="Bỏ qua" link class="!p-0 !text-sm" @click="skip" />
      </div>

      <div class="mb-10 flex justify-center">
        <div
          class="flex h-28 w-28 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-emerald-500 to-teal-600 p-[2px] shadow-lg shadow-emerald-500/20 sm:h-32 sm:w-32"
        >
          <div class="flex h-full w-full flex-col items-center justify-center rounded-[1.6rem] bg-white">
            <Icon :name="current.icon" class="h-14 w-14 text-emerald-600 sm:h-16 sm:w-16" />
          </div>
        </div>
      </div>

      <h1 class="mb-3 text-center text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        {{ current.title }}
      </h1>
      <p class="mx-auto mb-10 max-w-md text-center text-sm leading-relaxed text-slate-600 sm:text-base">
        {{ current.body }}
      </p>

      <div class="mb-8 flex justify-center gap-2">
        <span
          v-for="s in total"
          :key="s"
          class="h-2 rounded-full transition-all"
          :class="s === step ? 'w-8 bg-emerald-600' : 'w-2 bg-slate-200'"
        />
      </div>
    </div>

    <div class="relative mx-auto mt-auto w-full max-w-lg pb-2">
      <Button
        :label="step < total ? 'Tiếp theo' : 'Đăng nhập hoặc bắt đầu'"
        fluid
        rounded
        size="large"
        icon="pi pi-arrow-right"
        icon-pos="right"
        @click="next"
      />
    </div>
  </div>
</template>
