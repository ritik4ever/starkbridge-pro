import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simple logger
const log = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string, error?: any) => console.error(`[ERROR] ${message}`, error || '')
};

async function main() {
  log.info('🌱 Starting database seed...');

  // Seed tokens
  const tokens = [
    {
      address: '0x0000000000000000000000000000000000000000',
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      chainId: 1,
      logoUri: 'https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png',
      price: 2000,
      priceChange: 5.2,
      volume24h: '1500000'
    },
    {
      address: '0xa0b86a33e6441e26e7673f8c8a83a7b75b1c0102',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 1,
      logoUri: 'https://tokens.1inch.io/0xa0b86a33e6441e26e7673f8c8a83a7b75b1c0102.png',
      price: 1.00,
      priceChange: 0.1,
      volume24h: '5000000'
    },
    {
      address: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      chainId: 393402133025997372, // StarkNet mainnet
      logoUri: 'https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png',
      price: 2000,
      priceChange: 5.2,
      volume24h: '800000'
    }
  ];

  for (const tokenData of tokens) {
    try {
      await prisma.token.upsert({
        where: { 
          address_chainId: { 
            address: tokenData.address.toLowerCase(), 
            chainId: tokenData.chainId 
          } 
        },
        update: tokenData,
        create: {
          ...tokenData,
          address: tokenData.address.toLowerCase()
        }
      });
    } catch (error) {
      log.error(`Failed to seed token ${tokenData.symbol}:`, error);
    }
  }

  log.info(`✅ Seeded ${tokens.length} tokens`);

  // Seed bridges
  const bridges = [
    {
      name: 'StarkGate',
      fromChain: 'ethereum',
      toChain: 'starknet',
      supportedTokens: JSON.stringify(['ETH', 'USDC']),
      fees: JSON.stringify({
        fixed: '0.001',
        percentage: 0.3,
        minimum: '0.0001',
        maximum: '10'
      }),
      estimatedTime: 900,
      securityLevel: 'high'
    }
  ];

  for (const bridgeData of bridges) {
    try {
      await prisma.bridge.create({
        data: bridgeData
      });
    } catch (error) {
      log.error('Failed to seed bridge:', error);
    }
  }

  log.info(`✅ Seeded ${bridges.length} bridges`);
  log.info('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    log.error('❌ Database seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });