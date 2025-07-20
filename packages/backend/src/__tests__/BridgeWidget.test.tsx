import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BridgeWidget } from '@/components/bridge/BridgeWidget'
import { AuthProvider } from '@/components/providers/AuthProvider'

// Mock wagmi hooks
jest.mock('wagmi', () => ({
  useAccount: () => ({ address: '0x123', isConnected: true }),
  useSignMessage: () => ({ signMessageAsync: jest.fn() })
}))

// Mock API
jest.mock('@/lib/api', () => ({
  authApi: {
    getNonce: jest.fn().mockResolvedValue({
      data: { nonce: '123', message: 'Sign this message' }
    }),
    connect: jest.fn().mockResolvedValue({
      data: { user: { id: '1' }, token: 'token' }
    })
  },
  bridgeApi: {
    estimate: jest.fn().mockResolvedValue({
      data: {
        estimatedTime: 900,
        fees: { totalFee: '0.004' },
        amountOut: '0.996'
      }
    })
  }
}))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
})

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      {children}
    </AuthProvider>
  </QueryClientProvider>
)

describe('BridgeWidget', () => {
  test('renders bridge widget', () => {
    render(
      <Wrapper>
        <BridgeWidget />
      </Wrapper>
    )

    expect(screen.getByText('Bridge Assets')).toBeInTheDocument()
    expect(screen.getByText('From')).toBeInTheDocument()
    expect(screen.getByText('To')).toBeInTheDocument()
  })

  test('shows connect wallet button when not authenticated', () => {
    render(
      <Wrapper>
        <BridgeWidget />
      </Wrapper>
    )

    expect(screen.getByText('Connect Wallet')).toBeInTheDocument()
  })

  test('allows chain swap', () => {
    render(
      <Wrapper>
        <BridgeWidget />
      </Wrapper>
    )

    const swapButton = screen.getByRole('button', { name: /swap/i })
    fireEvent.click(swapButton)

    // Verify chains are swapped
    expect(screen.getByText('From')).toBeInTheDocument()
    expect(screen.getByText('To')).toBeInTheDocument()
  })
})