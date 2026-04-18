export default defineNuxtRouteMiddleware(async () => {
  const token = useCookie('admin_auth_token')
  if (!token.value) return navigateTo('/admin-login')

  const { public: pub } = useRuntimeConfig()
  const allow = String(pub.adminEmails || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)

  try {
    const { apiFetch } = useApi()
    const profile = await apiFetch<{ email?: string; role?: string }>('/auth/profile', {
      headers: { Authorization: `Bearer ${token.value}` }
    })

    const email = String(profile?.email || '').trim().toLowerCase()
    const role = String(profile?.role || 'USER')

    // Khớp backend AdminAccessGuard: SUPER/STORE hoặc email trong allowlist, hoặc allowlist rỗng (dev/demo).
    if (allow.length === 0) return
    if (role === 'SUPER_ADMIN' || role === 'STORE_ADMIN') return
    if (email && allow.includes(email)) return
    return navigateTo('/admin/forbidden')
  } catch {
    return navigateTo('/admin-login')
  }
})

