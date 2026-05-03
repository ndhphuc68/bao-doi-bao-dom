/** Trang chủ & khu vực cần đăng nhập */
export default defineNuxtRouteMiddleware(() => {
  const token = useCookie('auth_token')
  const localePath = useLocalePath()
  if (!token.value) return navigateTo(localePath('/login'))
})
