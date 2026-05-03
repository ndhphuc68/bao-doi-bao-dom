export type UserRole = 'USER' | 'SUPER_ADMIN'

export type AdminProfile = {
  id: string
  email: string
  name: string
  role: UserRole
  collectionPointId?: string | null
}
