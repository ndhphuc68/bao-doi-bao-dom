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
const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string

const form = reactive({
  title: '',
  content: '',
  imageUrl: '' as string | null
})

const uploading = ref(false)
const saving = ref(false)

const {
  data: rows,
  pending,
  refresh
} = await useAsyncData('waste_posts', () =>
  apiFetch<Post[]>('/admin/waste-posts', {
    headers: { Authorization: `Bearer ${token.value}` }
  })
)

const hasBasics = computed(() => form.title.trim().length > 0 && form.content.trim().length > 0)

/** Đủ điều kiện xuất bản: tiêu đề + nội dung + ảnh (khớp backend). */
const canPublish = computed(() => hasBasics.value && Boolean(form.imageUrl?.trim()))

async function uploadCover(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    toast.add({ severity: 'warn', summary: 'Chỉ chọn file ảnh', life: 2500 })
    input.value = ''
    return
  }
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res = await $fetch<{ url: string }>(`${apiBase}/uploads`, {
      method: 'POST',
      body: fd,
      headers: { Authorization: `Bearer ${token.value}` }
    })
    form.imageUrl = res.url
    toast.add({ severity: 'success', summary: 'Đã tải ảnh lên', life: 2000 })
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Upload thất bại', detail: getApiErrorMessage(err), life: 4000 })
  } finally {
    uploading.value = false
    input.value = ''
  }
}

function removeCover() {
  form.imageUrl = null
}

async function saveDraft() {
  if (!hasBasics.value) {
    toast.add({
      severity: 'warn',
      summary: 'Thiếu nội dung',
      detail: 'Nhập tiêu đề và nội dung để lưu nháp.',
      life: 3000
    })
    return
  }
  saving.value = true
  try {
    await apiFetch('/admin/waste-posts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: {
        title: form.title.trim(),
        content: form.content.trim(),
        imageUrl: form.imageUrl || undefined,
        published: false
      }
    })
    toast.add({ severity: 'success', summary: 'Đã lưu nháp', detail: 'Bài chưa xuất bản.', life: 2500 })
    form.title = ''
    form.content = ''
    form.imageUrl = null
    await refresh()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: getApiErrorMessage(e), life: 4000 })
  } finally {
    saving.value = false
  }
}

async function publishPost() {
  if (!canPublish.value) {
    toast.add({
      severity: 'warn',
      summary: 'Chưa đủ điều kiện xuất bản',
      detail: 'Cần tiêu đề, nội dung và ảnh đại diện.',
      life: 3500
    })
    return
  }
  saving.value = true
  try {
    await apiFetch('/admin/waste-posts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: {
        title: form.title.trim(),
        content: form.content.trim(),
        imageUrl: form.imageUrl,
        published: true
      }
    })
    toast.add({ severity: 'success', summary: 'Đã xuất bản', detail: 'Bài hiển thị trên app người dùng.', life: 2500 })
    form.title = ''
    form.content = ''
    form.imageUrl = null
    await refresh()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: getApiErrorMessage(e), life: 4000 })
  } finally {
    saving.value = false
  }
}

function coverSrc(url: string | null | undefined) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${baseURL.replace(/\/$/, '')}${url.startsWith('/') ? '' : '/'}${url}`
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 class="text-xl font-bold tracking-tight">Bài đăng về rác thải</h1>
      <p class="text-sm text-slate-600">
        Lưu nháp không cần ảnh. <strong>Xuất bản</strong> lên app user cần đủ tiêu đề, nội dung và ảnh đại diện.
      </p>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div class="mb-3 text-sm font-semibold text-slate-800">Viết bài mới</div>
      <div class="flex flex-col gap-3">
        <div>
          <label class="mb-1 block text-xs font-medium text-slate-600">Tiêu đề</label>
          <InputText v-model="form.title" fluid class="rounded-xl" placeholder="Tiêu đề" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-slate-600">Nội dung</label>
          <Textarea v-model="form.content" rows="5" fluid class="rounded-xl" placeholder="Nội dung bài viết…" />
        </div>

        <div>
          <label class="mb-1 block text-xs font-medium text-slate-600">Ảnh đại diện (bắt buộc khi xuất bản)</label>
          <div class="flex flex-wrap items-start gap-3">
            <input
              type="file"
              accept="image/*"
              class="text-sm text-slate-600 file:mr-2 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-700"
              :disabled="uploading"
              @change="uploadCover"
            />
            <span v-if="uploading" class="text-xs text-slate-500">Đang tải…</span>
          </div>
          <div v-if="form.imageUrl" class="relative mt-3 inline-block">
            <img
              :src="coverSrc(form.imageUrl)"
              alt="Ảnh đại diện"
              class="h-36 max-w-full rounded-xl border border-slate-200 object-cover"
            />
            <Button
              type="button"
              label="Xóa ảnh"
              size="small"
              severity="secondary"
              text
              class="!mt-2"
              @click="removeCover"
            />
          </div>
          <p v-if="hasBasics && !form.imageUrl" class="mt-2 text-xs text-amber-700">
            Thêm ảnh để có thể xuất bản (hoặc chỉ lưu nháp).
          </p>
        </div>

        <div class="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
          <Button
            label="Lưu nháp"
            icon="pi pi-save"
            severity="secondary"
            outlined
            class="!rounded-xl"
            :loading="saving"
            :disabled="uploading"
            @click="saveDraft"
          />
          <Button
            label="Xuất bản"
            icon="pi pi-check-circle"
            class="!rounded-xl"
            :loading="saving"
            :disabled="uploading || !canPublish"
            @click="publishPost"
          />
        </div>
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200">
      <div v-if="pending" class="p-4 text-sm text-slate-500">Đang tải…</div>
      <div v-else-if="!rows?.length" class="p-4 text-sm text-slate-500">Chưa có bài đăng.</div>
      <ul v-else class="divide-y divide-slate-100 bg-white">
        <li v-for="p in rows" :key="p.id" class="flex gap-3 px-4 py-4">
          <div
            v-if="p.imageUrl"
            class="h-16 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-100"
          >
            <img :src="coverSrc(p.imageUrl)" :alt="p.title" class="h-full w-full object-cover" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div class="font-semibold text-slate-900">{{ p.title }}</div>
                <div class="mt-1 line-clamp-2 text-sm text-slate-600">{{ p.body }}</div>
                <div class="mt-2 text-xs text-slate-400">{{ new Date(p.createdAt).toLocaleString('vi-VN') }}</div>
              </div>
              <span
                class="shrink-0 rounded-full px-2 py-1 text-xs font-semibold"
                :class="p.published ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'"
              >
                {{ p.published ? 'Đã xuất bản' : 'Nháp' }}
              </span>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
