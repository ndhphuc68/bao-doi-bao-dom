/** Hiển thị ảnh local (data URL) hoặc file đã lưu BE (`/uploads/...`) */
export function resolveImageSrc(src: string, apiBase: string): string {
  if (!src) return ''
  if (src.startsWith('data:') || src.startsWith('blob:') || src.startsWith('http')) {
    return src
  }
  const b = apiBase.replace(/\/$/, '')
  const p = src.startsWith('/') ? src : `/${src}`
  return `${b}${p}`
}
