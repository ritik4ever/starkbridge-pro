import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { bridgeService } from '../services/bridge';
import { Logger } from '@starkbridge/shared';

const router = Router();

// Create bridge transaction
router.post(
  '/transactions',
  authMiddleware,
  [
    body('fromChain').isIn(['ethereum', 'starknet', 'polygon', 'arbitrum']),
    body('toChain').isIn(['ethereum', 'starknet', 'polygon', 'arbitrum']),
    body('tokenAddress').isString().notEmpty(),
    body('amount').isString().notEmpty(),
    body('slippage').optional().isFloat({ min: 0.1, max: 50 })
  ],
  validate,
  async (req, res, next) => {
    try {
      const { fromChain, toChain, tokenAddress, amount, slippage } = req.body;
      const userId = req.user!.id;

      const transaction = await bridgeService.createTransaction(
        userId,
        fromChain,
        toChain,
        tokenAddress,
        amount,
        slippage
      );

      res.status(201).json({
        success: true,
        data: transaction,
        message: 'Bridge transaction created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// Process transaction
router.post(
  '/transactions/:id/process',
  authMiddleware,
  [param('id').isString().notEmpty()],
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      
      await bridgeService.processTransaction(id);

      res.json({
        success: true,
        message: 'Transaction processing started'
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get transaction history
router.get(
  '/transactions',
  authMiddleware,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  validate,
  async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const userId = req.user!.id;

      const result = await bridgeService.getTransactionHistory(userId, page, limit);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get transaction by ID
router.get(
  '/transactions/:id',
  authMiddleware,
  [param('id').isString().notEmpty()],
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const transaction = await prisma.bridgeTransaction.findFirst({
        where: { id, userId }
      });

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      res.json({
        success: true,
        data: transaction
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get supported bridges
router.get('/bridges', async (req, res, next) => {
  try {
    const bridges = await prisma.bridge.findMany({
      where: { isActive: true }
    });

    res.json({
      success: true,
      data: bridges
    });
  } catch (error) {
    next(error);
  }
});

// Estimate bridge transaction
router.post(
  '/estimate',
  [
    body('fromChain').isIn(['ethereum', 'starknet', 'polygon', 'arbitrum']),
    body('toChain').isIn(['ethereum', 'starknet', 'polygon', 'arbitrum']),
    body('tokenAddress').isString().notEmpty(),
    body('amount').isString().notEmpty()
  ],
  validate,
  async (req, res, next) => {
    try {
      const { fromChain, toChain, tokenAddress, amount } = req.body;

      // Mock estimation - replace with actual implementation
      const estimate = {
        estimatedTime: 900, // 15 minutes
        fees: {
          networkFee: '0.001',
          bridgeFee: '0.003',
          totalFee: '0.004'
        },
        amountOut: (parseFloat(amount) * 0.997).toString(), // After fees
        route: [{
          from: fromChain,
          to: toChain,
          bridge: 'StarkBridge Pro'
        }]
      };

      res.json({
        success: true,
        data: estimate
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as bridgeRoutes };