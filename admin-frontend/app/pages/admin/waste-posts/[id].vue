<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
import { getApiErrorMessage } from '~/utils/api/errors'
import { useRouter, useRoute } from 'vue-router'

definePageMeta({
  layout: 'admin',
  middleware: ['require-super-admin']
})

const token = useCookie('admin_auth_token')
const toast = useToast()
const { apiFetch, baseURL } = useApi()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string
const router = useRouter()
const route = useRoute()
const id = route.params.id as string

const form = reactive({
  title: '',
  content: '',
  imageUrl: '' as string | null
})

const isCurrentlyPublished = ref(false)

const { data: post, pending: loading } = await useAsyncData(`waste_post_${id}`, () =>
  apiFetch<any>(`/admin/waste-posts/${id}`, {
    headers: { Authorization: `Bearer ${token.value}` }
  })
)

watchEffect(() => {
  if (post.value) {
    form.title = post.value.title
    form.content = post.value.body
    form.imageUrl = post.value.imageUrl
    isCurrentlyPublished.value = post.value.published
  }
})

const uploading = ref(false)
const saving = ref(false)

const hasBasics = computed(() => form.title.trim().length > 0 && form.content.trim().length > 0)
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

async function updatePost(published: boolean) {
  if (published && !canPublish.value) {
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
    await apiFetch(`/admin/waste-posts/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token.value}` },
      body: {
        title: form.title.trim(),
        content: form.content.trim(),
        imageUrl: form.imageUrl || null,
        published
      }
    })
    toast.add({ 
      severity: 'success', 
      summary: published ? 'Đã xuất bản' : 'Đã lưu nháp', 
      detail: published ? 'Bài hiển thị trên app người dùng.' : 'Bài viết đã chuyển về nháp.', 
      life: 2500 
    })
    router.push('/admin/waste-posts')
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
    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <NuxtLink to="/admin/waste-posts">
            <Button icon="pi pi-arrow-left" text rounded size="small" class="!text-slate-400 hover:!text-slate-700" />
          </NuxtLink>
          <h1 class="text-xl font-bold tracking-tight">Chỉnh sửa bài viết</h1>
        </div>
        <p class="text-sm text-slate-600 pl-10">
          Chỉnh sửa nội dung hoặc thay đổi trạng thái xuất bản của bài viết.
        </p>
      </div>
    </div>

    <div v-if="loading" class="p-12 text-center text-slate-500">Đang tải dữ liệu...</div>

    <div v-else class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-4">
        <div>
          <label class="mb-1 block text-xs font-medium text-slate-600 uppercase tracking-wide">Tiêu đề</label>
          <InputText v-model="form.title" fluid class="rounded-xl !bg-slate-50/50 focus:!bg-white" placeholder="Nhập tiêu đề bài viết..." />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-slate-600 uppercase tracking-wide">Nội dung</label>
          <ClientOnly>
            <Editor v-model="form.content" editorStyle="height: 400px" class="rounded-xl overflow-hidden border-slate-200" placeholder="Nội dung bài viết…" />
            <template #fallback>
              <div class="h-[400px] rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 text-sm">Đang tải bộ soạn thảo...</div>
            </template>
          </ClientOnly>
        </div>

        <div>
          <label class="mb-1 block text-xs font-medium text-slate-600 uppercase tracking-wide">Ảnh đại diện <span class="text-[10px] text-slate-400 font-normal normal-case">(bắt buộc khi xuất bản)</span></label>
          <div class="flex flex-wrap items-start gap-3 mt-1">
            <input
              type="file"
              accept="image/*"
              class="text-sm text-slate-600 file:mr-2 file:rounded-xl file:border-0 file:bg-emerald-50 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
              :disabled="uploading"
              @change="uploadCover"
            />
            <span v-if="uploading" class="text-xs text-slate-500 py-2.5">Đang tải lên... <i class="pi pi-spin pi-spinner text-xs" /></span>
          </div>
          <div v-if="form.imageUrl" class="relative mt-4 inline-block">
            <div class="absolute -top-2 -right-2 z-10">
              <Button
                icon="pi pi-times"
                rounded
                severity="danger"
                class="!w-6 !h-6 !p-0 shadow-md"
                title="Xóa ảnh"
                @click="removeCover"
              />
            </div>
            <img
              :src="coverSrc(form.imageUrl)"
              alt="Ảnh đại diện"
              class="h-48 w-[400px] max-w-full rounded-xl border border-slate-200 object-cover shadow-sm"
            />
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-6 mt-4">
          <Button
            v-if="isCurrentlyPublished"
            label="Tắt xuất bản (Chuyển về nháp)"
            icon="pi pi-eye-slash"
            severity="warn"
            text
            class="!rounded-xl !px-6 mr-auto"
            :loading="saving"
            :disabled="uploading"
            @click="updatePost(false)"
          />
          <Button
            v-if="!isCurrentlyPublished"
            label="Lưu nháp"
            icon="pi pi-save"
            severity="secondary"
            text
            class="!rounded-xl !px-6"
            :loading="saving"
            :disabled="uploading"
            @click="updatePost(false)"
          />
          <Button
            label="Lưu & Xuất bản"
            icon="pi pi-send"
            class="!rounded-xl !px-8 shadow-md shadow-emerald-600/20"
            :loading="saving"
            :disabled="uploading || !canPublish"
            @click="updatePost(true)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
