'use client'

import { useState, useEffect } from 'react'

interface Token {
  symbol: string
  name: string
  address: string
  price?: number
  priceChange?: number
}

interface EstimateData {
  amountOut: string
  fees: {
    totalFee: string
    networkFee: string
    bridgeFee: string
  }
  estimatedTime: number
  route: Array<{
    from: string
    to: string
    bridge: string
  }>
}

export default function HomePage() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [estimate, setEstimate] = useState<EstimateData | null>(null)
  const [amount, setAmount] = useState('1.0')
  const [isEstimating, setIsEstimating] = useState(false)

  useEffect(() => {
    fetchTokens()
  }, [])

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

  const getEstimate = async () => {
    if (!amount || parseFloat(amount) <= 0) return
    
    setIsEstimating(true)
    try {
      const response = await fetch('http://localhost:4000/api/bridge/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromChain: 'ethereum',
          toChain: 'starknet',
          tokenAddress: '0x0000000000000000000000000000000000000000',
          amount: (parseFloat(amount) * 1e18).toString() // Convert to wei
        })
      })
      const data = await response.json()
      if (data.success) {
        setEstimate(data.data)
      }
    } catch (error) {
      console.error('Failed to get estimate:', error)
    } finally {
      setIsEstimating(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            StarkBridge Pro
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            The most advanced platform for bridging assets between Ethereum and StarkNet. 
            Fast, secure, and cost-effective.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors">
              Start Bridging
            </button>
            <button className="px-8 py-4 border border-gray-600 hover:bg-gray-800 rounded-lg font-medium transition-colors">
              View Analytics
            </button>
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
        <div className="max-w-2xl mx-auto bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Bridge Assets</h2>
            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              ⚙️
            </button>
          </div>
          
          <div className="space-y-6">
            {/* From Section */}
            <div className="p-4 bg-gray-700/50 rounded-xl">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-400">From</span>
                <div className="flex items-center gap-2 bg-gray-600 rounded-lg px-3 py-1">
                  <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
                  <span className="text-sm font-medium">Ethereum</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-gray-600 rounded-lg p-3">
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                    Ξ
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">ETH</div>
                    <div className="text-sm text-gray-400">Ethereum</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">$2,000</div>
                    <div className="text-sm text-green-400">+5.2%</div>
                  </div>
                </div>
                
                <input 
                  type="text" 
                  placeholder="1.0" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-gray-600 rounded-lg px-4 py-3 text-2xl font-bold w-full outline-none"
                />
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <button className="bg-gray-700 hover:bg-gray-600 rounded-full p-3 transition-colors">
                ↕️
              </button>
            </div>

            {/* To Section */}
            <div className="p-4 bg-gray-700/50 rounded-xl">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-400">To</span>
                <div className="flex items-center gap-2 bg-gray-600 rounded-lg px-3 py-1">
                  <span className="w-4 h-4 bg-purple-500 rounded-full"></span>
                  <span className="text-sm font-medium">StarkNet</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="text-2xl font-bold">
                  {estimate ? parseFloat(estimate.amountOut).toFixed(6) : '0.000000'}
                </div>
                <div className="text-sm text-gray-400">ETH on StarkNet</div>
              </div>
            </div>

            {/* Estimate Button */}
            <button 
              onClick={getEstimate}
              disabled={isEstimating || !amount || parseFloat(amount) <= 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg py-4 font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isEstimating ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Getting Estimate...
                </>
              ) : (
                'Get Estimate'
              )}
            </button>

            {/* Estimate Details */}
            {estimate && (
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="font-medium mb-3">Bridge Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount Out:</span>
                    <span>{parseFloat(estimate.amountOut).toFixed(6)} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network Fee:</span>
                    <span>{estimate.fees.networkFee} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bridge Fee:</span>
                    <span>{parseFloat(estimate.fees.bridgeFee).toFixed(6)} ETH</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-600 pt-2">
                    <span className="text-gray-400">Total Fee:</span>
                    <span>{parseFloat(estimate.fees.totalFee).toFixed(6)} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Est. Time:</span>
                    <span>{Math.floor(estimate.estimatedTime / 60)} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Route:</span>
                    <span>{estimate.route[0]?.bridge}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-6">
              Why Choose <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">StarkBridge Pro</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built for the next generation of DeFi with cutting-edge technology and user-centric design.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                ⚡
              </div>
              <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-gray-400">Bridge assets in minutes, not hours. Our optimized routing ensures the fastest possible transfers.</p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                🛡️
              </div>
              <h3 className="text-xl font-bold mb-2">Maximum Security</h3>
              <p className="text-gray-400">Built with cutting-edge STARK proofs and battle-tested smart contracts for uncompromising security.</p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                📈
              </div>
              <h3 className="text-xl font-bold mb-2">Lowest Fees</h3>
              <p className="text-gray-400">Save up to 90% on gas fees with our advanced transaction batching and Layer 2 optimization.</p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                🔄
              </div>
              <h3 className="text-xl font-bold mb-2">Cross-Chain Support</h3>
              <p className="text-gray-400">Seamlessly bridge between Ethereum, StarkNet, Polygon, and Arbitrum in a single interface.</p>
            </div>
          </div>
        </div>

        {/* Supported Tokens */}
        <div className="max-w-6xl mx-auto">
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

        {/* Footer */}
        <footer className="text-center mt-20 pt-12 border-t border-gray-800">
          <div className="text-2xl font-bold mb-4">
            Ready to <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Bridge</span>?
          </div>
          <p className="text-gray-400 mb-6">
            Join thousands of users who trust StarkBridge Pro for their cross-chain needs.
          </p>
          <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors">
            Connect Wallet
          </button>
        </footer>
      </div>
    </main>
  )
}