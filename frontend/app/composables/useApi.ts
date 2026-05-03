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
      register: (body: { email: string; password: string; name?: string; phoneNumber?: string }) =>
        apiFetch<AuthTokenResponse>('/auth/register', { method: 'POST', body }),
      login: (body: { email: string; password: string }) =>
        apiFetch<AuthTokenResponse>('/auth/login', { method: 'POST', body: { ...body, type: 'USER' } }),
      profile: (token: string) =>
        apiFetch<any>('/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        }),
      updateProfile: (token: string, body: { name?: string; phoneNumber?: string }) =>
        apiFetch<any>('/auth/profile', {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
          body
        }),
      pointLedger: (token: string) =>
        apiFetch<PointLedgerSummary>('/auth/point-ledger', {
          headers: { Authorization: `Bearer ${token}` }
        }),
      redeem: (token: string, body: { rewardTitle: string; points: number }) =>
        apiFetch<any>('/auth/redeem', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body
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
    },
    notifications: {
      list: (token: string) =>
        apiFetch<any[]>('/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        }),
      unreadCount: (token: string) =>
        apiFetch<number>('/notifications/unread-count', {
          headers: { Authorization: `Bearer ${token}` }
        }),
      markRead: (token: string, id: string) =>
        apiFetch<any>(`/notifications/${id}/read`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        }),
      markAllRead: (token: string) =>
        apiFetch<any>('/notifications/read-all', {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        })
    },
    community: {
      leaderboard: (token: string) =>
        apiFetch<any[]>('/community/leaderboard', {
          headers: { Authorization: `Bearer ${token}` }
        }),
      stats: (token: string) =>
        apiFetch<any>('/community/stats', {
          headers: { Authorization: `Bearer ${token}` }
        }),
      feed: (token: string) =>
        apiFetch<any[]>('/community/feed', {
          headers: { Authorization: `Bearer ${token}` }
        })
    }
  }
}
