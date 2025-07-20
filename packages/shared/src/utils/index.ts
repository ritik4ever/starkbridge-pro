import { ChainType } from '../types';

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatAmount(amount: string | number, decimals: number = 18): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const factor = Math.pow(10, decimals);
  const formatted = (num / factor).toFixed(6);
  return parseFloat(formatted).toString();
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export function getChainName(chain: ChainType): string {
  const names: Record<ChainType, string> = {
    [ChainType.ETHEREUM]: 'Ethereum',
    [ChainType.STARKNET]: 'StarkNet',
    [ChainType.POLYGON]: 'Polygon',
    [ChainType.ARBITRUM]: 'Arbitrum',
  };
  return names[chain];
}

export function getChainId(chain: ChainType): number {
  const ids: Record<ChainType, number> = {
    [ChainType.ETHEREUM]: 1,
    [ChainType.STARKNET]: 393402133025997372,
    [ChainType.POLYGON]: 137,
    [ChainType.ARBITRUM]: 42161,
  };
  return ids[chain];
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  return fn().catch(async (error) => {
    if (retries > 0) {
      await sleep(delay);
      return retry(fn, retries - 1, delay * 2);
    }
    throw error;
  });
}

export class Logger {
  static info(message: string, data?: any): void {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data || '');
  }

  static error(message: string, error?: any): void {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
  }

  static warn(message: string, data?: any): void {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || '');
  }

  static debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, data || '');
    }
  }
}