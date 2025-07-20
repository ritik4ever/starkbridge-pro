'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ChainType, getChainName } from '@starkbridge/shared'
import Image from 'next/image'

interface ChainSelectorProps {
  selectedChain: ChainType
  onSelect: (chain: ChainType) => void
  exclude?: ChainType[]
}

const chainLogos: Record<ChainType, string> = {
  [ChainType.ETHEREUM]: '/chains/ethereum.png',
  [ChainType.STARKNET]: '/chains/starknet.png',
  [ChainType.POLYGON]: '/chains/polygon.png',
  [ChainType.ARBITRUM]: '/chains/arbitrum.png'
}

const availableChains = [
  ChainType.ETHEREUM,
  ChainType.STARKNET,
  ChainType.POLYGON,
  ChainType.ARBITRUM
]

export function ChainSelector({ selectedChain, onSelect, exclude = [] }: ChainSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const filteredChains = availableChains.filter(chain => !exclude.includes(chain))

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Image
          src={chainLogos[selectedChain]}
          alt={getChainName(selectedChain)}
          width={20}
          height={20}
          className="rounded-full"
        />
        {getChainName(selectedChain)}
        <ChevronDown className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 z-50 mt-2 bg-card border border-border rounded-lg shadow-lg min-w-40">
          {filteredChains.map((chain) => (
            <button
              key={chain}
              onClick={() => {
                onSelect(chain)
                setIsOpen(false)
              }}
              className="w-full p-3 hover:bg-muted/50 flex items-center gap-3 transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              <Image
                src={chainLogos[chain]}
                alt={getChainName(chain)}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="font-medium">{getChainName(chain)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}