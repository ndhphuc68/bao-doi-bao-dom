import L from 'leaflet'

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

export default defineNuxtPlugin(() => {
  // Ensure default marker icons resolve correctly in Vite/Nuxt builds.
  // Leaflet sometimes caches an internal icon URL resolver; clear it first.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl
  })
})

