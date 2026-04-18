<script setup lang="ts">
import type { AdminProfile } from '~/types/admin'

const router = useRouter()
const token = useCookie('admin_auth_token')
const { public: pub } = useRuntimeConfig()
const { apiFetch } = useApi()

function parseList(raw: string) {
  return String(raw || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

const { data: me } = await useAsyncData('admin_me', () =>
  apiFetch<AdminProfile>('/auth/profile', {
    headers: { Authorization: `Bearer ${token.value}` }
  })
)

const superEmails = computed(() => parseList(pub.superAdminEmails as string))
const adminEmails = computed(() => parseList(pub.adminEmails as string))

const canSuperAdmin = computed(() => {
  const role = me.value?.role
  if (role === 'SUPER_ADMIN') return true
  const e = String(me.value?.email || '')
    .trim()
    .toLowerCase()
  if (!e) return false
  if (superEmails.value.length) return superEmails.value.includes(e)
  if (adminEmails.value.length) return adminEmails.value.includes(e)
  return false
})

const roleLabel = computed(() => {
  const r = me.value?.role
  if (r === 'SUPER_ADMIN') return 'Admin tổng'
  if (r === 'STORE_ADMIN') return 'Admin cửa hàng'
  if (r === 'USER') return 'User'
  return 'Quản trị'
})

const handleLogout = async () => {
  token.value = null
  await router.push('/admin-login')
}
</script>

<template>
  <div class="min-h-dvh bg-slate-50 text-slate-900">
    <div class="grid w-full max-w-none grid-cols-[280px_1fr] gap-6 px-6 py-6">
      <aside class="sticky top-6 h-[calc(100dvh-3rem)] overflow-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="mb-4 flex items-center justify-between gap-3">
          <NuxtLink to="/admin" class="flex items-center gap-2">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
            >
              <i class="pi pi-shield" aria-hidden="true" />
            </div>
            <div class="leading-tight">
              <div class="text-sm font-semibold">Eco Admin</div>
              <div class="text-xs text-slate-500">{{ roleLabel }}</div>
            </div>
          </NuxtLink>
          <Button
            label="Đăng xuất"
            size="small"
            severity="secondary"
            outlined
            class="!rounded-xl"
            @click="handleLogout"
          />
        </div>

        <nav class="flex flex-col gap-1">
          <NuxtLink
            to="/admin"
            class="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
            active-class="bg-emerald-50 text-emerald-700"
          >
            <i class="pi pi-chart-line mr-2 text-sm" aria-hidden="true" />
            Dashboard
          </NuxtLink>
          <NuxtLink
            to="/admin/orders"
            class="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
            active-class="bg-emerald-50 text-emerald-700"
          >
            <i class="pi pi-inbox mr-2 text-sm" aria-hidden="true" />
            Đơn
          </NuxtLink>
          <NuxtLink
            to="/admin/warehouse"
            class="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
            active-class="bg-emerald-50 text-emerald-700"
          >
            <i class="pi pi-box mr-2 text-sm" aria-hidden="true" />
            Kho lưu trữ
          </NuxtLink>
          <NuxtLink
            to="/admin/warehouse/shipments"
            class="rounded-xl px-3 py-2 pl-8 text-sm font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
            active-class="bg-emerald-50 text-emerald-700"
          >
            <i class="pi pi-truck mr-2 text-sm" aria-hidden="true" />
            Đơn gửi hàng
          </NuxtLink>
          <NuxtLink
            v-if="canSuperAdmin"
            to="/admin/store-admins"
            class="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
            active-class="bg-emerald-50 text-emerald-700"
          >
            <i class="pi pi-id-card mr-2 text-sm" aria-hidden="true" />
            Admin cửa hàng
          </NuxtLink>
          <NuxtLink
            v-if="canSuperAdmin"
            to="/admin/waste-posts"
            class="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
            active-class="bg-emerald-50 text-emerald-700"
          >
            <i class="pi pi-book mr-2 text-sm" aria-hidden="true" />
            Bài đăng rác thải
          </NuxtLink>
          <NuxtLink
            v-if="canSuperAdmin"
            to="/admin/users"
            class="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
            active-class="bg-emerald-50 text-emerald-700"
          >
            <i class="pi pi-users mr-2 text-sm" aria-hidden="true" />
            Tất cả users
          </NuxtLink>
        </nav>
      </aside>

      <main class="min-h-[calc(100dvh-3rem)] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <slot />
      </main>
    </div>
  </div>
</template>

