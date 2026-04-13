/** `/` — luồng: chưa onboarding → onboarding; đã login → home; còn lại → login */
export default defineNuxtRouteMiddleware((to) => {
  if (to.path !== '/') return
  const onboarding = useCookie('eco_onboarding_done')
  const token = useCookie('auth_token')
  if (!onboarding.value) return navigateTo('/onboarding')
  if (token.value) return navigateTo('/home')
  return navigateTo('/login')
})
