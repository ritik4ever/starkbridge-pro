import { Router } from 'express';
import { query } from 'express-validator';
import { validate } from '../middleware/validate';
import { CacheService } from '../lib/redis';
import { prisma } from '../lib/database';
import { tokenService } from '../services/token';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// Get supported tokens
router.get(
  '/',
  optionalAuth,
  [
    query('chainId').optional().isInt(),
    query('search').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  validate,
  async (req, res, next) => {
    try {
      const { chainId, search, page = 1, limit = 50 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = { isActive: true };
      
      if (chainId) {
        where.chainId = Number(chainId);
      }
      
      if (search) {
        where.OR = [
          { symbol: { contains: search as string, mode: 'insensitive' } },
          { name: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      const [tokens, total] = await Promise.all([
        prisma.token.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: [
            { volume24h: 'desc' },
            { symbol: 'asc' }
          ]
        }),
        prisma.token.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          tokens,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            hasNext: skip + Number(limit) < total,
            hasPrev: Number(page) > 1
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get token details
router.get('/:address', async (req, res, next) => {
  try {
    const { address } = req.params;
    
    // Try cache first
    let token = await CacheService.get(`token:${address}`);
    
    if (!token) {
      token = await prisma.token.findFirst({
        where: { address: address.toLowerCase() }
      });
      
      if (token) {
        await CacheService.set(`token:${address}`, token, 300); // 5 minutes
      }
    }

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found'
      });
    }

    res.json({
      success: true,
      data: token
    });
  } catch (error) {
    next(error);
  }
});

// Get token balance for user
router.get('/:address/balance/:userAddress', async (req, res, next) => {
  try {
    const { address, userAddress } = req.params;
    
    const balance = await tokenService.getBalance(address, userAddress);
    
    res.json({
      success: true,
      data: { balance }
    });
  } catch (error) {
    next(error);
  }
});

// Get token price history
router.get('/:address/price-history', async (req, res, next) => {
  try {
    const { address } = req.params;
    const { period = '24h' } = req.query;
    
    // Mock price history - implement with actual price data
    const priceHistory = await tokenService.getPriceHistory(address, period as string);
    
    res.json({
      success: true,
      data: priceHistory
    });
  } catch (error) {
    next(error);
  }
});

// Get popular tokens
router.get('/popular/trending', async (req, res, next) => {
  try {
    const cacheKey = 'popular_tokens';
    let popularTokens = await CacheService.get(cacheKey);
    
    if (!popularTokens) {
      popularTokens = await prisma.token.findMany({
        where: { isActive: true },
        orderBy: { volume24h: 'desc' },
        take: 10
      });
      
      await CacheService.set(cacheKey, popularTokens, 600); // 10 minutes
    }

    res.json({
      success: true,
      data: popularTokens
    });
  } catch (error) {
    next(error);
  }
});

export { router as tokenRoutes };