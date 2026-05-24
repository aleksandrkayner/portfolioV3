import { makeAutoObservable, runInAction } from 'mobx'
import { api } from '../api/client'
import type { AuthUser, LoginPayload, RegisterPayload } from '../types/auth'

export class AuthStore {
  user: AuthUser | null = null
  isLoading = true
  error: string | null = null

  constructor() {
    makeAutoObservable(this)
  }

  get isAuthenticated() {
    return this.user !== null
  }

  get isApproved() {
    return this.user?.status === 'approved'
  }

  get isPending() {
    return this.user?.status === 'pending'
  }

  get isAdmin() {
    return this.user?.isAdmin ?? false
  }

  hasPrivilege(key: string) {
    return this.isApproved && (this.user?.privileges.includes(key) ?? false)
  }

  async bootstrap() {
    this.isLoading = true
    this.error = null
    try {
      const { user } = await api.me()
      runInAction(() => {
        this.user = user
      })
    } catch {
      runInAction(() => {
        this.user = null
      })
    } finally {
      runInAction(() => {
        this.isLoading = false
      })
    }
  }

  async register(payload: RegisterPayload) {
    this.error = null
    const { user } = await api.register(payload)
    runInAction(() => {
      this.user = user
    })
  }

  async login(payload: LoginPayload) {
    this.error = null
    const { user } = await api.login(payload)
    runInAction(() => {
      this.user = user
    })
  }

  async logout() {
    try {
      await api.logout()
    } finally {
      runInAction(() => {
        this.user = null
        this.error = null
      })
    }
  }

  setError(message: string | null) {
    this.error = message
  }

  setUser(user: AuthUser | null) {
    this.user = user
  }
}
