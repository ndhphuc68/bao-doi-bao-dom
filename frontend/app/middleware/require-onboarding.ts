/** Trang đăng nhập: bắt buộc đã xem onboarding; đã có token thì vào thẳng home */
export default defineNuxtRouteMiddleware(() => {
  const token = useCookie('auth_token')
  if (token.value) return navigateTo('/home')
  const onboarding = useCookie('eco_onboarding_done')
  if (!onboarding.value) return navigateTo('/onboarding')
})
