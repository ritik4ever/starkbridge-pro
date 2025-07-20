import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { webhookService } from '../services/webhook';
import { Logger } from '@starkbridge/shared';

const router = Router();

// Ethereum webhook for transaction confirmations
router.post(
  '/ethereum',
  [
    body('txHash').isString().notEmpty(),
    body('status').isIn(['confirmed', 'failed']),
    body('blockNumber').isInt(),
    body('gasUsed').optional().isString()
  ],
  validate,
  async (req, res, next) => {
    try {
      const { txHash, status, blockNumber, gasUsed } = req.body;
      
      await webhookService.handleEthereumWebhook({
        txHash,
        status,
        blockNumber,
        gasUsed
      });

      res.json({ success: true });
    } catch (error) {
      Logger.error('Ethereum webhook error:', error);
      next(error);
    }
  }
);

// StarkNet webhook for transaction confirmations
router.post(
  '/starknet',
  [
    body('txHash').isString().notEmpty(),
    body('status').isIn(['ACCEPTED_ON_L2', 'ACCEPTED_ON_L1', 'REJECTED']),
    body('blockNumber').optional().isInt()
  ],
  validate,
  async (req, res, next) => {
    try {
      const { txHash, status, blockNumber } = req.body;
      
      await webhookService.handleStarkNetWebhook({
        txHash,
        status,
        blockNumber
      });

      res.json({ success: true });
    } catch (error) {
      Logger.error('StarkNet webhook error:', error);
      next(error);
    }
  }
);

// Price update webhook
router.post(
  '/prices',
  [
    body('tokenAddress').isString().notEmpty(),
    body('price').isNumeric(),
    body('change24h').isNumeric(),
    body('volume24h').optional().isString()
  ],
  validate,
  async (req, res, next) => {
    try {
      const { tokenAddress, price, change24h, volume24h } = req.body;
      
      await webhookService.handlePriceUpdate({
        tokenAddress,
        price: parseFloat(price),
        change24h: parseFloat(change24h),
        volume24h
      });

      res.json({ success: true });
    } catch (error) {
      Logger.error('Price webhook error:', error);
      next(error);
    }
  }
);

export { router as webhookRoutes };