import api from './api'
import type { PlayerResult } from '../types'

export const roomService = {
  async create(settings: Record<string, any>) {
    const { data } = await api.post('/rooms', settings, { withCredentials: true })
    return data
  },

  async getRoom(code: string, signal?: AbortSignal) {
    const { data } = await api.get(`/rooms/${code}`, { withCredentials: true, signal })
    return data
  },

  async join(code: string) {
    const { data } = await api.post(`/rooms/${code}/join`, {}, { withCredentials: true })
    return data
  },

  async leave(code: string) {
    const { data } = await api.post(`/rooms/${code}/leave`, {}, { withCredentials: true })
    return data
  },

  async updateSettings(code: string, settings: Record<string, any>) {
    const { data } = await api.patch(`/rooms/${code}/settings`, settings, { withCredentials: true })
    return data
  },

  async getResults(code: string) {
    const { data } = await api.get(`/rooms/${code}/results`, { withCredentials: true })
    return data
  },

  async submitResults(code: string, results: PlayerResult[]) {
    const { data } = await api.post(`/rooms/${code}/results`, { results }, { withCredentials: true })
    return data
  },
}
