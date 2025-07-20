import { Account, Contract, Provider, CallData, uint256 } from 'starknet';
import { Logger } from '@starkbridge/shared';

export class StarkNetService {
  private provider: Provider;
  private account: Account | null = null;

  constructor() {
    this.provider = new Provider({
      sequencer: {
        baseUrl: process.env.STARKNET_RPC_URL || 'https://alpha-mainnet.starknet.io'
      }
    });
  }

  async initializeAccount(privateKey: string, address: string): Promise<void> {
    try {
      this.account = new Account(this.provider, address, privateKey);
      Logger.info('StarkNet account initialized');
    } catch (error) {
      Logger.error('Failed to initialize StarkNet account:', error);
      throw error;
    }
  }

  async getBalance(tokenContract: string, userAddress: string): Promise<string> {
    try {
      const contract = new Contract([], tokenContract, this.provider);
      const result = await contract.call('balanceOf', [userAddress]);
      return uint256.uint256ToBN(result.balance).toString();
    } catch (error) {
      Logger.error('Failed to get balance:', error);
      throw error;
    }
  }

  async transfer(
    tokenContract: string, 
    recipient: string, 
    amount: string
  ): Promise<string> {
    if (!this.account) {
      throw new Error('Account not initialized');
    }

    try {
      const contract = new Contract([], tokenContract, this.account);
      const calldata = CallData.compile({
        recipient,
        amount: uint256.bnToUint256(amount)
      });

      const result = await contract.invoke('transfer', calldata);
      Logger.info(`Transfer initiated: ${result.transaction_hash}`);
      return result.transaction_hash;
    } catch (error) {
      Logger.error('Failed to transfer:', error);
      throw error;
    }
  }

  async getTransactionStatus(txHash: string): Promise<any> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      return receipt;
    } catch (error) {
      Logger.error('Failed to get transaction status:', error);
      throw error;
    }
  }

  async estimateGas(
    contractAddress: string,
    functionName: string,
    calldata: any[]
  ): Promise<string> {
    if (!this.account) {
      throw new Error('Account not initialized');
    }

    try {
      const estimate = await this.account.estimateFee({
        contractAddress,
        entrypoint: functionName,
        calldata
      });

      return estimate.overall_fee.toString();
    } catch (error) {
      Logger.error('Failed to estimate gas:', error);
      throw error;
    }
  }

  async waitForTransaction(txHash: string, retries: number = 30): Promise<any> {
    for (let i = 0; i < retries; i++) {
      try {
        const receipt = await this.getTransactionStatus(txHash);
        if (receipt.status === 'ACCEPTED_ON_L2' || receipt.status === 'ACCEPTED_ON_L1') {
          return receipt;
        }
      } catch (error) {
        // Transaction might not be found yet
      }

      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    }

    throw new Error(`Transaction ${txHash} not confirmed after ${retries} retries`);
  }
}

export const starknetService = new StarkNetService();