'use client'

import { useState } from 'react'
import { Header } from '../../components/Header'

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('getting-started')

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: '🚀'
    },
    {
      id: 'bridging-guide',
      title: 'Bridging Guide',
      icon: '🌉'
    },
    {
      id: 'supported-tokens',
      title: 'Supported Tokens',
      icon: '🪙'
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      icon: '📚'
    },
    {
      id: 'security',
      title: 'Security',
      icon: '🛡️'
    },
    {
      id: 'faq',
      title: 'FAQ',
      icon: '❓'
    }
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'getting-started':
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold mb-4">Getting Started with StarkBridge Pro</h1>
            
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <h3 className="font-semibold mb-2">🎉 Welcome to StarkBridge Pro!</h3>
              <p className="text-gray-300">
                The most advanced platform for bridging assets between Ethereum and StarkNet. 
                This guide will help you get started with cross-chain transfers.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Prerequisites</h2>
              <ul className="space-y-2 text-gray-300">
                <li>• A compatible wallet (MetaMask, Argent, Braavos)</li>
                <li>• ETH for gas fees on Ethereum</li>
                <li>• Tokens you want to bridge</li>
                <li>• Basic understanding of Layer 2 networks</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Quick Start</h2>
              <div className="grid gap-4">
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold">1</div>
                    <h3 className="text-lg font-semibold">Connect Your Wallet</h3>
                  </div>
                  <p className="text-gray-300">Click "Connect Wallet" in the top right corner and select your preferred wallet.</p>
                </div>

                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold">2</div>
                    <h3 className="text-lg font-semibold">Select Tokens & Chains</h3>
                  </div>
                  <p className="text-gray-300">Choose the source and destination chains, then select the token you want to bridge.</p>
                </div>

                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold">3</div>
                    <h3 className="text-lg font-semibold">Enter Amount & Review</h3>
                  </div>
                  <p className="text-gray-300">Enter the amount, review the bridge details, and confirm the transaction.</p>
                </div>

                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold">4</div>
                    <h3 className="text-lg font-semibold">Track Progress</h3>
                  </div>
                  <p className="text-gray-300">Monitor your transaction progress in the transaction history section.</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'bridging-guide':
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold mb-4">Complete Bridging Guide</h1>
            
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Supported Bridge Routes</h2>
                <div className="grid gap-4">
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">Ethereum ↔ StarkNet</h3>
                    <ul className="text-gray-300 space-y-1">
                      <li>• Time: 15-30 minutes</li>
                      <li>• Fee: 0.3% + gas</li>
                      <li>• Security: Maximum (Native bridge)</li>
                    </ul>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">Ethereum ↔ Polygon</h3>
                    <ul className="text-gray-300 space-y-1">
                      <li>• Time: 5-10 minutes</li>
                      <li>• Fee: 0.1% + gas</li>
                      <li>• Security: High</li>
                    </ul>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">Ethereum ↔ Arbitrum</h3>
                    <ul className="text-gray-300 space-y-1">
                      <li>• Time: 10-15 minutes</li>
                      <li>• Fee: 0.2% + gas</li>
                      <li>• Security: High</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Bridge Settings</h2>
                <div className="space-y-4">
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">Slippage Tolerance</h3>
                    <p className="text-gray-300 mb-3">
                      Maximum price difference you're willing to accept. Higher slippage = higher chance of success but worse rate.
                    </p>
                    <div className="flex gap-2">
                      <div className="bg-gray-700 px-3 py-1 rounded text-sm">0.5% - Conservative</div>
                      <div className="bg-blue-600 px-3 py-1 rounded text-sm">2% - Recommended</div>
                      <div className="bg-gray-700 px-3 py-1 rounded text-sm">5% - Aggressive</div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">Gas Price</h3>
                    <p className="text-gray-300 mb-3">
                      Higher gas price = faster confirmation but higher cost.
                    </p>
                    <div className="flex gap-2">
                      <div className="bg-gray-700 px-3 py-1 rounded text-sm">Slow - Cheapest</div>
                      <div className="bg-blue-600 px-3 py-1 rounded text-sm">Standard - Balanced</div>
                      <div className="bg-gray-700 px-3 py-1 rounded text-sm">Fast - Fastest</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'supported-tokens':
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold mb-4">Supported Tokens</h1>
            
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
              <h3 className="font-semibold mb-2">⚠️ Always verify token addresses</h3>
              <p className="text-gray-300">
                Before bridging, double-check that you're using the correct token address to avoid loss of funds.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Major Tokens</h2>
                <div className="overflow-x-auto">
                  <table className="w-full bg-gray-800/50 border border-gray-700 rounded-lg">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left p-4">Token</th>
                        <th className="text-left p-4">Ethereum</th>
                        <th className="text-left p-4">StarkNet</th>
                        <th className="text-left p-4">Daily Volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-700">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs">Ξ</div>
                            <span>ETH</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-sm">0x0000...0000</td>
                        <td className="p-4 font-mono text-sm">0x049d...4dc7</td>
                        <td className="p-4">$1.2M</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs">U</div>
                            <span>USDC</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-sm">0xa0b8...0102</td>
                        <td className="p-4 font-mono text-sm">0x053c...68a8</td>
                        <td className="p-4">$5.8M</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs">T</div>
                            <span>USDT</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-sm">0xdac1...1ec7</td>
                        <td className="p-4 font-mono text-sm">0x068f...a8e5</td>
                        <td className="p-4">$3.2M</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">How to Add Custom Tokens</h2>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
                  <p className="text-gray-300">You can bridge any ERC-20 token by adding it manually:</p>
                  <ol className="list-decimal list-inside text-gray-300 space-y-2">
                    <li>Click "Add Custom Token" in the token selector</li>
                    <li>Enter the token contract address</li>
                    <li>Verify the token details (symbol, decimals)</li>
                    <li>Add to your token list</li>
                  </ol>
                  <div className="bg-red-500/20 border border-red-500/30 rounded p-3 mt-4">
                    <p className="text-sm">⚠️ <strong>Security Notice:</strong> Only add tokens from trusted sources. Malicious tokens can result in loss of funds.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'api-reference':
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold mb-4">API Reference</h1>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold mb-2">🔌 Base URL</h3>
              <code className="bg-gray-900 px-3 py-1 rounded">https://api.starkbridge.pro</code>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Authentication</h2>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <p className="text-gray-300 mb-3">Include your API key in the header:</p>
                  <pre className="bg-gray-900 p-3 rounded overflow-x-auto text-sm">
                    <code>{`curl -H "Authorization: Bearer YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     https://api.starkbridge.pro/v1/estimate`}</code>
                  </pre>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Endpoints</h2>
                
                <div className="space-y-4">
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-600 px-2 py-1 rounded text-xs font-mono">POST</span>
                      <code className="font-mono">/v1/bridge/estimate</code>
                    </div>
                    <p className="text-gray-300 mb-3">Get bridge estimate for a transaction</p>
                    <details className="mt-3">
                      <summary className="cursor-pointer text-blue-400 hover:text-blue-300">View Details</summary>
                      <div className="mt-3 space-y-3">
                        <div>
                          <h4 className="font-semibold mb-2">Request Body:</h4>
                          <pre className="bg-gray-900 p-3 rounded overflow-x-auto text-sm">
                            <code>{`{
  "fromChain": "ethereum",
  "toChain": "starknet",
  "tokenAddress": "0x...",
  "amount": "1000000000000000000"
}`}</code>
                          </pre>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Response:</h4>
                          <pre className="bg-gray-900 p-3 rounded overflow-x-auto text-sm">
                            <code>{`{
  "success": true,
  "data": {
    "amountOut": "997000000000000000",
    "fees": {
      "totalFee": "3000000000000000"
    },
    "estimatedTime": 900
  }
}`}</code>
                          </pre>
                        </div>
                      </div>
                    </details>
                  </div>

                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-green-600 px-2 py-1 rounded text-xs font-mono">GET</span>
                      <code className="font-mono">/v1/tokens</code>
                    </div>
                    <p className="text-gray-300">Get list of supported tokens</p>
                  </div>

                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-600 px-2 py-1 rounded text-xs font-mono">POST</span>
                      <code className="font-mono">/v1/bridge/transactions</code>
                    </div>
                    <p className="text-gray-300">Create a new bridge transaction</p>
                  </div>

                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-green-600 px-2 py-1 rounded text-xs font-mono">GET</span>
                      <code className="font-mono">/v1/bridge/transactions/:id</code>
                    </div>
                    <p className="text-gray-300">Get transaction status</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Rate Limits</h2>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <ul className="text-gray-300 space-y-2">
                    <li>• Free tier: 100 requests per hour</li>
                    <li>• Pro tier: 1,000 requests per hour</li>
                    <li>• Enterprise: Custom limits</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold mb-4">Security</h1>
            
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
              <h3 className="font-semibold mb-2">🛡️ Your Security is Our Priority</h3>
              <p className="text-gray-300">
                StarkBridge Pro implements multiple layers of security to protect your assets during cross-chain transfers.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Security Features</h2>
                <div className="grid gap-4">
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <span>🔐</span> Smart Contract Security
                    </h3>
                    <ul className="text-gray-300 space-y-1">
                      <li>• Audited by leading security firms</li>
                      <li>• Time-locked upgrades</li>
                      <li>• Multi-signature controls</li>
                      <li>• Formal verification</li>
                    </ul>
                  </div>

                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <span>⚡</span> STARK Proofs
                    </h3>
                    <ul className="text-gray-300 space-y-1">
                      <li>• Zero-knowledge cryptography</li>
                      <li>• Quantum-resistant</li>
                      <li>• Mathematical guarantees</li>
                      <li>• No trusted setup required</li>
                    </ul>
                  </div>

                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <span>🛡️</span> Bridge Security
                    </h3>
                    <ul className="text-gray-300 space-y-1">
                      <li>• Decentralized validation</li>
                      <li>• Fraud proofs</li>
                      <li>• Emergency pause mechanisms</li>
                      <li>• Rate limiting</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
                <div className="space-y-4">
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">✅ Do</h3>
                    <ul className="text-gray-300 space-y-1">
                      <li>• Always verify transaction details before confirming</li>
                      <li>• Use hardware wallets for large amounts</li>
                      <li>• Keep your wallet software updated</li>
                      <li>• Start with small test transactions</li>
                      <li>• Save transaction hashes for tracking</li>
                    </ul>
                  </div>

                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">❌ Don't</h3>
                    <ul className="text-gray-300 space-y-1">
                      <li>• Never share your private keys or seed phrase</li>
                      <li>• Don't bridge to unknown or unverified addresses</li>
                      <li>• Avoid using public WiFi for transactions</li>
                      <li>• Don't ignore security warnings</li>
                      <li>• Never bridge more than you can afford to lose</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Emergency Procedures</h2>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">If Something Goes Wrong</h3>
                  <ol className="list-decimal list-inside text-gray-300 space-y-2">
                    <li>Don't panic - most issues can be resolved</li>
                    <li>Check the transaction status on both chains</li>
                    <li>Wait for the full confirmation time</li>
                    <li>Contact support with your transaction hash</li>
                    <li>Never share sensitive information</li>
                  </ol>
                  
                  <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded">
                    <p className="text-sm">
                      <strong>24/7 Support:</strong> support@starkbridge.pro | 
                      <strong> Emergency:</strong> emergency@starkbridge.pro
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'faq':
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            
            <div className="space-y-4">
              {[
                {
                  q: "How long do bridge transactions take?",
                  a: "Bridge times vary by route: Ethereum↔StarkNet takes 15-30 minutes, Ethereum↔Polygon takes 5-10 minutes, and Ethereum↔Arbitrum takes 10-15 minutes. Times may be longer during high network congestion."
                },
                {
                  q: "What are the fees for bridging?",
                  a: "Fees consist of network gas fees plus a small bridge fee (0.1-0.3% depending on the route). The exact fee is shown before you confirm any transaction."
                },
                {
                  q: "Is StarkBridge Pro safe to use?",
                  a: "Yes, StarkBridge Pro uses audited smart contracts, STARK proofs for security, and follows industry best practices. However, DeFi always carries risks, so only bridge what you can afford to lose."
                },
                {
                  q: "Can I cancel a bridge transaction?",
                  a: "Once submitted to the blockchain, transactions cannot be cancelled. However, if there's an issue, our support team can help track and resolve problems."
                },
                {
                  q: "What happens if my transaction fails?",
                  a: "Failed transactions are rare but can happen due to network issues. Your funds remain safe and can usually be recovered. Contact support with your transaction hash for assistance."
                },
                {
                  q: "Do I need different wallets for different chains?",
                  a: "You can use MetaMask for Ethereum and most L2s. For StarkNet, you might also want Argent or Braavos wallets for the best experience."
                },
                {
                  q: "Are there minimum or maximum bridge amounts?",
                  a: "Minimum amounts vary by token (usually $10-50 worth). There are no maximum limits, but very large transactions may require additional verification."
                },
                {
                  q: "How do I track my transaction?",
                  a: "After bridging, you'll get a transaction hash. You can track progress in your transaction history or on blockchain explorers like Etherscan or StarkScan."
                }
              ].map((faq, index) => (
                <details key={index} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <summary className="cursor-pointer font-semibold text-lg hover:text-blue-400 transition-colors">
                    {faq.q}
                  </summary>
                  <div className="mt-3 text-gray-300 leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>

            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mt-8">
              <h3 className="font-semibold mb-2">Still have questions?</h3>
              <p className="text-gray-300 mb-3">
                Our support team is here to help 24/7. Reach out through any of these channels:
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="mailto:support@starkbridge.pro" className="text-blue-400 hover:text-blue-300">
                  📧 Email Support
                </a>
                <a href="#" className="text-blue-400 hover:text-blue-300">
                  💬 Live Chat
                </a>
                <a href="#" className="text-blue-400 hover:text-blue-300">
                  📱 Discord
                </a>
                <a href="#" className="text-blue-400 hover:text-blue-300">
                  🐦 Twitter
                </a>
              </div>
            </div>
          </div>
        )

      default:
        return <div>Section not found</div>
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0">
              <div className="sticky top-24 bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-lg p-4">
                <h2 className="text-lg font-bold mb-4">Documentation</h2>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                        activeSection === section.id
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      <span>{section.icon}</span>
                      <span className="text-sm">{section.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="bg-gray-800/30 backdrop-blur-lg border border-gray-700 rounded-lg p-8">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}