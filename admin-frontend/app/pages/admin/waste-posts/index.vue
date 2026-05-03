<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
import { getApiErrorMessage } from '~/utils/api/errors'

definePageMeta({
  layout: 'admin',
  middleware: ['require-super-admin']
})

type Post = {
  id: string
  title: string
  body: string
  imageUrl?: string | null
  published: boolean
  createdAt: string
}

const token = useCookie('admin_auth_token')
const toast = useToast()
const { apiFetch, baseURL } = useApi()

const {
  data: rows,
  pending,
  refresh
} = await useAsyncData('waste_posts', () =>
  apiFetch<Post[]>('/admin/waste-posts', {
    headers: { Authorization: `Bearer ${token.value}` }
  })
)

const searchQuery = ref('')
const statusFilter = ref('ALL') // 'ALL', 'PUBLISHED', 'DRAFT'
const statusOptions = ref([
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Đã xuất bản', value: 'PUBLISHED' },
  { label: 'Bản nháp', value: 'DRAFT' }
])

const filteredRows = computed(() => {
  if (!rows.value) return []
  return rows.value.filter(p => {
    // 1. Filter by status
    if (statusFilter.value === 'PUBLISHED' && !p.published) return false
    if (statusFilter.value === 'DRAFT' && p.published) return false
    
    // 2. Filter by search query
    if (searchQuery.value.trim() !== '') {
      const q = searchQuery.value.toLowerCase()
      if (!p.title.toLowerCase().includes(q) && !p.body.toLowerCase().includes(q)) {
        return false
      }
    }
    
    return true
  })
})

function coverSrc(url: string | null | undefined) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${baseURL.replace(/\/$/, '')}${url.startsWith('/') ? '' : '/'}${url}`
}

const togglePublish = async (post: Post) => {
  try {
    const newStatus = !post.published;
    if (newStatus && (!post.imageUrl || !post.title || !post.body)) {
      toast.add({ severity: 'warn', summary: 'Không thể xuất bản', detail: 'Bài viết cần có đủ ảnh đại diện, tiêu đề và nội dung.', life: 3000 });
      return;
    }
    
    await apiFetch(`/admin/waste-posts/${post.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { published: newStatus }
    })
    post.published = newStatus;
    toast.add({ severity: 'success', summary: newStatus ? 'Đã xuất bản' : 'Đã tắt xuất bản (chuyển về nháp)', life: 2500 });
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: getApiErrorMessage(e), life: 3000 });
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold tracking-tight">Bài đăng về rác thải</h1>
        <p class="text-sm text-slate-600">
          Quản lý các bài viết tin tức và cẩm nang tái chế trên ứng dụng.
        </p>
      </div>
      <NuxtLink to="/admin/waste-posts/create">
        <Button label="Thêm bài viết mới" icon="pi pi-plus" class="!rounded-xl shadow-md shadow-emerald-500/20" />
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-3 items-center bg-white p-4 rounded-2xl border border-slate-200">
      <IconField class="w-full sm:max-w-[300px]">
        <InputIcon class="pi pi-search text-slate-400" />
        <InputText v-model="searchQuery" placeholder="Tìm kiếm theo tiêu đề..." class="w-full rounded-xl !bg-slate-50/50" />
      </IconField>
      
      <SelectButton v-model="statusFilter" :options="statusOptions" optionLabel="label" optionValue="value" class="w-full sm:w-auto text-sm" />
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200">
      <div v-if="pending" class="p-4 text-sm text-slate-500">Đang tải…</div>
      <div v-else-if="!filteredRows?.length" class="p-12 flex flex-col items-center justify-center text-center">
        <i class="pi pi-file text-4xl text-slate-200 mb-3" />
        <p class="text-sm font-medium text-slate-500">Không tìm thấy bài viết nào phù hợp.</p>
        <Button v-if="searchQuery || statusFilter !== 'ALL'" label="Xóa bộ lọc" text size="small" class="!mt-2" @click="searchQuery = ''; statusFilter = 'ALL'" />
      </div>
      <ul v-else class="divide-y divide-slate-100 bg-white">
        <li v-for="p in filteredRows" :key="p.id" class="flex gap-4 px-5 py-5 hover:bg-slate-50 transition-colors cursor-pointer">
          <div
            v-if="p.imageUrl"
            class="h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-100"
          >
            <img :src="coverSrc(p.imageUrl)" :alt="p.title" class="h-full w-full object-cover" />
          </div>
          <div v-else class="h-20 w-28 shrink-0 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center text-slate-300">
            <i class="pi pi-image text-2xl" />
          </div>
          <div class="min-w-0 flex-1 flex flex-col justify-between">
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div class="flex-1 pr-4">
                <div class="font-bold text-slate-900 text-base mb-1">{{ p.title }}</div>
                <!-- Strip HTML tags for preview since it's now Rich Text -->
                <div class="line-clamp-2 text-sm text-slate-500 leading-relaxed" v-html="p.body"></div>
              </div>
              <div class="flex items-center gap-2">
                <span
                  class="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border"
                  :class="p.published ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'"
                >
                  {{ p.published ? 'Đã xuất bản' : 'Bản nháp' }}
                </span>
              </div>
            </div>
            <div class="mt-2 flex items-center justify-between border-t border-slate-50 pt-2">
              <div class="text-[11px] font-mono font-medium text-slate-400">
                Cập nhật: {{ new Date(p.createdAt).toLocaleString('vi-VN') }}
              </div>
              <div class="flex items-center gap-1">
                <Button v-if="p.published" label="Tắt xuất bản" icon="pi pi-eye-slash" text severity="warn" size="small" class="!text-[11px] !px-2" @click.stop="togglePublish(p)" />
                <Button v-else label="Xuất bản nhanh" icon="pi pi-eye" text severity="success" size="small" class="!text-[11px] !px-2" @click.stop="togglePublish(p)" />
                <NuxtLink :to="`/admin/waste-posts/${p.id}`" @click.stop>
                  <Button label="Sửa" icon="pi pi-pencil" text size="small" class="!text-[11px] !px-2" />
                </NuxtLink>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
