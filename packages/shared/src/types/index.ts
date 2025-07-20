export interface User {
  id: string;
  walletAddress: string;
  email?: string;
  profile: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  username?: string;
  avatar?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  defaultSlippage: number;
  gasPriceLevel: 'low' | 'medium' | 'high';
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  transactionUpdates: boolean;
  priceAlerts: boolean;
}

export interface BridgeTransaction {
  id: string;
  userId: string;
  fromChain: ChainType;
  toChain: ChainType;
  tokenAddress: string;
  amount: string;
  status: TransactionStatus;
  txHash?: string;
  estimatedTime: number;
  fees: TransactionFees;
  createdAt: Date;
  completedAt?: Date;
}

export enum ChainType {
  ETHEREUM = 'ethereum',
  STARKNET = 'starknet',
  POLYGON = 'polygon',
  ARBITRUM = 'arbitrum'
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  PROCESSING = 'processing',
  COMPLETED = 'completed'
}

export interface TransactionFees {
  networkFee: string;
  bridgeFee: string;
  totalFee: string;
  gasPrice: string;
  gasLimit: string;
}

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUri: string;
  chainId: number;
  price?: TokenPrice;
}

export interface TokenPrice {
  usd: number;
  change24h: number;
  lastUpdated: Date;
}

export interface Bridge {
  id: string;
  name: string;
  fromChain: ChainType;
  toChain: ChainType;
  supportedTokens: string[];
  fees: BridgeFees;
  estimatedTime: number;
  security: SecurityLevel;
}

export interface BridgeFees {
  fixed: string;
  percentage: number;
  minimum: string;
  maximum: string;
}

export enum SecurityLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export interface Analytics {
  totalVolume: string;
  totalTransactions: number;
  avgTransactionTime: number;
  successRate: number;
  topTokens: TokenVolume[];
  dailyVolume: DailyVolume[];
}

export interface TokenVolume {
  token: Token;
  volume: string;
  transactions: number;
}

export interface DailyVolume {
  date: string;
  volume: string;
  transactions: number;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}