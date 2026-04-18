import type { FetchError } from 'ofetch'

function messageFromData(data: unknown): string | null {
  if (data == null) return null
  if (typeof data === 'string') return data
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const m = (data as { message: unknown }).message
    if (typeof m === 'string') return m
    if (Array.isArray(m)) return m.filter((x) => typeof x === 'string').join(', ')
  }
  return null
}

/** Lấy message lỗi từ $fetch / useFetch (Nest thường trả { message }) */
export function getApiErrorMessage(err: unknown, fallback = 'Đã có lỗi xảy ra'): string {
  if (err && typeof err === 'object') {
    const fe = err as FetchError
    const fromData = messageFromData(fe.data)
    if (fromData) return fromData
    if (typeof fe.message === 'string' && fe.message !== '[object Object]') return fe.message
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}

