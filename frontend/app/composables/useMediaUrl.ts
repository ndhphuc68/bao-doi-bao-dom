import { resolveImageSrc } from '~/utils/media'

/** Ảnh data/blob/http hoặc đường dẫn BE `/uploads/...` */
export function useMediaUrl() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string
  return (src: string) => resolveImageSrc(src, apiBase)
}
