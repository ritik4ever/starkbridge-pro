import { prisma } from '../lib/database';
import { Logger } from '@starkbridge/shared';

export class AnalyticsService {
  async getPlatformAnalytics(period: string, metric?: string) {
    try {
      const dateFilter = this.getDateFilter(period);
      
      const [
        totalVolume,
        totalTransactions,
        uniqueUsers,
        avgTime,
        successRate,
        dailyData
      ] = await Promise.all([
        this.getTotalVolume(dateFilter),
        this.getTotalTransactions(dateFilter),
        this.getUniqueUsers(dateFilter),
        this.getAverageTime(dateFilter),
        this.getSuccessRate(dateFilter),
        this.getDailyData(period)
      ]);

      return {
        totalVolume,
        totalTransactions,
        uniqueUsers,
        avgTransactionTime: avgTime,
        successRate,
        dailyData,
        period
      };
    } catch (error) {
      Logger.error('Failed to get platform analytics:', error);
      throw error;
    }
  }

  async getBridgeAnalytics(filters: {
    fromChain?: string;
    toChain?: string;
    period: string;
  }) {
    try {
      const dateFilter = this.getDateFilter(filters.period);
      const where: any = { createdAt: dateFilter };
      
      if (filters.fromChain) where.fromChain = filters.fromChain;
      if (filters.toChain) where.toChain = filters.toChain;

      const analytics = await prisma.bridgeTransaction.groupBy({
        by: ['fromChain', 'toChain'],
        where,
        _count: { id: true },
        _sum: { amount: true }
      });

      return analytics.map(item => ({
        route: `${item.fromChain} → ${item.toChain}`,
        transactions: item._count.id,
        volume: item._sum.amount || '0'
      }));
    } catch (error) {
      Logger.error('Failed to get bridge analytics:', error);
      throw error;
    }
  }

  async getTokenAnalytics(tokenAddress?: string, period: string = '7d') {
    try {
      const dateFilter = this.getDateFilter(period);
      const where: any = { createdAt: dateFilter };
      
      if (tokenAddress) where.tokenAddress = tokenAddress;

      const analytics = await prisma.bridgeTransaction.groupBy({
        by: ['tokenAddress', 'tokenSymbol'],
        where,
        _count: { id: true },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } }
      });

      return analytics.map(item => ({
        tokenAddress: item.tokenAddress,
        tokenSymbol: item.tokenSymbol,
        transactions: item._count.id,
        volume: item._sum.amount || '0'
      }));
    } catch (error) {
      Logger.error('Failed to get token analytics:', error);
      throw error;
    }
  }

  async getRealtimeStats() {
    try {
      const [
        last24hTransactions,
        pendingTransactions,
        averageProcessingTime,
        topTokens
      ] = await Promise.all([
        prisma.bridgeTransaction.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          }
        }),
        prisma.bridgeTransaction.count({
          where: {
            status: { in: ['PENDING', 'PROCESSING'] }
          }
        }),
        this.getAverageTime({
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }),
        this.getTopTokens(5)
      ]);

      return {
        last24hTransactions,
        pendingTransactions,
        averageProcessingTime,
        topTokens,
        timestamp: new Date()
      };
    } catch (error) {
      Logger.error('Failed to get realtime stats:', error);
      throw error;
    }
  }

  async getLeaderboard(type: string, period: string) {
    try {
      const dateFilter = this.getDateFilter(period);
      
      if (type === 'volume') {
        return await prisma.bridgeTransaction.groupBy({
          by: ['userId'],
          where: { createdAt: dateFilter },
          _sum: { amount: true },
          orderBy: { _sum: { amount: 'desc' } },
          take: 10
        });
      } else if (type === 'transactions') {
        return await prisma.bridgeTransaction.groupBy({
          by: ['userId'],
          where: { createdAt: dateFilter },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10
        });
      }

      return [];
    } catch (error) {
      Logger.error('Failed to get leaderboard:', error);
      throw error;
    }
  }

  private getDateFilter(period: string) {
    const now = new Date();
    const periods: Record<string, number> = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000
    };

    return {
      gte: new Date(now.getTime() - (periods[period] || periods['30d']))
    };
  }

  private async getTotalVolume(dateFilter: any): Promise<string> {
    const result = await prisma.bridgeTransaction.aggregate({
      where: { createdAt: dateFilter },
      _sum: { amount: true }
    });
    return result._sum.amount || '0';
  }

  private async getTotalTransactions(dateFilter: any): Promise<number> {
    return await prisma.bridgeTransaction.count({
      where: { createdAt: dateFilter }
    });
  }

  private async getUniqueUsers(dateFilter: any): Promise<number> {
    const result = await prisma.bridgeTransaction.groupBy({
      by: ['userId'],
      where: { createdAt: dateFilter }
    });
    return result.length;
  }

  private async getAverageTime(dateFilter: any): Promise<number> {
    const result = await prisma.bridgeTransaction.aggregate({
      where: {
        createdAt: dateFilter,
        actualTime: { not: null }
      },
      _avg: { actualTime: true }
    });
    return result._avg.actualTime || 0;
  }

  private async getSuccessRate(dateFilter: any): Promise<number> {
    const [total, successful] = await Promise.all([
      prisma.bridgeTransaction.count({
        where: { createdAt: dateFilter }
      }),
      prisma.bridgeTransaction.count({
        where: {
          createdAt: dateFilter,
          status: 'COMPLETED'
        }
      })
    ]);

    return total > 0 ? (successful / total) * 100 : 0;
  }

  private async getDailyData(period: string) {
    const days = period === '24h' ? 1 : period === '7d' ? 7 : 30;
    const dailyData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const [volume, transactions] = await Promise.all([
        prisma.bridgeTransaction.aggregate({
          where: {
            createdAt: { gte: date, lt: nextDate }
          },
          _sum: { amount: true }
        }),
        prisma.bridgeTransaction.count({
          where: {
            createdAt: { gte: date, lt: nextDate }
          }
        })
      ]);

      dailyData.push({
        date: date.toISOString().split('T')[0],
        volume: volume._sum.amount || '0',
        transactions
      });
    }

    return dailyData;
  }

  private async getTopTokens(limit: number) {
    return await prisma.bridgeTransaction.groupBy({
      by: ['tokenAddress', 'tokenSymbol'],
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      _count: { id: true },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: limit
    });
  }
}

export const analyticsService = new AnalyticsService();