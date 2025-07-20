import { z } from 'zod';

export const createUserSchema = z.object({
  walletAddress: z.string().min(1),
  email: z.string().email().optional(),
  username: z.string().min(3).max(30).optional(),
});

export const bridgeTransactionSchema = z.object({
  fromChain: z.enum(['ethereum', 'starknet', 'polygon', 'arbitrum']),
  toChain: z.enum(['ethereum', 'starknet', 'polygon', 'arbitrum']),
  tokenAddress: z.string().min(1),
  amount: z.string().min(1),
  slippage: z.number().min(0.1).max(50).default(2),
});

export const updatePreferencesSchema = z.object({
  defaultSlippage: z.number().min(0.1).max(50),
  gasPriceLevel: z.enum(['low', 'medium', 'high']),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    transactionUpdates: z.boolean(),
    priceAlerts: z.boolean(),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type BridgeTransactionInput = z.infer<typeof bridgeTransactionSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;