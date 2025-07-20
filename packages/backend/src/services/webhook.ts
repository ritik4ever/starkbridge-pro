import { prisma } from '../lib/database';
import { WebSocketService } from './websocket';
import { Logger } from '@starkbridge/shared';

export class WebhookService {
  private wsService?: WebSocketService;

  setWebSocketService(wsService: WebSocketService) {
    this.wsService = wsService;
  }

  async handleEthereumWebhook(data: {
    txHash: string;
    status: string;
    blockNumber: number;
    gasUsed?: string;
  }) {
    try {
      const transaction = await prisma.bridgeTransaction.findFirst({
        where: { txHash: data.txHash }
      });

      if (!transaction) {
        Logger.warn(`Transaction not found for hash: ${data.txHash}`);
        return;
      }

      const updateData: any = {};

      if (data.status === 'confirmed') {
        updateData.status = 'COMPLETED';
        updateData.completedAt = new Date();
        
        if (transaction.createdAt) {
          const actualTime = Math.floor(
            (Date.now() - new Date(transaction.createdAt).getTime()) / 1000
          );
          updateData.actualTime = actualTime;
        }
      } else if (data.status === 'failed') {
        updateData.status = 'FAILED';
      }

      const updatedTransaction = await prisma.bridgeTransaction.update({
        where: { id: transaction.id },
        data: updateData
      });

      // Emit WebSocket update
      if (this.wsService) {
        this.wsService.emitTransactionUpdate(transaction.userId, updatedTransaction);
      }

      Logger.info(`Updated transaction ${transaction.id} with status: ${data.status}`);
    } catch (error) {
      Logger.error('Error handling Ethereum webhook:', error);
      throw error;
    }
  }

  async handleStarkNetWebhook(data: {
    txHash: string;
    status: string;
    blockNumber?: number;
  }) {
    try {
      const transaction = await prisma.bridgeTransaction.findFirst({
        where: { txHash: data.txHash }
      });

      if (!transaction) {
        Logger.warn(`Transaction not found for hash: ${data.txHash}`);
        return;
      }

      const updateData: any = {};

      if (data.status === 'ACCEPTED_ON_L2' || data.status === 'ACCEPTED_ON_L1') {
        updateData.status = 'COMPLETED';
        updateData.completedAt = new Date();
        
        if (transaction.createdAt) {
          const actualTime = Math.floor(
            (Date.now() - new Date(transaction.createdAt).getTime()) / 1000
          );
          updateData.actualTime = actualTime;
        }
      } else if (data.status === 'REJECTED') {
        updateData.status = 'FAILED';
      }

      const updatedTransaction = await prisma.bridgeTransaction.update({
        where: { id: transaction.id },
        data: updateData
      });

      // Emit WebSocket update
      if (this.wsService) {
        this.wsService.emitTransactionUpdate(transaction.userId, updatedTransaction);
      }

      Logger.info(`Updated transaction ${transaction.id} with status: ${data.status}`);
    } catch (error) {
      Logger.error('Error handling StarkNet webhook:', error);
      throw error;
    }
  }

  async handlePriceUpdate(data: {
    tokenAddress: string;
    price: number;
    change24h: number;
    volume24h?: string;
  }) {
    try {
      await prisma.token.updateMany({
        where: { address: data.tokenAddress.toLowerCase() },
        data: {
          price: data.price,
          priceChange: data.change24h,
          volume24h: data.volume24h,
          updatedAt: new Date()
        }
      });

      // Emit WebSocket update
      if (this.wsService) {
        this.wsService.emitPriceUpdate(data.tokenAddress, {
          price: data.price,
          change24h: data.change24h,
          volume24h: data.volume24h,
          timestamp: new Date().toISOString()
        });
      }

      Logger.debug(`Updated price for token ${data.tokenAddress}: $${data.price}`);
    } catch (error) {
      Logger.error('Error handling price update:', error);
      throw error;
    }
  }
}

export const webhookService = new WebhookService();