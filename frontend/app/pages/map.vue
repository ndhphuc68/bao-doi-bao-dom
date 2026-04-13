<script setup>
definePageMeta({ middleware: ['require-auth'] })
</script>

<template>
  <div class="min-h-[100dvh] pb-28">
    <AppPageHeader title="Bản đồ" />

    <div class="px-3 pt-3">
      <div class="mb-2 flex items-center justify-between gap-2">
        <p class="text-xs font-medium text-slate-600">
          OpenStreetMap (miễn phí) • Leaflet
        </p>
        <Button
          label="Đi tới điểm thu gom"
          size="small"
          rounded
          severity="secondary"
          @click="navigateTo('/recycle/step-4')"
        />
      </div>

      <div class="h-[calc(100dvh-11.5rem)]">
        <ClientOnly>
          <LeafletMap />
          <template #fallback>
            <div class="flex h-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
              Đang tải bản đồ…
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>

    <AppBottomNav />
  </div>
</template>
