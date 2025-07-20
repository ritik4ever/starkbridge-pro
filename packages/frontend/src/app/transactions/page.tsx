'use client'

import { useState, useEffect } from 'react'
import { Header } from '../../components/Header'

interface Transaction {
  id: string
  fromChain: string
  toChain: string
  tokenSymbol: string
  amount: string
  status: string
  txHash?: string
  createdAt: string
  estimatedTime: number
  actualTime?: number
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      // Mock data - replace with actual API call
      const mockTransactions: Transaction[] = [
        {
          id: 'tx_1',
          fromChain: 'ethereum',
          toChain: 'starknet',
          tokenSymbol: 'ETH',
          amount: '1.5',
          status: 'COMPLETED',
          txHash: '0x123...abc',
          createdAt: '2024-01-15T10:30:00Z',
          estimatedTime: 900,
          actualTime: 850
        },
        {
          id: 'tx_2',
          fromChain: 'starknet',
          toChain: 'ethereum',
          tokenSymbol: 'USDC',
          amount: '1000',
          status: 'PROCESSING',
          txHash: '0x456...def',
          createdAt: '2024-01-15T11:15:00Z',
          estimatedTime: 1800
        },
        {
          id: 'tx_3',
          fromChain: 'ethereum',
          toChain: 'polygon',
          tokenSymbol: 'USDT',
          amount: '500',
          status: 'FAILED',
          txHash: '0x789...ghi',
          createdAt: '2024-01-14T15:45:00Z',
          estimatedTime: 600,
          actualTime: 0
        }
      ]
      setTransactions(mockTransactions)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-400 bg-green-400/20'
      case 'PROCESSING':
        return 'text-yellow-400 bg-yellow-400/20'
      case 'FAILED':
        return 'text-red-400 bg-red-400/20'
      default:
        return 'text-gray-400 bg-gray-400/20'
    }
  }

  const filteredTransactions = transactions.filter(tx => {
    const matchesFilter = filter === 'all' || tx.status.toLowerCase() === filter
    const matchesSearch = searchTerm === '' || 
      tx.tokenSymbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.txHash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Transaction History</h1>
            <p className="text-gray-300">Track all your bridge transactions across different networks</p>
          </div>

          {/* Filters */}
          <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {['all', 'completed', 'processing', 'failed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                      filter === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search by token, hash, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <div className="text-gray-400">Loading transactions...</div>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-4">No transactions found</div>
                <a href="/" className="text-blue-400 hover:text-blue-300">
                  Start your first bridge transaction →
                </a>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-900/50">
                      <th className="text-left p-4 font-medium text-gray-400">Transaction</th>
                      <th className="text-left p-4 font-medium text-gray-400">Route</th>
                      <th className="text-left p-4 font-medium text-gray-400">Amount</th>
                      <th className="text-left p-4 font-medium text-gray-400">Status</th>
                      <th className="text-left p-4 font-medium text-gray-400">Time</th>
                      <th className="text-left p-4 font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors">
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{tx.id}</div>
                            <div className="text-sm text-gray-400">
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </div>
                            {tx.txHash && (
                              <div className="text-xs text-blue-400 font-mono">
                                {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-6)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="capitalize">{tx.fromChain}</span>
                            <span>→</span>
                            <span className="capitalize">{tx.toChain}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">
                            {tx.amount} {tx.tokenSymbol}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            {tx.actualTime ? (
                              <span className="text-green-400">
                                {Math.floor(tx.actualTime / 60)}m {tx.actualTime % 60}s
                              </span>
                            ) : (
                              <span className="text-gray-400">
                                Est. {Math.floor(tx.estimatedTime / 60)}m
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {tx.txHash && (
                              <button className="text-blue-400 hover:text-blue-300 text-sm">
                                View on Explorer
                              </button>
                            )}
                            {tx.status === 'FAILED' && (
                              <button className="text-yellow-400 hover:text-yellow-300 text-sm">
                                Retry
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-lg p-6">
              <div className="text-2xl font-bold mb-2">
                {transactions.filter(tx => tx.status === 'COMPLETED').length}
              </div>
              <div className="text-sm text-gray-400">Completed</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-lg p-6">
              <div className="text-2xl font-bold mb-2">
                {transactions.reduce((sum, tx) => 
                  tx.status === 'COMPLETED' ? sum + parseFloat(tx.amount) : sum, 0
                ).toFixed(2)}
              </div>
              <div className="text-sm text-gray-400">Total Volume</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-lg p-6">
              <div className="text-2xl font-bold mb-2">
                {transactions.filter(tx => tx.actualTime).length > 0 
                  ? Math.floor(
                      transactions
                        .filter(tx => tx.actualTime)
                        .reduce((sum, tx) => sum + (tx.actualTime || 0), 0) / 
                      transactions.filter(tx => tx.actualTime).length / 60
                    )
                  : 0
                }m
              </div>
              <div className="text-sm text-gray-400">Avg. Time</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-lg p-6">
              <div className="text-2xl font-bold mb-2">
                {transactions.length > 0 
                  ? ((transactions.filter(tx => tx.status === 'COMPLETED').length / transactions.length) * 100).toFixed(1)
                  : 0
                }%
              </div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}