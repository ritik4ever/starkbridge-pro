'use client'

import { useState, useEffect } from 'react'

interface BridgeWidgetProps {
  isWalletConnected: boolean
  walletAddress: string
}

export function BridgeWidget({ isWalletConnected, walletAddress }: BridgeWidgetProps) {
  const [tokens, setTokens] = useState<any[]>([])
  const [selectedToken, setSelectedToken] = useState<any>(null)
  const [amount, setAmount] = useState('1.0')
  const [estimate, setEstimate] = useState<any>(null)
  const [isEstimating, setIsEstimating] = useState(false)
  const [fromChain, setFromChain] = useState('ethereum')
  const [toChain, setToChain] = useState('starknet')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [slippage, setSlippage] = useState(2)

  useEffect(() => {
    fetchTokens()
  }, [])

  const fetchTokens = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/tokens')
      const data = await response.json()
      if (data.success) {
        setTokens(data.data.tokens)
        if (data.data.tokens.length > 0) {
          setSelectedToken(data.data.tokens[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch tokens:', error)
    }
  }

  const getEstimate = async () => {
    if (!amount || parseFloat(amount) <= 0 || !selectedToken) return
    
    setIsEstimating(true)
    try {
      const response = await fetch('http://localhost:4000/api/bridge/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromChain,
          toChain,
          tokenAddress: selectedToken.address,
          amount: (parseFloat(amount) * Math.pow(10, selectedToken.decimals)).toString()
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
    const temp = fromChain
    setFromChain(toChain)
    setToChain(temp)
    setEstimate(null)
  }

  const executeBridge = async () => {
    if (!isWalletConnected) {
      alert('Please connect your wallet first!')
      return
    }

    if (!selectedToken || !amount || parseFloat(amount) <= 0) {
      alert('Please select a token and enter a valid amount!')
      return
    }

    // This would integrate with actual wallet signing
    alert(`Bridge transaction initiated!\n\nFrom: ${fromChain}\nTo: ${toChain}\nToken: ${selectedToken.symbol}\nAmount: ${amount}\nWallet: ${walletAddress}`)
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Bridge Assets</h2>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            ⚙️
          </button>
        </div>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Slippage Tolerance</label>
                <div className="flex gap-2 mt-2">
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
                </div>
              </div>
            </div>
          </div>
        )}

        {/* From Section */}
        <div className="space-y-4 mb-4">
          <div className="p-4 bg-gray-700/50 rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-400">From</span>
              <div className="flex items-center gap-2 bg-gray-600 rounded-lg px-3 py-1">
                <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
                <span className="text-sm font-medium capitalize">{fromChain}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {/* Token Selector */}
              <div className="relative">
                <select
                  value={selectedToken?.address || ''}
                  onChange={(e) => {
                    const token = tokens.find(t => t.address === e.target.value)
                    setSelectedToken(token)
                    setEstimate(null)
                  }}
                  className="w-full bg-gray-600 rounded-lg px-4 py-3 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Token</option>
                  {tokens.map((token) => (
                    <option key={token.address} value={token.address}>
                      {token.symbol} - {token.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Amount Input */}
              <input 
                type="number" 
                placeholder="0.0" 
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  setEstimate(null)
                }}
                className="bg-gray-600 rounded-lg px-4 py-3 text-xl font-bold w-full outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Balance Display */}
              {isWalletConnected && selectedToken && (
                <div className="text-sm text-gray-400">
                  Balance: 10.5 {selectedToken.symbol} {/* Mock balance */}
                  <button className="ml-2 text-blue-400 hover:text-blue-300">MAX</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            onClick={swapChains}
            className="bg-gray-700 hover:bg-gray-600 rounded-full p-3 transition-colors"
          >
            ↕️
          </button>
        </div>

        {/* To Section */}
        <div className="space-y-4 mt-4 mb-6">
          <div className="p-4 bg-gray-700/50 rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-400">To</span>
              <div className="flex items-center gap-2 bg-gray-600 rounded-lg px-3 py-1">
                <span className="w-4 h-4 bg-purple-500 rounded-full"></span>
                <span className="text-sm font-medium capitalize">{toChain}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="text-2xl font-bold">
                {estimate ? parseFloat(estimate.amountOut).toFixed(6) : '0.000000'}
              </div>
              <div className="text-sm text-gray-400">
                {selectedToken?.symbol} on {toChain}
              </div>
            </div>
          </div>
        </div>

        {/* Get Estimate Button */}
        <button 
          onClick={getEstimate}
          disabled={isEstimating || !selectedToken || !amount || parseFloat(amount) <= 0}
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

        {/* Bridge Details */}
        {estimate && (
          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
            <h3 className="font-medium mb-3">Bridge Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Amount Out:</span>
                <span>{parseFloat(estimate.amountOut).toFixed(6)} {selectedToken?.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Network Fee:</span>
                <span>{estimate.fees.networkFee} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Bridge Fee:</span>
                <span>{parseFloat(estimate.fees.bridgeFee).toFixed(6)} {selectedToken?.symbol}</span>
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
            </div>
          </div>
        )}

        {/* Execute Bridge Button */}
        <button
          onClick={executeBridge}
          disabled={!estimate}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg py-4 font-medium transition-colors text-lg"
        >
          {!isWalletConnected
            ? 'Connect Wallet to Bridge'
            : !selectedToken
            ? 'Select Token'
            : !amount
            ? 'Enter Amount'
            : !estimate
            ? 'Get Estimate First'
            : 'Execute Bridge'
          }
        </button>
      </div>
    </div>
  )
}