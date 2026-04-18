import type { FetchOptions } from 'ofetch'

function joinBase(base: string, path: string): string {
  const b = base.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${b}${p}`
}

export function useApi() {
  const { public: pub } = useRuntimeConfig()
  const baseURL = pub.apiBase as string

  function apiFetch<T>(path: string, opts?: FetchOptions): Promise<T> {
    return $fetch<T>(joinBase(baseURL, path), {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...(opts?.headers as Record<string, string> | undefined)
      }
    })
  }

  return {
    baseURL,
    apiFetch
  }
}

