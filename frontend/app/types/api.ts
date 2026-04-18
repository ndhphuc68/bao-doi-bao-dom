/** Vai trò tài khoản (khớp backend `User.role`) */
export type UserRole = 'USER' | 'SUPER_ADMIN' | 'STORE_ADMIN'

/** Bài đăng rác thải điện tử (API công khai GET /waste-posts) */
export interface WastePostDto {
  id: string
  title: string
  body: string
  imageUrl: string | null
  published: boolean
  createdAt: string
  updatedAt: string
}

/** Khớp response đăng nhập / đăng ký từ Nest JWT */
export interface AuthTokenResponse {
  access_token: string
  user?: unknown
}

export interface CollectionPointDto {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  openHours?: string | null
  distanceText?: string | null
}

export interface CreateRecyclingRequestBody {
  deviceType: string
  deviceName: string
  manufacturer: string
  condition: string
  collectionPointId: string | null
  scheduledDate: string
  scheduledTime: string
  /** Đường dẫn public trên BE, ví dụ `/uploads/recycling/uuid.jpg` */
  images: string[]
}

export interface UploadRecyclingImagesResponse {
  urls: string[]
}

export interface RecyclingRequestCreated {
  trackingCode: string
  [key: string]: unknown
}

/** Đơn thu gom / hoàn trả của user (GET /recycling-requests, GET /recycling-requests/me/:id) */
export interface UserRecyclingOrder {
  id: string
  trackingCode: string
  deviceName: string
  deviceType: string
  manufacturer: string
  condition?: string
  images?: string[]
  status: string
  returnStatus?: string
  returnReason?: string | null
  returnAdminNote?: string | null
  scheduledDate: string
  scheduledTime: string
  createdAt: string
  collectionPoint?: { id: string; name?: string; address?: string }
}
