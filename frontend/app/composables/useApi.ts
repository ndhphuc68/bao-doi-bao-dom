import type { FetchOptions } from 'ofetch'
import type {
  AuthTokenResponse,
  CollectionPointDto,
  CreateRecyclingRequestBody,
  PointLedgerSummary,
  RecyclingRequestCreated,
  UploadRecyclingImagesResponse,
  UserRecyclingOrder,
  WastePostDto
} from '~/types/api'

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
    apiFetch,
    auth: {
      register: (body: { email: string; password: string; name?: string }) =>
        apiFetch<AuthTokenResponse>('/auth/register', { method: 'POST', body }),
      login: (body: { email: string; password: string }) =>
        apiFetch<AuthTokenResponse>('/auth/login', { method: 'POST', body }),
      pointLedger: (token: string) =>
        apiFetch<PointLedgerSummary>('/auth/point-ledger', {
          headers: { Authorization: `Bearer ${token}` }
        })
    },
    collectionPoints: {
      list: () => apiFetch<CollectionPointDto[]>('/collection-points')
    },
    wastePosts: {
      list: () => apiFetch<WastePostDto[]>('/waste-posts'),
      get: (id: string) => apiFetch<WastePostDto>(`/waste-posts/${id}`)
    },
    recyclingRequests: {
      create: (token: string, body: CreateRecyclingRequestBody) =>
        apiFetch<RecyclingRequestCreated>('/recycling-requests', {
          method: 'POST',
          body,
          headers: { Authorization: `Bearer ${token}` }
        }),
      listMine: (token: string) =>
        apiFetch<UserRecyclingOrder[]>('/recycling-requests', {
          headers: { Authorization: `Bearer ${token}` }
        }),
      getMine: (token: string, id: string) =>
        apiFetch<UserRecyclingOrder>(`/recycling-requests/me/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
    },
    returnRequests: {
      cancelMine: (token: string, id: string) =>
        apiFetch<UserRecyclingOrder>(`/return-requests/${id}/cancel`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        })
    },
    uploads: {
      /** Multipart — không dùng apiFetch để tránh ghi đè Content-Type */
      recyclingImages: (token: string, files: File[]) => {
        const fd = new FormData()
        files.forEach((f) => fd.append('files', f))
        return $fetch<UploadRecyclingImagesResponse>(joinBase(baseURL, '/uploads/recycling-images'), {
          method: 'POST',
          body: fd,
          headers: { Authorization: `Bearer ${token}` }
        })
      }
    }
  }
}
