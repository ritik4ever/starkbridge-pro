'use client'

import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/lib/api'

export function useStats() {
  return useQuery({
    queryKey: ['platform-stats'],
    queryFn: () => analyticsApi.getPlatformAnalytics({ period: '30d' }),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useRealtimeStats() {
  return useQuery({
    queryKey: ['realtime-stats'],
    queryFn: () => analyticsApi.getRealtimeStats(),
    select: (response) => response.data,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    staleTime: 30 * 1000,
  })
}

export function useTransactionHistory(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['transaction-history', page, limit],
    queryFn: () => bridgeApi.getTransactions({ page, limit }),
    select: (response) => response.data,
    keepPreviousData: true,
  })
}

export function useTokens(chainId?: number, search?: string) {
  return useQuery({
    queryKey: ['tokens', chainId, search],
    queryFn: () => tokenApi.getTokens({ chainId, search, limit: 100 }),
    select: (response) => response.data.tokens,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePopularTokens() {
  return useQuery({
    queryKey: ['popular-tokens'],
    queryFn: () => tokenApi.getPopularTokens(),
    select: (response) => response.data,
    staleTime: 10 * 60 * 1000,
  })
}