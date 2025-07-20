'use client'

import { useState, useCallback } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { bridgeApi } from '@/lib/api'
import { ChainType, Token, BridgeTransaction } from '@starkbridge/shared'
import { toast } from 'react-hot-toast'

export function useBridge() {
  const [fromChain, setFromChain] = useState<ChainType>(ChainType.ETHEREUM)
  const [toChain, setToChain] = useState<ChainType>(ChainType.STARKNET)
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const [amount, setAmount] = useState('')
  const [estimate, setEstimate] = useState<any>(null)
  const [transaction, setTransaction] = useState<BridgeTransaction | null>(null)

  // Get bridge estimate
  const { mutate: getEstimate, isLoading: isEstimating } = useMutation({
    mutationFn: () => bridgeApi.estimate({
      fromChain,
      toChain,
      tokenAddress: selectedToken!.address,
      amount
    }),
    onSuccess: (response) => {
      setEstimate(response.data)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to get estimate')
    }
  })

  // Execute bridge transaction
  const { mutate: executeBridge, isLoading: isBridging } = useMutation({
    mutationFn: (slippage: number) => bridgeApi.createTransaction({
      fromChain,
      toChain,
      tokenAddress: selectedToken!.address,
      amount,
      slippage
    }),
    onSuccess: (response) => {
      setTransaction(response.data)
      
      // Start processing the transaction
      processTransaction(response.data.id)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Bridge transaction failed')
    }
  })

  // Process transaction
  const { mutate: processTransaction } = useMutation({
    mutationFn: (transactionId: string) => bridgeApi.processTransaction(transactionId),
    onSuccess: () => {
      toast.success('Transaction processing started')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to process transaction')
    }
  })

  const swapChains = useCallback(() => {
    const temp = fromChain
    setFromChain(toChain)
    setToChain(temp)
    setEstimate(null)
  }, [fromChain, toChain])

  const resetForm = useCallback(() => {
    setSelectedToken(null)
    setAmount('')
    setEstimate(null)
    setTransaction(null)
  }, [])

  return {
    fromChain,
    toChain,
    selectedToken,
    amount,
    estimate,
    transaction,
    isLoading: isEstimating || isBridging,
    setFromChain,
    setToChain,
    setSelectedToken,
    setAmount,
    getEstimate,
    executeBridge,
    swapChains,
    resetForm
  }
}