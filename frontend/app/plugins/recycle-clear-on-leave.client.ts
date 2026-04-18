export default defineNuxtPlugin(() => {
  const router = useRouter()

  router.afterEach((to, from) => {
    const fromPath = from.path || ''
    const toPath = to.path || ''
    if (fromPath.startsWith('/recycle') && !toPath.startsWith('/recycle')) {
      useRecycleStore().reset()
    }
  })
})
