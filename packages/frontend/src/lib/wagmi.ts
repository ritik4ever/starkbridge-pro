import { configureChains, createConfig } from 'wagmi'
import { mainnet, polygon, arbitrum, goerli } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { infuraProvider } from 'wagmi/providers/infura'
import { getDefaultWallets } from '@rainbow-me/rainbowkit'

// Custom StarkNet chain (for display purposes)
export const starknet = {
  id: 393402133025997372,
  name: 'StarkNet',
  network: 'starknet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://alpha-mainnet.starknet.io'] },
    default: { http: ['https://alpha-mainnet.starknet.io'] },
  },
  blockExplorers: {
    default: { name: 'StarkScan', url: 'https://starkscan.co' },
  },
  testnet: false,
} as const

export const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, polygon, arbitrum, goerli],
  [
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID! }),
    infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_ID! }),
    publicProvider(),
  ]
)

const { connectors } = getDefaultWallets({
  appName: 'StarkBridge Pro',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains,
})

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})