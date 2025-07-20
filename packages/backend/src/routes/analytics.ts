import { Router } from 'express';
import { query } from 'express-validator';
import { validate } from '../middleware/validate';
import { analyticsService } from '../services/analytics';
import { CacheService } from '../lib/redis';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// Get platform analytics
router.get(
  '/platform',
  optionalAuth,
  [
    query('period').optional().isIn(['24h', '7d', '30d', '90d', '1y']),
    query('metric').optional().isIn(['volume', 'transactions', 'users', 'fees'])
  ],
  validate,
  async (req, res, next) => {
    try {
      const { period = '30d', metric } = req.query;
      const cacheKey = `analytics:platform:${period}:${metric || 'all'}`;
      
      let analytics = await CacheService.get(cacheKey);
      
      if (!analytics) {
        analytics = await analyticsService.getPlatformAnalytics(period as string, metric as string);
        await CacheService.set(cacheKey, analytics, 300); // 5 minutes
      }

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get bridge analytics
router.get(
  '/bridges',
  optionalAuth,
  [
    query('fromChain').optional().isString(),
    query('toChain').optional().isString(),
    query('period').optional().isIn(['24h', '7d', '30d'])
  ],
  validate,
  async (req, res, next) => {
    try {
      const { fromChain, toChain, period = '7d' } = req.query;
      
      const analytics = await analyticsService.getBridgeAnalytics({
        fromChain: fromChain as string,
        toChain: toChain as string,
        period: period as string
      });

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get token analytics
router.get(
  '/tokens',
  optionalAuth,
  [
    query('tokenAddress').optional().isString(),
    query('period').optional().isIn(['24h', '7d', '30d'])
  ],
  validate,
  async (req, res, next) => {
    try {
      const { tokenAddress, period = '7d' } = req.query;
      
      const analytics = await analyticsService.getTokenAnalytics(
        tokenAddress as string,
        period as string
      );

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get real-time stats
router.get('/realtime', async (req, res, next) => {
  try {
    const cacheKey = 'analytics:realtime';
    let stats = await CacheService.get(cacheKey);
    
    if (!stats) {
      stats = await analyticsService.getRealtimeStats();
      await CacheService.set(cacheKey, stats, 30); // 30 seconds
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res, next) => {
  try {
    const { type = 'volume', period = '30d' } = req.query;
    const cacheKey = `analytics:leaderboard:${type}:${period}`;
    
    let leaderboard = await CacheService.get(cacheKey);
    
    if (!leaderboard) {
      leaderboard = await analyticsService.getLeaderboard(type as string, period as string);
      await CacheService.set(cacheKey, leaderboard, 3600); // 1 hour
    }

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    next(error);
  }
});

export { router as analyticsRoutes };