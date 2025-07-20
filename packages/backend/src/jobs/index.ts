import cron from 'node-cron';
import { tokenService } from '../services/token';
import { analyticsService } from '../services/analytics';
import { prisma } from '../lib/database';
import { Logger } from '@starkbridge/shared';

export function startBackgroundJobs() {
  // Update token prices every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      await tokenService.updateTokenPrices();
    } catch (error) {
      Logger.error('Failed to update token prices:', error);
    }
  });

  // Generate daily analytics every hour
  cron.schedule('0 * * * *', async () => {
    try {
      await generateDailyAnalytics();
    } catch (error) {
      Logger.error('Failed to generate analytics:', error);
    }
  });

  // Clean up old transactions every day at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      await cleanupOldData();
    } catch (error) {
      Logger.error('Failed to cleanup old data:', error);
    }
  });

  // Monitor pending transactions every minute
  cron.schedule('* * * * *', async () => {
    try {
      await monitorPendingTransactions();
    } catch (error) {
      Logger.error('Failed to monitor pending transactions:', error);
    }
  });

  Logger.info('Background jobs started');
}

async function generateDailyAnalytics() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalVolume,
    totalTransactions,
    uniqueUsers,
    avgTime,
    successRate
  ] = await Promise.all([
    prisma.bridgeTransaction.aggregate({
      where: {
        createdAt: { gte: today, lt: tomorrow }
      },
      _sum: { amount: true }
    }),
    prisma.bridgeTransaction.count({
      where: {
        createdAt: { gte: today, lt: tomorrow }
      }
    }),
    prisma.bridgeTransaction.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: today, lt: tomorrow }
      }
    }).then(result => result.length),
    prisma.bridgeTransaction.aggregate({
      where: {
        createdAt: { gte: today, lt: tomorrow },
        actualTime: { not: null }
      },
      _avg: { actualTime: true }
    }),
    Promise.all([
      prisma.bridgeTransaction.count({
        where: {
          createdAt: { gte: today, lt: tomorrow }
        }
      }),
      prisma.bridgeTransaction.count({
        where: {
          createdAt: { gte: today, lt: tomorrow },
          status: 'COMPLETED'
        }
      })
    ]).then(([total, successful]) => 
      total > 0 ? (successful / total) * 100 : 0
    )
  ]);

  const topTokens = await prisma.bridgeTransaction.groupBy({
    by: ['tokenAddress', 'tokenSymbol'],
    where: {
      createdAt: { gte: today, lt: tomorrow }
    },
    _count: { id: true },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: 10
  });

  await prisma.analytics.upsert({
    where: { date: today },
    update: {
      totalVolume: totalVolume._sum.amount || '0',
      totalTransactions,
      uniqueUsers,
      avgTransactionTime: avgTime._avg.actualTime || 0,
      successRate,
      topTokens: JSON.stringify(topTokens)
    },
    create: {
      date: today,
      totalVolume: totalVolume._sum.amount || '0',
      totalTransactions,
      uniqueUsers,
      avgTransactionTime: avgTime._avg.actualTime || 0,
      successRate,
      topTokens: JSON.stringify(topTokens)
    }
  });

  Logger.info(`Generated analytics for ${today.toISOString().split('T')[0]}`);
}

async function cleanupOldData() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90); // Keep 90 days

  const deletedCount = await prisma.bridgeTransaction.deleteMany({
    where: {
      createdAt: { lt: cutoffDate },
      status: { in: ['COMPLETED', 'FAILED', 'CANCELLED'] }
    }
  });

  Logger.info(`Cleaned up ${deletedCount.count} old transactions`);
}

async function monitorPendingTransactions() {
  const pendingTransactions = await prisma.bridgeTransaction.findMany({
    where: {
      status: { in: ['PENDING', 'PROCESSING'] },
      createdAt: {
        lt: new Date(Date.now() - 30 * 60 * 1000) // Older than 30 minutes
      }
    },
    take: 10
  });

  for (const transaction of pendingTransactions) {
    try {
      // Check transaction status on blockchain
      // This would integrate with actual blockchain services
      Logger.warn(`Transaction ${transaction.id} has been pending for too long`);
      
      // Optionally mark as failed or retry
      if (new Date(transaction.createdAt).getTime() < Date.now() - 60 * 60 * 1000) {
        await prisma.bridgeTransaction.update({
          where: { id: transaction.id },
          data: { status: 'FAILED' }
        });
        Logger.warn(`Marked transaction ${transaction.id} as failed due to timeout`);
      }
    } catch (error) {
      Logger.error(`Failed to monitor transaction ${transaction.id}:`, error);
    }
  }
}