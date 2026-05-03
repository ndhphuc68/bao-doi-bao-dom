/** `/` — đã login → home; còn lại → login */
export default defineNuxtRouteMiddleware((to) => {
  const localePath = useLocalePath()
  // Match '/' or '/en' or other localized root paths
  if (to.path === '/' || to.path === localePath('/')) {
    const token = useCookie('auth_token')
    if (token.value) return navigateTo(localePath('/home'))
    return navigateTo(localePath('/login'))
  }
})
