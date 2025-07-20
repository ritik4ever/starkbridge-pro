'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { authApi } from '@/lib/api'
import { User } from '@starkbridge/shared'
import { Logger } from '@starkbridge/shared'
import { toast } from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: () => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()

  const isAuthenticated = !!user && !!address

  const login = async () => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    try {
      setIsLoading(true)

      // Get nonce
      const nonceResponse = await authApi.getNonce(address)
      const { nonce, message } = nonceResponse.data

      // Sign message
      const signature = await signMessageAsync({ message })

      // Authenticate
      const authResponse = await authApi.connect({
        walletAddress: address,
        signature,
        message
      })

      const { user: userData, token } = authResponse.data
      
      // Store token
      localStorage.setItem('auth_token', token)
      
      setUser(userData)
      toast.success('Successfully authenticated!')
    } catch (error: any) {
      Logger.error('Login error:', error)
      toast.error(error.response?.data?.message || 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setUser(null)
    toast.success('Logged out successfully')
  }

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await authApi.verify()
      setUser(response.data.user)
    } catch (error) {
      Logger.error('Refresh user error:', error)
      logout()
    }
  }

  // Auto-login on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        if (token && address) {
          await refreshUser()
        }
      } catch (error) {
        Logger.error('Init auth error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [address])

  // Auto-logout when wallet disconnects
  useEffect(() => {
    if (!isConnected && user) {
      logout()
    }
  }, [isConnected, user])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}