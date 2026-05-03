/** Trang login/register: đã có token thì vào thẳng home */
export default defineNuxtRouteMiddleware(() => {
  const token = useCookie('auth_token')
  const localePath = useLocalePath()
  if (token.value) return navigateTo(localePath('/home'))
})
