import { Router } from 'express';
import { body, query } from 'express-validator';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { prisma } from '../lib/database';
import { CacheService } from '../lib/redis';
import { Logger } from '@starkbridge/shared';

const router = Router();

// Get user profile
router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Try cache first
    let user = await CacheService.get(`user_profile:${userId}`);
    
    if (!user) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          _count: {
            select: {
              transactions: true
            }
          }
        }
      });
      
      if (user) {
        await CacheService.set(`user_profile:${userId}`, user, 3600);
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put(
  '/profile',
  authMiddleware,
  [
    body('email').optional().isEmail(),
    body('username').optional().isLength({ min: 3, max: 30 }),
    body('avatar').optional().isURL()
  ],
  validate,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { email, username, avatar } = req.body;

      const updateData: any = {};
      if (email !== undefined) updateData.email = email;
      if (username !== undefined) updateData.username = username;
      if (avatar !== undefined) updateData.avatar = avatar;

      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData
      });

      // Clear cache
      await CacheService.del(`user_profile:${userId}`);

      res.json({
        success: true,
        data: user,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(400).json({
          success: false,
          message: 'Email or username already exists'
        });
      }
      next(error);
    }
  }
);

// Update user preferences
router.put(
  '/preferences',
  authMiddleware,
  [
    body('defaultSlippage').optional().isFloat({ min: 0.1, max: 50 }),
    body('gasPriceLevel').optional().isIn(['low', 'medium', 'high']),
    body('notifications').optional().isObject(),
    body('notifications.email').optional().isBoolean(),
    body('notifications.push').optional().isBoolean(),
    body('notifications.transactionUpdates').optional().isBoolean(),
    body('notifications.priceAlerts').optional().isBoolean()
  ],
  validate,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const preferences = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: { preferences }
      });

      // Clear cache
      await CacheService.del(`user_profile:${userId}`);

      res.json({
        success: true,
        data: user.preferences,
        message: 'Preferences updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get user statistics
router.get('/stats', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const stats = await prisma.bridgeTransaction.aggregate({
      where: { userId },
      _count: { id: true },
      _sum: { amount: true }
    });

    const recentTransactions = await prisma.bridgeTransaction.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    });

    const successfulTransactions = await prisma.bridgeTransaction.count({
      where: {
        userId,
        status: 'COMPLETED'
      }
    });

    const result = {
      totalTransactions: stats._count.id,
      totalVolume: stats._sum.amount || '0',
      recentTransactions,
      successRate: stats._count.id > 0 ? (successfulTransactions / stats._count.id) * 100 : 0
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Create API key
router.post(
  '/api-keys',
  authMiddleware,
  [
    body('name').isString().isLength({ min: 1, max: 100 }),
    body('rateLimit').optional().isInt({ min: 1, max: 10000 })
  ],
  validate,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { name, rateLimit } = req.body;

      // Generate API key
      const key = `sb_${Buffer.from(`${userId}_${Date.now()}_${Math.random()}`).toString('base64url')}`;

      const apiKey = await prisma.apiKey.create({
        data: {
          userId,
          name,
          key,
          rateLimit: rateLimit || 1000
        }
      });

      res.status(201).json({
        success: true,
        data: apiKey,
        message: 'API key created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get API keys
router.get('/api-keys', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        key: true,
        isActive: true,
        lastUsed: true,
        rateLimit: true,
        createdAt: true,
        expiresAt: true
      }
    });

    res.json({
      success: true,
      data: apiKeys
    });
  } catch (error) {
    next(error);
  }
});

// Delete API key
router.delete('/api-keys/:id', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await prisma.apiKey.deleteMany({
      where: {
        id,
        userId
      }
    });

    res.json({
      success: true,
      message: 'API key deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export { router as userRoutes };