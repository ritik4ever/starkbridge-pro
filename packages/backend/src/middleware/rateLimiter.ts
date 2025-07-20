import { Request, Response, NextFunction } from 'express';
import { redis } from '../lib/redis';
import { Logger } from '@starkbridge/shared';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}

export class RateLimiter {
  private options: RateLimitOptions;

  constructor(options: RateLimitOptions) {
    this.options = {
      message: 'Too many requests, please try again later.',
      skipSuccessfulRequests: false,
      ...options
    };
  }

  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const key = `rate_limit:${req.ip}:${req.path}`;
        const current = await redis.get(key);
        
        if (!current) {
          await redis.setEx(key, Math.ceil(this.options.windowMs / 1000), '1');
          return next();
        }

        const count = parseInt(current);
        if (count >= this.options.max) {
          return res.status(429).json({
            success: false,
            message: this.options.message,
            retryAfter: Math.ceil(this.options.windowMs / 1000)
          });
        }

        await redis.incr(key);
        next();
      } catch (error) {
        Logger.error('Rate limiter error:', error);
        next(); // Continue on error
      }
    };
  }
}

export const rateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}).middleware();

export const apiKeyLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 1000 // 1000 requests per minute for API keys
}).middleware();

export const bridgeLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10 // 10 bridge transactions per minute
}).middleware();