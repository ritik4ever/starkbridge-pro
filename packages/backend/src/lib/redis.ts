import { createClient } from 'redis';
import { Logger } from '@starkbridge/shared';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = createClient({
  url: redisUrl,
});

redis.on('error', (err) => {
  Logger.error('Redis Client Error:', err);
});

redis.on('connect', () => {
  Logger.info('Redis connected');
});

redis.on('disconnect', () => {
  Logger.warn('Redis disconnected');
});

// Connect to Redis
(async () => {
  try {
    await redis.connect();
  } catch (error) {
    Logger.error('Failed to connect to Redis:', error);
  }
})();

// Cache utility functions
export class CacheService {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      Logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  static async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      await redis.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      Logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  static async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      Logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      Logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }
}