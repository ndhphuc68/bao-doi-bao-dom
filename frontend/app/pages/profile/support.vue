<script setup lang="ts">
definePageMeta({ middleware: ['require-auth'] })

const faqs = [
  { q: 'Làm thế nào để đổi quà?', a: 'Bạn vào mục Điểm thưởng, chọn món quà yêu thích và nhấn Đổi ngay.' },
  { q: 'Tôi có thể thu hồi những gì?', a: 'Chúng tôi nhận thu hồi điện thoại, máy tính, phụ kiện và các thiết bị điện tử nhỏ.' },
  { q: 'Mất bao lâu để xử lý đơn?', a: 'Thông thường đơn sẽ được xử lý trong vòng 24-48h kể từ khi bạn bàn giao thiết bị.' }
]
</script>

<template>
  <div class="min-h-[100dvh] bg-slate-50 pb-28">
    <AppPageHeader title="Trung tâm hỗ trợ" back-to="/profile" />

    <div class="px-5 pt-6">
      <!-- Contact Cards -->
      <div class="mb-8 grid grid-cols-2 gap-3">
        <a href="tel:0901234567" class="flex flex-col items-center rounded-3xl bg-white p-5 border border-slate-100 shadow-sm transition active:scale-95">
          <div class="h-10 w-10 flex items-center justify-center rounded-2xl bg-sky-50 text-sky-600 mb-3">
            <i class="pi pi-phone" />
          </div>
          <span class="text-xs font-bold text-slate-900">Gọi điện</span>
        </a>
        <a href="mailto:support@eco.com" class="flex flex-col items-center rounded-3xl bg-white p-5 border border-slate-100 shadow-sm transition active:scale-95">
          <div class="h-10 w-10 flex items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3">
            <i class="pi pi-envelope" />
          </div>
          <span class="text-xs font-bold text-slate-900">Email</span>
        </a>
      </div>

      <!-- FAQ Section -->
      <div class="mb-4 px-1">
        <h2 class="text-base font-extrabold text-slate-900 uppercase tracking-wide">Câu hỏi thường gặp</h2>
      </div>

      <div class="space-y-3">
        <div 
          v-for="(faq, idx) in faqs" 
          :key="idx"
          class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
        >
          <p class="text-sm font-bold text-slate-900">{{ faq.q }}</p>
          <p class="mt-2 text-xs leading-relaxed text-slate-500 font-medium">{{ faq.a }}</p>
        </div>
      </div>

      <div class="mt-10 rounded-3xl bg-slate-100 p-6 text-center">
        <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Eco Version 1.0.0</p>
        <p class="text-xs text-slate-500 font-medium italic">"Tái chế hôm nay, xanh tươi ngày mai."</p>
      </div>
    </div>

    <AppBottomNav />
  </div>
</template>
