/** Trang chủ & khu vực cần đăng nhập */
export default defineNuxtRouteMiddleware(() => {
  const onboarding = useCookie('eco_onboarding_done')
  if (!onboarding.value) return navigateTo('/onboarding')
  const token = useCookie('auth_token')
  if (!token.value) return navigateTo('/login')
})
