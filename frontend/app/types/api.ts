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
