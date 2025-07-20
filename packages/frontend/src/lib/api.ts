import axios, { AxiosError } from 'axios'
import { APIResponse, PaginatedResponse } from '@starkbridge/shared'
import { Logger } from '@starkbridge/shared'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    
    Logger.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  getNonce: (walletAddress: string) =>
    api.post<APIResponse<{ nonce: string; message: string }>>('/auth/nonce', {
      walletAddress
    }),

  connect: (data: {
    walletAddress: string
    signature: string
    message: string
    email?: string
    username?: string
  }) =>
    api.post<APIResponse<{ user: any; token: string }>>('/auth/connect', data),

  verify: () =>
    api.get<APIResponse<{ user: any }>>('/auth/verify'),

  refresh: () =>
    api.post<APIResponse<{ token: string }>>('/auth/refresh'),

  logout: () =>
    api.post<APIResponse<void>>('/auth/logout'),
}

// User API
export const userApi = {
  getProfile: () =>
    api.get<APIResponse<any>>('/users/profile'),

  updateProfile: (data: {
    email?: string
    username?: string
    avatar?: string
  }) =>
    api.put<APIResponse<any>>('/users/profile', data),

  updatePreferences: (preferences: any) =>
    api.put<APIResponse<any>>('/users/preferences', preferences),

  getStats: () =>
    api.get<APIResponse<any>>('/users/stats'),

  createApiKey: (data: { name: string; rateLimit?: number }) =>
    api.post<APIResponse<any>>('/users/api-keys', data),

  getApiKeys: () =>
    api.get<APIResponse<any[]>>('/users/api-keys'),

  deleteApiKey: (id: string) =>
    api.delete<APIResponse<void>>(`/users/api-keys/${id}`),
}

// Bridge API
export const bridgeApi = {
  createTransaction: (data: {
    fromChain: string
    toChain: string
    tokenAddress: string
    amount: string
    slippage?: number
  }) =>
    api.post<APIResponse<any>>('/bridge/transactions', data),

  processTransaction: (id: string) =>
    api.post<APIResponse<void>>(`/bridge/transactions/${id}/process`),

  getTransactions: (params?: {
    page?: number
    limit?: number
  }) =>
    api.get<APIResponse<PaginatedResponse<any>>>('/bridge/transactions', { params }),

  getTransaction: (id: string) =>
    api.get<APIResponse<any>>(`/bridge/transactions/${id}`),

  getBridges: () =>
    api.get<APIResponse<any[]>>('/bridge/bridges'),

  estimate: (data: {
    fromChain: string
    toChain: string
    tokenAddress: string
    amount: string
  }) =>
    api.post<APIResponse<any>>('/bridge/estimate', data),
}

// Token API
export const tokenApi = {
  getTokens: (params?: {
    chainId?: number
    search?: string
    page?: number
    limit?: number
  }) =>
    api.get<APIResponse<{ tokens: any[]; pagination: any }>>('/tokens', { params }),

  getToken: (address: string) =>
    api.get<APIResponse<any>>(`/tokens/${address}`),

  getBalance: (tokenAddress: string, userAddress: string) =>
    api.get<APIResponse<{ balance: string }>>(`/tokens/${tokenAddress}/balance/${userAddress}`),

  getPriceHistory: (address: string, period: string = '24h') =>
    api.get<APIResponse<any>>(`/tokens/${address}/price-history?period=${period}`),

  getPopularTokens: () =>
    api.get<APIResponse<any[]>>('/tokens/popular/trending'),
}

// Analytics API
export const analyticsApi = {
  getPlatformAnalytics: (params?: {
    period?: string
    metric?: string
  }) =>
    api.get<APIResponse<any>>('/analytics/platform', { params }),

  getBridgeAnalytics: (params?: {
    fromChain?: string
    toChain?: string
    period?: string
  }) =>
    api.get<APIResponse<any>>('/analytics/bridges', { params }),

  getTokenAnalytics: (params?: {
    tokenAddress?: string
    period?: string
  }) =>
    api.get<APIResponse<any>>('/analytics/tokens', { params }),

  getRealtimeStats: () =>
    api.get<APIResponse<any>>('/analytics/realtime'),

  getLeaderboard: (params?: {
    type?: string
    period?: string
  }) =>
    api.get<APIResponse<any>>('/analytics/leaderboard', { params }),
}

export { api }