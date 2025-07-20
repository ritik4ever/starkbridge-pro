import { ethers } from 'ethers';
import { Logger } from '@starkbridge/shared';

export class EthereumService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet | null = null;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(
      process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.alchemyapi.io/v2/your-api-key'
    );
  }

  async initializeWallet(privateKey: string): Promise<void> {
    try {
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      Logger.info('Ethereum wallet initialized');
    } catch (error) {
      Logger.error('Failed to initialize Ethereum wallet:', error);
      throw error;
    }
  }

  async getBalance(tokenAddress: string, userAddress: string): Promise<string> {
    try {
      if (tokenAddress === ethers.ZeroAddress) {
        // ETH balance
        const balance = await this.provider.getBalance(userAddress);
        return balance.toString();
      } else {
        // ERC20 token balance
        const contract = new ethers.Contract(
          tokenAddress,
          ['function balanceOf(address) view returns (uint256)'],
          this.provider
        );
        const balance = await contract.balanceOf(userAddress);
        return balance.toString();
      }
    } catch (error) {
      Logger.error('Failed to get balance:', error);
      throw error;
    }
  }

  async transfer(tokenAddress: string, recipient: string, amount: string): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    try {
      let tx: any;

      if (tokenAddress === ethers.ZeroAddress) {
        // ETH transfer
        tx = await this.wallet.sendTransaction({
          to: recipient,
          value: amount
        });
      } else {
        // ERC20 transfer
        const contract = new ethers.Contract(
          tokenAddress,
          ['function transfer(address,uint256) returns (bool)'],
          this.wallet
        );
        tx = await contract.transfer(recipient, amount);
      }

      Logger.info(`Ethereum transfer initiated: ${tx.hash}`);
      return tx.hash;
    } catch (error) {
      Logger.error('Failed to transfer:', error);
      throw error;
    }
  }

  async bridgeToStarkNet(tokenAddress: string, amount: string, recipient: string): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    try {
      // Mock bridge contract interaction
      const bridgeContract = new ethers.Contract(
        process.env.ETHEREUM_BRIDGE_CONTRACT!,
        [
          'function deposit(address token, uint256 amount, uint256 l2Recipient) payable'
        ],
        this.wallet
      );

      const tx = await bridgeContract.deposit(
        tokenAddress,
        amount,
        recipient, // L2 recipient address
        {
          value: tokenAddress === ethers.ZeroAddress ? amount : 0
        }
      );

      Logger.info(`Bridge to StarkNet initiated: ${tx.hash}`);
      return tx.hash;
    } catch (error) {
      Logger.error('Failed to bridge to StarkNet:', error);
      throw error;
    }
  }

  async estimateGas(to: string, data: string, value?: string): Promise<string> {
    try {
      const gasLimit = await this.provider.estimateGas({
        to,
        data,
        value: value || '0'
      });
      return gasLimit.toString();
    } catch (error) {
      Logger.error('Failed to estimate gas:', error);
      throw error;
    }
  }

  async getGasPrice(): Promise<string> {
    try {
      const feeData = await this.provider.getFeeData();
      return feeData.gasPrice?.toString() || '0';
    } catch (error) {
      Logger.error('Failed to get gas price:', error);
      throw error;
    }
  }

  async waitForTransaction(txHash: string, confirmations: number = 1): Promise<any> {
    try {
      const receipt = await this.provider.waitForTransaction(txHash, confirmations);
      return receipt;
    } catch (error) {
      Logger.error('Failed to wait for transaction:', error);
      throw error;
    }
  }

  async getTransactionReceipt(txHash: string): Promise<any> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      return receipt;
    } catch (error) {
      Logger.error('Failed to get transaction receipt:', error);
      throw error;
    }
  }
}

export const ethereumService = new EthereumService();