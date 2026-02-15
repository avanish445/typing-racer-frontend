import api from './api'

export const userService = {
  async getProfile(id: string) {
    const { data } = await api.get(`/users/${id}`, { withCredentials: true })
    return data
  },

  async updateProfile(id: string, updates: Record<string, any>) {
    const { data } = await api.patch(`/users/${id}`, updates, { withCredentials: true })
    return data
  },

  async getMatchHistory(id: string, page = 1) {
    const { data } = await api.get(`/users/${id}/matches?page=${page}`, { withCredentials: true })
    return data
  },

  async getStats(id: string) {
    const { data } = await api.get(`/users/${id}/stats`, { withCredentials: true })
    return data
  },

  async getLeaderboard() {
    const { data } = await api.get('/users/leaderboard', { withCredentials: true })
    return data
  },

  async getAnalytics(id: string, dateRange = 'all', difficulty = 'all') {
    const { data } = await api.get(`/users/${id}/analytics`, {
      params: { dateRange, difficulty },
      withCredentials: true,
    })
    return data
  },

  async getGlobalStats() {
    const { data } = await api.get('/stats/global', { withCredentials: true })
    return data
  },
}
