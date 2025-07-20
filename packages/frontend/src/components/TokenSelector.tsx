'use client'

import { useState, useEffect } from 'react'

interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  chainId: number
  logoUri?: string
  price?: number
  priceChange?: number
  volume24h?: string
  isPopular?: boolean
}

interface TokenSelectorProps {
  selectedToken: Token | null
  onSelect: (token: Token) => void
  chainType: string
  label: string
}

export function TokenSelector({ selectedToken, onSelect, chainType, label }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [tokens, setTokens] = useState<Token[]>([])
  const [popularTokens, setPopularTokens] = useState<Token[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTokens()
  }, [chainType])

  const fetchTokens = async () => {
    try {
      setIsLoading(true)
      const chainId = chainType === 'ethereum' ? 1 : 393402133025997372
      const response = await fetch(`http://localhost:4000/api/tokens?chainId=${chainId}&limit=100`)
      const data = await response.json()
      
      if (data.success) {
        setTokens(data.data.tokens)
        // Set popular tokens (top 5 by volume)
        const popular = data.data.tokens
          .filter((t: Token) => t.volume24h)
          .sort((a: Token, b: Token) => parseFloat(b.volume24h || '0') - parseFloat(a.volume24h || '0'))
          .slice(0, 5)
        setPopularTokens(popular)
      }
    } catch (error) {
      console.error('Failed to fetch tokens:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTokens = tokens.filter(token =>
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`
    if (price < 1) return `$${price.toFixed(4)}`
    return `$${price.toFixed(2)}`
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
      
      {/* Selected Token Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg p-4 transition-colors flex items-center justify-between"
      >
        {selectedToken ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center font-bold text-sm">
              {selectedToken.symbol.charAt(0)}
            </div>
            <div className="text-left">
              <div className="font-medium">{selectedToken.symbol}</div>
              <div className="text-sm text-gray-400">{selectedToken.name}</div>
            </div>
          </div>
        ) : (
          <div className="text-gray-400">Select token</div>
        )}
        <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </div>
      </button>

      {/* Token Selection Modal */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl max-h-96 overflow-hidden">
          {/* Search Header */}
          <div className="p-4 border-b border-gray-600">
            <input
              type="text"
              placeholder="Search by name, symbol, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Popular Tokens */}
          {!searchQuery && popularTokens.length > 0 && (
            <div className="p-4 border-b border-gray-600">
              <div className="text-sm font-medium text-gray-400 mb-3">Popular Tokens</div>
              <div className="flex gap-2 flex-wrap">
                {popularTokens.map((token) => (
                  <button
                    key={token.address}
                    onClick={() => {
                      onSelect(token)
                      setIsOpen(false)
                      setSearchQuery('')
                    }}
                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 rounded-lg px-3 py-2 transition-colors"
                  >
                    <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-xs font-bold">
                      {token.symbol.charAt(0)}
                    </div>
                    <span className="text-sm font-medium">{token.symbol}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Token List */}
          <div className="overflow-y-auto max-h-64">
            {isLoading ? (
              <div className="p-4 text-center text-gray-400">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Loading tokens...
              </div>
            ) : filteredTokens.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                No tokens found
              </div>
            ) : (
              filteredTokens.map((token) => (
                <button
                  key={token.address}
                  onClick={() => {
                    onSelect(token)
                    setIsOpen(false)
                    setSearchQuery('')
                  }}
                  className="w-full p-4 hover:bg-gray-700 flex items-center gap-3 transition-colors border-b border-gray-700 last:border-b-0"
                >
                  <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center font-bold">
                    {token.symbol.charAt(0)}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{token.symbol}</div>
                    <div className="text-sm text-gray-400">{token.name}</div>
                    <div className="text-xs text-gray-500">
                      {token.address.slice(0, 6)}...{token.address.slice(-4)}
                    </div>
                  </div>
                  <div className="text-right">
                    {token.price && (
                      <>
                        <div className="font-medium">{formatPrice(token.price)}</div>
                        {token.priceChange && (
                          <div className={`text-sm ${
                            token.priceChange >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {token.priceChange >= 0 ? '+' : ''}
                            {token.priceChange.toFixed(2)}%
                          </div>
                        )}
                      </>
                    )}
                    {token.volume24h && (
                      <div className="text-xs text-gray-500">
                        Vol: ${parseFloat(token.volume24h).toLocaleString()}
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Add Custom Token */}
          <div className="p-4 border-t border-gray-600">
            <button className="w-full text-blue-400 hover:text-blue-300 text-sm transition-colors">
              + Add Custom Token
            </button>
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsOpen(false)
            setSearchQuery('')
          }}
        />
      )}
    </div>
  )
}