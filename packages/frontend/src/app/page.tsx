'use client'

import { useState, useEffect } from 'react'
import { Header } from '../components/Header'
import { BridgeWidget } from '../components/BridgeWidget'

interface Token {
  symbol: string
  name: string
  address: string
  price?: number
  priceChange?: number
}

export default function HomePage() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')

  useEffect(() => {
    fetchTokens()
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          setWalletAddress(accounts[0])
          setIsWalletConnected(true)
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error)
      }
    }
  }

  const fetchTokens = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/tokens')
      const data = await response.json()
      if (data.success) {
        setTokens(data.data.tokens)
      }
    } catch (error) {
      console.error('Failed to fetch tokens:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Bridge the Future
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The most advanced platform for bridging assets between Ethereum and StarkNet. 
              Fast, secure, and cost-effective with production-level features.
            </p>
            
            {/* Status Indicator */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-lg px-4 py-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Backend Connected</span>
              </div>
              {isWalletConnected && (
                <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-lg px-4 py-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Wallet Connected</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6">
              <div className="text-sm text-gray-400 mb-2">Total Volume</div>
              <div className="text-2xl font-bold mb-1">$2.5M</div>
              <div className="flex items-center gap-1 text-sm text-green-500">
                <span>↗</span>
                <span>+12.5%</span>
              </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6">
              <div className="text-sm text-gray-400 mb-2">Transactions</div>
              <div className="text-2xl font-bold mb-1">1,234</div>
              <div className="flex items-center gap-1 text-sm text-green-500">
                <span>↗</span>
                <span>+8.2%</span>
              </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6">
              <div className="text-sm text-gray-400 mb-2">Avg. Time</div>
              <div className="text-2xl font-bold mb-1">15m</div>
              <div className="flex items-center gap-1 text-sm text-red-500">
                <span>↘</span>
                <span>-15.3%</span>
              </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6">
              <div className="text-sm text-gray-400 mb-2">Success Rate</div>
              <div className="text-2xl font-bold mb-1">99.8%</div>
              <div className="flex items-center gap-1 text-sm text-green-500">
                <span>↗</span>
                <span>+0.1%</span>
              </div>
            </div>
          </div>

          {/* Bridge Widget */}
          <div id="bridge" className="mb-16">
            <BridgeWidget 
              isWalletConnected={isWalletConnected}
              walletAddress={walletAddress}
            />
          </div>

          {/* Features Section */}
          <div id="features" className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-6">
                Why Choose <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">StarkBridge Pro</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Built for the next generation of DeFi with cutting-edge technology and user-centric design.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                  ⚡
                </div>
                <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
                <p className="text-gray-400">Bridge assets in minutes, not hours. Our optimized routing ensures the fastest possible transfers.</p>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                  🛡️
                </div>
                <h3 className="text-xl font-bold mb-2">Maximum Security</h3>
                <p className="text-gray-400">Built with cutting-edge STARK proofs and battle-tested smart contracts for uncompromising security.</p>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                  📈
                </div>
                <h3 className="text-xl font-bold mb-2">Lowest Fees</h3>
                <p className="text-gray-400">Save up to 90% on gas fees with our advanced transaction batching and Layer 2 optimization.</p>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                  🔄
                </div>
                <h3 className="text-xl font-bold mb-2">Production Ready</h3>
                <p className="text-gray-400">Full wallet integration, responsive design, and enterprise-grade reliability.</p>
              </div>
            </div>
          </div>

          {/* Supported Tokens */}
          <div id="analytics" className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Supported Tokens</h2>
            
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <div className="text-gray-400">Loading tokens...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tokens.map((token) => (
                  <div key={`${token.address}-${token.symbol}`} className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:bg-gray-800/70 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center font-bold">
                        {token.symbol.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg">{token.symbol}</div>
                        <div className="text-sm text-gray-400">{token.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {token.address.slice(0, 6)}...{token.address.slice(-4)}
                        </div>
                      </div>
                      {token.price && (
                        <div className="text-right">
                          <div className="font-bold text-lg text-green-400">
                            ${token.price.toFixed(2)}
                          </div>
                          {token.priceChange && (
                            <div className={`text-sm ${token.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {token.priceChange >= 0 ? '+' : ''}{token.priceChange.toFixed(2)}%
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <footer id="support" className="text-center mt-20 pt-12 border-t border-gray-800">
            <div className="text-2xl font-bold mb-4">
              Ready to <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Bridge</span>?
            </div>
            <p className="text-gray-400 mb-6">
              Join thousands of users who trust StarkBridge Pro for their cross-chain needs.
            </p>
            <div className="flex items-center justify-center gap-4">
              <a href="#bridge" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors">
                Start Bridging
              </a>
              <a href="#docs" className="px-8 py-4 border border-gray-600 hover:bg-gray-800 rounded-lg font-medium transition-colors">
                View Docs
              </a>
            </div>
          </footer>
        </div>
      </main>
    </>
  )
}