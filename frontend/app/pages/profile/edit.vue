<script setup lang="ts">
import { useToast } from 'primevue/usetoast'

definePageMeta({ middleware: ['require-auth'] })

const token = useCookie('auth_token')
const { auth } = useApi()
const toast = useToast()
const router = useRouter()

const { data: profile, refresh } = await useAsyncData('edit_profile', () => auth.profile(token.value || ''))

const form = ref({
  name: '',
  phoneNumber: ''
})

watch(profile, (p) => {
  if (p) {
    form.value.name = p.name || ''
    form.value.phoneNumber = p.phoneNumber || ''
  }
}, { immediate: true })

const saving = ref(false)

async function onSave() {
  if (!token.value) return
  saving.value = true
  try {
    await auth.updateProfile(token.value, form.value)
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật thông tin cá nhân', life: 3000 })
    await refresh()
    router.push('/profile')
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: e.message || 'Không thể cập nhật thông tin', life: 3000 })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="min-h-[100dvh] bg-slate-50 pb-28">
    <AppPageHeader title="Chỉnh sửa thông tin" back-to="/profile" />

    <div class="px-5 pt-6">
      <div class="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
        <div class="space-y-5">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Họ và tên</label>
            <InputText v-model="form.name" placeholder="Nhập tên của bạn" fluid class="!rounded-2xl border-slate-200" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Số điện thoại</label>
            <InputText v-model="form.phoneNumber" placeholder="Nhập số điện thoại" fluid class="!rounded-2xl border-slate-200" />
          </div>

          <div class="pt-2">
            <Button 
              label="Lưu thay đổi" 
              icon="pi pi-check" 
              fluid 
              class="!rounded-2xl !py-3.5 !font-bold" 
              :loading="saving"
              @click="onSave" 
            />
          </div>
        </div>
      </div>

      <div class="mt-6 px-4 text-center">
        <p class="text-xs leading-relaxed text-slate-400">
          Thông tin này sẽ được sử dụng để liên hệ khi có yêu cầu thu hồi hoặc xử lý đơn hàng.
        </p>
      </div>
    </div>

    <AppBottomNav />
  </div>
</template>
