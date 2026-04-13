<script setup>
const router = useRouter()
const store = useRecycleStore()

let timer

onMounted(() => {
  timer = setTimeout(() => {
    if (!store.trackingCode) {
      router.replace('/recycle/step-5')
      return
    }
    router.replace('/recycle/success')
  }, 1600)
})

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <div class="flex min-h-[50vh] flex-col items-center justify-center bg-white px-6 py-16 text-center">
    <ProgressSpinner class="mb-8 !h-16 !w-16" stroke-width="4" animation-duration=".8s" />
    <h1 class="mb-2 text-xl font-bold text-slate-900">Đang xử lý</h1>
    <p class="max-w-sm text-sm text-slate-600">Vui lòng chờ trong giây lát…</p>
  </div>
</template>
