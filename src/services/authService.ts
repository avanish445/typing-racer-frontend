import api from './api'
import { cookieManager } from '../utils/cookieManager'

export const authService = {
  async register(username: string, email: string, password: string) {
    const { data } = await api.post('/auth/register', { username, email, password })
    return data
  },

  async login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password })
    // console.log('Login response:', data) // Debug log
    if (data.accessToken) {
      cookieManager.setSecure('accessToken', data.accessToken)
      cookieManager.setSecure('refreshToken', data.refreshToken)
    }
    return data
  },

  async logout() {
    await api.post('/auth/logout')
    cookieManager.delete('accessToken')
    cookieManager.delete('refreshToken')
  },

  async getMe() {
    const { data } = await api.get('/auth/me', { withCredentials: true })
    return data
  },
}
