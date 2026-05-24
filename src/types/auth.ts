export type UserStatus = 'pending' | 'approved' | 'rejected' | 'suspended'

export type AuthUser = {
  id: string
  username: string | null
  email: string
  displayName: string
  avatarUrl: string | null
  status: UserStatus
  roles: string[]
  privileges: string[]
  isAdmin: boolean
}

export type Privilege = {
  id: string
  key: string
  description: string | null
}

export type RegisterPayload = {
  username: string
  email: string
  password: string
  displayName: string
}

export type LoginPayload = {
  login: string
  password: string
}
