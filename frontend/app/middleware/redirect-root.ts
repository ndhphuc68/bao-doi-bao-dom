/** `/` — đã login → home; còn lại → login */
export default defineNuxtRouteMiddleware((to) => {
  if (to.path !== '/') return
  const token = useCookie('auth_token')
  if (token.value) return navigateTo('/home')
  return navigateTo('/login')
})
