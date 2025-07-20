'use client'

import { useState, useEffect } from 'react'

interface HeaderProps {}

export function Header({}: HeaderProps) {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // Check if wallet is already connected
  useEffect(() => {
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

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        setIsConnecting(true)
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        })
        
        if (accounts.length > 0) {
          setWalletAddress(accounts[0])
          setIsWalletConnected(true)
          
          // Show success message
          alert(`Wallet connected successfully! Address: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`)
        }
      } catch (error) {
        console.error('Error connecting wallet:', error)
        alert('Failed to connect wallet. Please make sure MetaMask is installed.')
      } finally {
        setIsConnecting(false)
      }
    } else {
      alert('Please install MetaMask to connect your wallet!')
    }
  }

  const disconnectWallet = () => {
    setIsWalletConnected(false)
    setWalletAddress('')
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800/50 bg-gray-900/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              🌉 StarkBridge Pro
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#bridge" className="text-gray-300 hover:text-white transition-colors cursor-pointer">
              Bridge
            </a>
            <a href="#analytics" className="text-gray-300 hover:text-white transition-colors cursor-pointer">
              Analytics
            </a>
            <a href="#docs" className="text-gray-300 hover:text-white transition-colors cursor-pointer">
              Docs
            </a>
            <a href="#support" className="text-gray-300 hover:text-white transition-colors cursor-pointer">
              Support
            </a>
          </nav>

          {/* Wallet Connection */}
          <div className="hidden md:flex items-center space-x-4">
            {isWalletConnected ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">{formatAddress(walletAddress)}</span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="px-4 py-2 border border-gray-600 hover:bg-gray-800 rounded-lg transition-colors text-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <span>🔗</span>
                    <span>Connect Wallet</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <div className={`w-5 h-0.5 bg-white transition-all ${showMobileMenu ? 'rotate-45 translate-y-1' : ''}`}></div>
              <div className={`w-5 h-0.5 bg-white transition-all mt-1 ${showMobileMenu ? 'opacity-0' : ''}`}></div>
              <div className={`w-5 h-0.5 bg-white transition-all mt-1 ${showMobileMenu ? '-rotate-45 -translate-y-1' : ''}`}></div>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-800/50 bg-gray-900/95 backdrop-blur-lg">
            <div className="px-4 py-6 space-y-4">
              <a href="#bridge" className="block py-2 text-gray-300 hover:text-white transition-colors">
                Bridge
              </a>
              <a href="#analytics" className="block py-2 text-gray-300 hover:text-white transition-colors">
                Analytics
              </a>
              <a href="#docs" className="block py-2 text-gray-300 hover:text-white transition-colors">
                Docs
              </a>
              <a href="#support" className="block py-2 text-gray-300 hover:text-white transition-colors">
                Support
              </a>
              
              {/* Mobile Wallet Connection */}
              <div className="pt-4 border-t border-gray-800/50">
                {isWalletConnected ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">{formatAddress(walletAddress)}</span>
                    </div>
                    <button
                      onClick={disconnectWallet}
                      className="w-full px-4 py-2 border border-gray-600 hover:bg-gray-800 rounded-lg transition-colors text-sm"
                    >
                      Disconnect Wallet
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    {isConnecting ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <span>🔗</span>
                        <span>Connect Wallet</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}