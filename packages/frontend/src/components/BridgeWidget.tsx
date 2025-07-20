'use client'

import { useState, useEffect } from 'react'
import { TokenSelector } from './TokenSelector'

interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  chainId: number
  price?: number
}

interface BridgeWidgetProps {
  isWalletConnected: boolean
  walletAddress: string
}

export function BridgeWidget({ isWalletConnected, walletAddress }: BridgeWidgetProps) {
  const [fromToken, setFromToken] = useState<Token | null>(null)
  const [toToken, setToToken] = useState<Token | null>(null)
  const [amount, setAmount] = useState('')
  const [estimate, setEstimate] = useState<any>(null)
  const [isEstimating, setIsEstimating] = useState(false)
  const [fromChain, setFromChain] = useState('ethereum')
  const [toChain, setToChain] = useState('starknet')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [slippage, setSlippage] = useState(2)
  const [gasPrice, setGasPrice] = useState('standard')
  const [bridgeRoute, setBridgeRoute] = useState('fastest')

  useEffect(() => {
    if (estimate) {
      getEstimate()
    }
  }, [fromToken, toToken, amount, slippage, gasPrice])

  const getEstimate = async () => {
    if (!amount || parseFloat(amount) <= 0 || !fromToken) return
    
    setIsEstimating(true)
    try {
      const response = await fetch('http://localhost:4000/api/bridge/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromChain,
          toChain,
          tokenAddress: fromToken.address,
          amount: (parseFloat(amount) * Math.pow(10, fromToken.decimals)).toString(),
          slippage,
          gasPrice
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

  const swapChains = () => {
    const tempChain = fromChain
    const tempToken = fromToken
    
    setFromChain(toChain)
    setToChain(tempChain)
    setFromToken(toToken)
    setToToken(tempToken)
    setEstimate(null)
  }

  const executeBridge = async () => {
    if (!isWalletConnected) {
      alert('Please connect your wallet first!')
      return
    }

    if (!fromToken || !amount || parseFloat(amount) <= 0) {
      alert('Please select a token and enter a valid amount!')
      return
    }

    try {
      // Create bridge transaction
      const response = await fetch('http://localhost:4000/api/bridge/transactions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          fromChain,
          toChain,
          tokenAddress: fromToken.address,
          amount: (parseFloat(amount) * Math.pow(10, fromToken.decimals)).toString(),
          slippage
        })
      })

      const data = await response.json()
      
      if (data.success) {
        alert(`Bridge transaction created!\n\nTransaction ID: ${data.data.id}\nStatus: ${data.data.status}`)
        
        // Reset form
        setAmount('')
        setEstimate(null)
      } else {
        alert(`Transaction failed: ${data.message}`)
      }
    } catch (error) {
      console.error('Bridge execution failed:', error)
      alert('Transaction failed. Please try again.')
    }
  }

  const chains = [
    { id: 'ethereum', name: 'Ethereum', color: 'bg-blue-500' },
    { id: 'starknet', name: 'StarkNet', color: 'bg-purple-500' },
    { id: 'polygon', name: 'Polygon', color: 'bg-purple-600' },
    { id: 'arbitrum', name: 'Arbitrum', color: 'bg-blue-600' },
  ]

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Bridge Assets</h2>
          <div className="flex items-center gap-2">
            <select
              value={bridgeRoute}
              onChange={(e) => setBridgeRoute(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
            >
              <option value="fastest">Fastest</option>
              <option value="cheapest">Cheapest</option>
              <option value="safest">Safest</option>
            </select>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              ⚙️
            </button>
          </div>
        </div>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="mb-6 p-4 bg-gray-700/50 rounded-lg space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">Slippage Tolerance</label>
              <div className="flex gap-2">
                {[0.5, 1, 2, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => setSlippage(value)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      slippage === value 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  >
                    {value}%
                  </button>
                ))}
                <input
                  type="number"
                  value={slippage}
                  onChange={(e) => setSlippage(parseFloat(e.target.value) || 0)}
                  className="w-16 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm"
                  step="0.1"
                  min="0.1"
                  max="50"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">Gas Price</label>
              <div className="flex gap-2">
                {[
                  { value: 'slow', label: 'Slow' },
                  { value: 'standard', label: 'Standard' },
                  { value: 'fast', label: 'Fast' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setGasPrice(option.value)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      gasPrice === option.value 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* From Section */}
        <div className="space-y-4 mb-4">
          <div className="p-4 bg-gray-700/50 rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-400">From</span>
              <select
                value={fromChain}
                onChange={(e) => setFromChain(e.target.value)}
                className="bg-gray-600 border border-gray-500 rounded px-3 py-1 text-sm"
              >
                {chains.map((chain) => (
                  <option key={chain.id} value={chain.id}>
                    {chain.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-3">
              <TokenSelector
                selectedToken={fromToken}
                onSelect={setFromToken}
                chainType={fromChain}
                label=""
              />
              
              <div className="relative">
                <input 
                  type="number" 
                  placeholder="0.0" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-gray-600 rounded-lg px-4 py-3 text-xl font-bold w-full outline-none focus:ring-2 focus:ring-blue-500 pr-16"
                />
                <button
                  onClick={() => setAmount('10.5')} // Mock max balance
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  MAX
                </button>
              </div>

              {/* Balance Display */}
              {isWalletConnected && fromToken && (
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Balance: 10.5 {fromToken.symbol}</span>
                  {fromToken.price && (
                    <span>≈ ${(parseFloat(amount || '0') * fromToken.price).toFixed(2)}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            onClick={swapChains}
            className="bg-gray-700 hover:bg-gray-600 rounded-full p-3 transition-colors border-4 border-gray-800"
          >
            ↕️
          </button>
        </div>

        {/* To Section */}
        <div className="space-y-4 mt-4 mb-6">
          <div className="p-4 bg-gray-700/50 rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-400">To</span>
              <select
                value={toChain}
                onChange={(e) => setToChain(e.target.value)}
                className="bg-gray-600 border border-gray-500 rounded px-3 py-1 text-sm"
              >
                {chains.filter(chain => chain.id !== fromChain).map((chain) => (
                  <option key={chain.id} value={chain.id}>
                    {chain.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-3">
              <div className="bg-gray-600 rounded-lg px-4 py-3 min-h-[52px] flex items-center">
                {toToken ? (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center font-bold text-xs">
                      {toToken.symbol.charAt(0)}
                    </div>
                    <span className="font-medium">{toToken.symbol}</span>
                  </div>
                ) : (
                  <span className="text-gray-400">Output token</span>
                )}
              </div>
              
              <div className="text-2xl font-bold">
                {estimate ? parseFloat(estimate.amountOut).toFixed(6) : '0.000000'}
              </div>
              
              {estimate && toToken?.price && (
                <div className="text-sm text-gray-400">
                  ≈ ${(parseFloat(estimate.amountOut) * toToken.price).toFixed(2)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Auto-estimate when inputs change */}
        {amount && fromToken && parseFloat(amount) > 0 && !estimate && (
          <button 
            onClick={getEstimate}
            disabled={isEstimating}
            className="w-full bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg py-3 font-medium transition-colors flex items-center justify-center gap-2 mb-4"
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
        )}

        {/* Bridge Details */}
        {estimate && (
          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
            <h3 className="font-medium mb-3 flex items-center justify-between">
              <span>Bridge Details</span>
              <span className="text-sm text-gray-400">Route: {bridgeRoute}</span>
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Amount Out:</span>
                <span>{parseFloat(estimate.amountOut).toFixed(6)} {fromToken?.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Exchange Rate:</span>
                <span>1 {fromToken?.symbol} = {(parseFloat(estimate.amountOut) / parseFloat(amount || '1')).toFixed(6)} {fromToken?.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Network Fee:</span>
                <span>{estimate.fees.networkFee} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Bridge Fee:</span>
                <span>{parseFloat(estimate.fees.bridgeFee).toFixed(6)} {fromToken?.symbol}</span>
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
                <span className="text-gray-400">Slippage:</span>
                <span>{slippage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Price Impact:</span>
                <span className="text-green-400">{'<0.01%'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Execute Bridge Button */}
        <button
          onClick={executeBridge}
          disabled={!estimate || isEstimating}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg py-4 font-medium transition-colors text-lg"
        >
          {!isWalletConnected
            ? 'Connect Wallet to Bridge'
            : !fromToken
            ? 'Select Token'
            : !amount
            ? 'Enter Amount'
            : isEstimating
            ? 'Getting Estimate...'
            : !estimate
            ? 'Get Estimate First'
            : `Bridge ${fromToken.symbol}`
          }
        </button>

        {/* Recent Transactions */}
        {isWalletConnected && (
          <div className="mt-6 p-4 bg-gray-700/30 rounded-lg">
            <div className="text-sm font-medium text-gray-400 mb-2">Recent Transactions</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>ETH → STRK</span>
                <span className="text-green-400">Completed</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>USDC → USDC</span>
                <span className="text-yellow-400">Processing</span>
              </div>
            </div>
            <button className="text-blue-400 hover:text-blue-300 text-sm mt-2">
              View All Transactions →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}