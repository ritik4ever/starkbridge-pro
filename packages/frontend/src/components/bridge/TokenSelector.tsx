'use client'

import { useState } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTokens } from '@/hooks/useStats'
import { Token, ChainType } from '@starkbridge/shared'
import { formatAddress } from '@starkbridge/shared'
import Image from 'next/image'

interface TokenSelectorProps {
  selectedToken: Token | null
  onSelect: (token: Token) => void
  chainId: ChainType
}

export function TokenSelector({ selectedToken, onSelect, chainId }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const { data: tokens, isLoading } = useTokens(
    chainId === ChainType.ETHEREUM ? 1 : 
    chainId === ChainType.POLYGON ? 137 : 1,
    searchQuery
  )

  const filteredTokens = tokens?.filter(token =>
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between h-12"
      >
        {selectedToken ? (
          <div className="flex items-center gap-3">
            <Image
              src={selectedToken.logoUri || '/default-token.png'}
              alt={selectedToken.symbol}
              width={24}
              height={24}
              className="rounded-full"
            />
            <div className="text-left">
              <div className="font-medium">{selectedToken.symbol}</div>
              <div className="text-xs text-muted-foreground">
                {selectedToken.name}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground">Select token</span>
        )}
        <ChevronDown className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-card border border-border rounded-lg shadow-lg max-h-80 overflow-hidden">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-60">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Loading tokens...
              </div>
            ) : filteredTokens.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
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
                  className="w-full p-3 hover:bg-muted/50 flex items-center gap-3 transition-colors"
                >
                  <Image
                    src={token.logoUri || '/default-token.png'}
                    alt={token.symbol}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{token.symbol}</div>
                    <div className="text-sm text-muted-foreground">
                      {token.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatAddress(token.address)}
                    </div>
                  </div>
                  {token.price && (
                    <div className="text-right">
                      <div className="font-medium">${token.price.toFixed(2)}</div>
                      <div className={`text-sm ${
                        (token.priceChange || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {(token.priceChange || 0) >= 0 ? '+' : ''}
                        {(token.priceChange || 0).toFixed(2)}%
                      </div>
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}