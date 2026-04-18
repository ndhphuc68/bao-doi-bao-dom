<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['require-super-admin']
})

type UserRow = {
  id: string
  email: string
  name: string
  points: number
  role: string
  collectionPointId?: string | null
}

const token = useCookie('admin_auth_token')
const { apiFetch } = useApi()

const { data: rows, pending } = await useAsyncData('admin_all_users', () =>
  apiFetch<UserRow[]>('/admin/users', {
    headers: { Authorization: `Bearer ${token.value}` }
  })
)
</script>

<template>
  <div class="flex flex-col gap-4">
    <div>
      <h1 class="text-xl font-bold tracking-tight">Tất cả users</h1>
      <p class="text-sm text-slate-600">Danh sách người dùng (admin tổng).</p>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200">
      <div v-if="pending" class="p-4 text-sm text-slate-500">Đang tải…</div>
      <div v-else-if="!rows?.length" class="p-4 text-sm text-slate-500">Không có dữ liệu.</div>
      <div v-else class="overflow-auto">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50">
            <tr class="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th class="px-4 py-3">Email</th>
              <th class="px-4 py-3">Tên</th>
              <th class="px-4 py-3">Điểm</th>
              <th class="px-4 py-3">Vai trò</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr v-for="u in rows" :key="u.id" class="hover:bg-slate-50">
              <td class="px-4 py-3">{{ u.email }}</td>
              <td class="px-4 py-3">{{ u.name }}</td>
              <td class="px-4 py-3">{{ u.points }}</td>
              <td class="px-4 py-3 font-mono text-xs">{{ u.role }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

