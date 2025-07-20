import { Router } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { validate } from '../middleware/validate';
import { authMiddleware } from '../middleware/auth';
import { prisma } from '../lib/database';
import { CacheService } from '../lib/redis';
import { Logger } from '@starkbridge/shared';

const router = Router();

// Connect wallet / Register
router.post(
  '/connect',
  [
    body('walletAddress').isString().isLength({ min: 42, max: 42 }),
    body('signature').isString().notEmpty(),
    body('message').isString().notEmpty(),
    body('email').optional().isEmail(),
    body('username').optional().isLength({ min: 3, max: 30 })
  ],
  validate,
  async (req, res, next) => {
    try {
      const { walletAddress, signature, message, email, username } = req.body;

      // Verify signature (simplified - implement proper signature verification)
      if (!signature || !message) {
        return res.status(400).json({
          success: false,
          message: 'Invalid signature or message'
        });
      }

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { walletAddress: walletAddress.toLowerCase() }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            walletAddress: walletAddress.toLowerCase(),
            email,
            username,
            preferences: {
              defaultSlippage: 2,
              gasPriceLevel: 'medium',
              notifications: {
                email: false,
                push: true,
                transactionUpdates: true,
                priceAlerts: false
              }
            }
          }
        });
        Logger.info(`New user created: ${user.id}`);
      } else {
        // Update last login
        user = await prisma.user.update({
          where: { id: user.id },
          data: { updatedAt: new Date() }
        });
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, walletAddress: user.walletAddress },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      // Cache user session
      await CacheService.set(`user_session:${user.id}`, user, 7 * 24 * 3600);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            walletAddress: user.walletAddress,
            email: user.email,
            username: user.username,
            preferences: user.preferences,
            createdAt: user.createdAt
          },
          token
        },
        message: 'Authentication successful'
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get nonce for wallet signature
router.post(
  '/nonce',
  [body('walletAddress').isString().isLength({ min: 42, max: 42 })],
  validate,
  async (req, res, next) => {
    try {
      const { walletAddress } = req.body;
      const nonce = Math.floor(Math.random() * 1000000).toString();
      
      // Cache nonce for 5 minutes
      await CacheService.set(`auth_nonce:${walletAddress.toLowerCase()}`, nonce, 300);

      const message = `Sign this message to authenticate with StarkBridge Pro.\n\nNonce: ${nonce}\nTimestamp: ${Date.now()}`;

      res.json({
        success: true,
        data: { nonce, message }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Refresh token
router.post('/refresh', authMiddleware, async (req, res, next) => {
  try {
    const user = req.user;

    const token = jwt.sign(
      { userId: user.id, walletAddress: user.walletAddress },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: { token },
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Remove cached session
    await CacheService.del(`user_session:${userId}`);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Verify token
router.get('/verify', authMiddleware, async (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        walletAddress: req.user.walletAddress,
        email: req.user.email,
        username: req.user.username,
        preferences: req.user.preferences
      }
    }
  });
});

export { router as authRoutes };