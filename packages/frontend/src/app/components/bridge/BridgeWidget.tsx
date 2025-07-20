'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpDown, Settings, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TokenSelector } from './TokenSelector'
import { ChainSelector } from './ChainSelector'
import { AmountInput } from './AmountInput'
import { BridgePreview } from './BridgePreview'
import { TransactionStatus } from './TransactionStatus'
import { useBridge } from '@/hooks/useBridge'
import { useAuth } from '@/components/providers/AuthProvider'
import { ChainType } from '@starkbridge/shared'
import { toast } from 'react-hot-toast'

export function BridgeWidget() {
  const { isAuthenticated, login } = useAuth()
  const {
    fromChain,
    toChain,
    selectedToken,
    amount,
    estimate,
    isLoading,
    transaction,
    setFromChain,
    setToChain,
    setSelectedToken,
    setAmount,
    getEstimate,
    executeBridge
  } = useBridge()

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [slippage, setSlippage] = useState(2)

  const canBridge = isAuthenticated && selectedToken && amount && parseFloat(amount) > 0

  const handleSwapChains = () => {
    const temp = fromChain
    setFromChain(toChain)
    setToChain(temp)
  }

  const handleBridge = async () => {
    if (!isAuthenticated) {
      await login()
      return
    }

    if (!canBridge) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      await executeBridge(slippage)
      toast.success('Bridge transaction initiated!')
    } catch (error: any) {
      toast.error(error.message || 'Bridge transaction failed')
    }
  }

  // Get estimate when inputs change
  useEffect(() => {
    if (selectedToken && amount && parseFloat(amount) > 0) {
      const timer = setTimeout(() => {
        getEstimate()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [fromChain, toChain, selectedToken, amount])

  return (
    <div className="w-full max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/50 backdrop-blur-lg border border-border rounded-2xl p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Bridge Assets</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Advanced Settings */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 p-4 bg-muted/50 rounded-lg"
            >
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Slippage Tolerance</label>
                  <div className="flex gap-2 mt-2">
                    {[0.5, 1, 2, 5].map((value) => (
                      <Button
                        key={value}
                        variant={slippage === value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSlippage(value)}
                      >
                        {value}%
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* From Section */}
        <div className="space-y-4 mb-4">
          <div className="p-4 bg-muted/30 rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-muted-foreground">From</span>
              <ChainSelector
                selectedChain={fromChain}
                onSelect={setFromChain}
                exclude={[toChain]}
              />
            </div>
            
            <div className="space-y-3">
              <TokenSelector
                selectedToken={selectedToken}
                onSelect={setSelectedToken}
                chainId={fromChain}
              />
              
              <AmountInput
                value={amount}
                onChange={setAmount}
                token={selectedToken}
                chainId={fromChain}
              />
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSwapChains}
            className="rounded-full h-10 w-10 p-0"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        {/* To Section */}
        <div className="space-y-4 mt-4 mb-6">
          <div className="p-4 bg-muted/30 rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-muted-foreground">To</span>
              <ChainSelector
                selectedChain={toChain}
                onSelect={setToChain}
                exclude={[fromChain]}
              />
            </div>
            
            <div className="space-y-3">
              <div className="text-2xl font-bold">
                {estimate?.amountOut || '0.00'}
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedToken?.symbol} on {toChain}
              </div>
            </div>
          </div>
        </div>

        {/* Bridge Preview */}
        {estimate && (
          <BridgePreview
            estimate={estimate}
            token={selectedToken}
            className="mb-6"
          />
        )}

        {/* Bridge Button */}
        <Button
          onClick={handleBridge}
          disabled={!canBridge || isLoading}
          size="lg"
          className="w-full"
        >
          {isLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
          {!isAuthenticated
            ? 'Connect Wallet'
            : !selectedToken
            ? 'Select Token'
            : !amount
            ? 'Enter Amount'
            : 'Bridge Assets'
          }
        </Button>

        {/* Transaction Status */}
        {transaction && (
          <TransactionStatus
            transaction={transaction}
            className="mt-6"
          />
        )}
      </motion.div>
    </div>
  )
}