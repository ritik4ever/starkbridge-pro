import { BridgeTransaction, ChainType, TransactionStatus } from '@starkbridge/shared';
import { prisma } from '../lib/database';
import { starknetService } from './starknet';
import { ethereumService } from './ethereum';
import { Logger } from '@starkbridge/shared';

export class BridgeService {
  async createTransaction(
    userId: string,
    fromChain: ChainType,
    toChain: ChainType,
    tokenAddress: string,
    amount: string,
    slippage: number = 2
  ): Promise<BridgeTransaction> {
    try {
      // Get token info
      const token = await prisma.token.findFirst({
        where: { address: tokenAddress }
      });

      if (!token) {
        throw new Error('Token not supported');
      }

      // Estimate fees and time
      const fees = await this.estimateFees(fromChain, toChain, amount);
      const estimatedTime = await this.estimateTime(fromChain, toChain);

      // Create transaction record
      const transaction = await prisma.bridgeTransaction.create({
        data: {
          userId,
          fromChain,
          toChain,
          tokenAddress,
          tokenSymbol: token.symbol,
          amount,
          status: TransactionStatus.PENDING,
          estimatedTime,
          fees: JSON.stringify(fees),
          slippage,
        },
      });

      Logger.info(`Created bridge transaction: ${transaction.id}`);
      return transaction as BridgeTransaction;
    } catch (error) {
      Logger.error('Failed to create bridge transaction:', error);
      throw error;
    }
  }

  async processTransaction(transactionId: string): Promise<void> {
    try {
      const transaction = await prisma.bridgeTransaction.findUnique({
        where: { id: transactionId }
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Update status to processing
      await prisma.bridgeTransaction.update({
        where: { id: transactionId },
        data: { status: TransactionStatus.PROCESSING }
      });

      let txHash: string;

      // Execute based on source chain
      if (transaction.fromChain === ChainType.ETHEREUM) {
        txHash = await this.processFromEthereum(transaction);
      } else if (transaction.fromChain === ChainType.STARKNET) {
        txHash = await this.processFromStarkNet(transaction);
      } else {
        throw new Error(`Unsupported source chain: ${transaction.fromChain}`);
      }

      // Update with transaction hash
      await prisma.bridgeTransaction.update({
        where: { id: transactionId },
        data: { 
          txHash,
          status: TransactionStatus.CONFIRMED 
        }
      });

      // Start monitoring for completion
      this.monitorTransaction(transactionId, txHash);

    } catch (error) {
      Logger.error(`Failed to process transaction ${transactionId}:`, error);
      
      // Update status to failed
      await prisma.bridgeTransaction.update({
        where: { id: transactionId },
        data: { status: TransactionStatus.FAILED }
      });
      
      throw error;
    }
  }

  private async processFromEthereum(transaction: any): Promise<string> {
    // Implementation for Ethereum to StarkNet bridge
    const txHash = await ethereumService.bridgeToStarkNet(
      transaction.tokenAddress,
      transaction.amount,
      transaction.userId // destination address
    );
    
    return txHash;
  }

  private async processFromStarkNet(transaction: any): Promise<string> {
    // Implementation for StarkNet to Ethereum bridge
    const txHash = await starknetService.transfer(
      transaction.tokenAddress,
      transaction.userId, // destination address
      transaction.amount
    );
    
    return txHash;
  }

  private async monitorTransaction(transactionId: string, txHash: string): Promise<void> {
    try {
      const transaction = await prisma.bridgeTransaction.findUnique({
        where: { id: transactionId }
      });

      if (!transaction) return;

      let receipt: any;

      if (transaction.fromChain === ChainType.ETHEREUM) {
        receipt = await ethereumService.waitForTransaction(txHash);
      } else if (transaction.fromChain === ChainType.STARKNET) {
        receipt = await starknetService.waitForTransaction(txHash);
      }

      if (receipt) {
        const actualTime = Math.floor((Date.now() - new Date(transaction.createdAt).getTime()) / 1000);
        
        await prisma.bridgeTransaction.update({
          where: { id: transactionId },
          data: {
            status: TransactionStatus.COMPLETED,
            completedAt: new Date(),
            actualTime
          }
        });

        Logger.info(`Transaction ${transactionId} completed`);
      }

    } catch (error) {
      Logger.error(`Failed to monitor transaction ${transactionId}:`, error);
      
      await prisma.bridgeTransaction.update({
        where: { id: transactionId },
        data: { status: TransactionStatus.FAILED }
      });
    }
  }

  private async estimateFees(
    fromChain: ChainType,
    toChain: ChainType,
    amount: string
  ): Promise<any> {
    // Mock implementation - replace with actual fee estimation
    const networkFee = '0.001';
    const bridgeFee = (parseFloat(amount) * 0.003).toString(); // 0.3% bridge fee
    const totalFee = (parseFloat(networkFee) + parseFloat(bridgeFee)).toString();

    return {
      networkFee,
      bridgeFee,
      totalFee,
      gasPrice: '20000000000', // 20 gwei
      gasLimit: '150000'
    };
  }

  private async estimateTime(fromChain: ChainType, toChain: ChainType): Promise<number> {
    // Mock implementation - replace with actual time estimation
    if (fromChain === ChainType.ETHEREUM && toChain === ChainType.STARKNET) {
      return 900; // 15 minutes
    } else if (fromChain === ChainType.STARKNET && toChain === ChainType.ETHEREUM) {
      return 1800; // 30 minutes
    }
    return 600; // 10 minutes default
  }

  async getTransactionHistory(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    const skip = (page - 1) * limit;
    
    const [transactions, total] = await Promise.all([
      prisma.bridgeTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.bridgeTransaction.count({
        where: { userId }
      })
    ]);

    return {
      data: transactions,
      total,
      page,
      limit,
      hasNext: skip + limit < total,
      hasPrev: page > 1
    };
  }
}

export const bridgeService = new BridgeService();