function parseList(raw: string) {
  return String(raw || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

/** Chỉ admin tổng (khớp backend SuperAdminGuard). */
export default defineNuxtRouteMiddleware(async () => {
  const token = useCookie('admin_auth_token')
  if (!token.value) return navigateTo('/admin-login')

  const { public: pub } = useRuntimeConfig()
  const superList = parseList(pub.superAdminEmails as string)
  const adminList = parseList(pub.adminEmails as string)

  try {
    const { apiFetch } = useApi()
    const profile = await apiFetch<{ email?: string; role?: string }>('/auth/profile', {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    const email = String(profile?.email || '')
      .trim()
      .toLowerCase()
    const role = String(profile?.role || 'USER')

    if (role === 'SUPER_ADMIN') return

    if (superList.length > 0) {
      if (email && superList.includes(email)) return
      return navigateTo('/admin/forbidden')
    }

    if (adminList.length > 0 && email && adminList.includes(email)) return

    return navigateTo('/admin/forbidden')
  } catch {
    return navigateTo('/admin-login')
  }
})
