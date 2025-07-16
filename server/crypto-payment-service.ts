
import { createHash, createHmac } from 'crypto';
import { storage } from './storage';
import { encrypt, decrypt } from './crypto-utils';

interface BinancePayConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
}

interface CryptoWallet {
  id: number;
  userId: number;
  walletType: string;
  walletAddress: string;
  network: string;
  isVerified: boolean;
  createdAt: Date;
}

interface CryptoPaymentRequest {
  amount: number;
  currency: string;
  merchantOrderId: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}

interface CryptoWithdrawalRequest {
  userId: number;
  amount: number;
  currency: string;
  walletAddress: string;
  network: string;
}

export class CryptoPaymentService {
  private static binanceConfig: BinancePayConfig = {
    apiKey: process.env.BINANCE_PAY_API_KEY || '',
    secretKey: process.env.BINANCE_PAY_SECRET_KEY || '',
    baseUrl: process.env.BINANCE_PAY_BASE_URL || 'https://bpay.binanceapi.com'
  };

  // Generate Binance Pay signature
  private static generateSignature(timestamp: number, nonce: string, body: string): string {
    const payload = timestamp + '\n' + nonce + '\n' + body + '\n';
    return createHmac('sha512', this.binanceConfig.secretKey)
      .update(payload)
      .digest('hex')
      .toUpperCase();
  }

  // Generate random nonce
  private static generateNonce(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Create Binance Pay order for company payments
  static async createBinancePayOrder(
    companyId: number, 
    amount: number, 
    currency: string = 'USDT',
    purpose: string = 'bounty_payment'
  ) {
    try {
      const timestamp = Date.now();
      const nonce = this.generateNonce();
      const merchantOrderId = `CyberHunt_${companyId}_${timestamp}`;

      const orderData: CryptoPaymentRequest = {
        amount: amount / 100, // Convert cents to dollars
        currency,
        merchantOrderId,
        description: `CyberHunt ${purpose} - Company ${companyId}`,
        returnUrl: `${process.env.FRONTEND_URL}/payment/success`,
        cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel`
      };

      const body = JSON.stringify(orderData);
      const signature = this.generateSignature(timestamp, nonce, body);

      const headers = {
        'Content-Type': 'application/json',
        'BinancePay-Timestamp': timestamp.toString(),
        'BinancePay-Nonce': nonce,
        'BinancePay-Certificate-SN': this.binanceConfig.apiKey,
        'BinancePay-Signature': signature
      };

      // In production, make actual API call to Binance Pay
      // For now, simulate the response
      const mockResponse = {
        status: 'SUCCESS',
        data: {
          prepayId: `mock_prepay_${merchantOrderId}`,
          terminalType: 'WEB',
          expireTime: timestamp + (30 * 60 * 1000), // 30 minutes
          qrcodeLink: `https://qr.binance.com/mock_${merchantOrderId}`,
          qrContent: `binancepay://pay?prepayId=mock_prepay_${merchantOrderId}`,
          checkoutUrl: `https://pay.binance.com/checkout/mock_${merchantOrderId}`,
          deeplink: `binancepay://pay?prepayId=mock_prepay_${merchantOrderId}`,
          universalUrl: `https://app.binance.com/payment/mock_${merchantOrderId}`
        }
      };

      // Store payment intent in database
      const paymentIntent = await storage.createCryptoPaymentIntent({
        companyId,
        amount,
        currency,
        purpose,
        providerOrderId: mockResponse.data.prepayId,
        merchantOrderId,
        status: 'pending',
        provider: 'binance_pay',
        metadata: {
          qrcodeLink: mockResponse.data.qrcodeLink,
          checkoutUrl: mockResponse.data.checkoutUrl,
          expireTime: mockResponse.data.expireTime
        }
      });

      return {
        paymentIntent,
        binancePayData: mockResponse.data
      };
    } catch (error) {
      console.error('Error creating Binance Pay order:', error);
      throw error;
    }
  }

  // Verify Binance Pay webhook signature
  static verifyWebhookSignature(signature: string, timestamp: string, body: string): boolean {
    try {
      const expectedSignature = createHmac('sha512', this.binanceConfig.secretKey)
        .update(timestamp + body)
        .digest('hex')
        .toUpperCase();
      
      return signature === expectedSignature;
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  // Handle Binance Pay webhook
  static async handleBinancePayWebhook(webhookData: any) {
    try {
      const { merchantOrderId, status, transactionId } = webhookData;

      if (status === 'SUCCESS') {
        // Find payment intent
        const paymentIntent = await storage.getCryptoPaymentIntentByMerchantOrderId(merchantOrderId);
        if (!paymentIntent) {
          throw new Error('Payment intent not found');
        }

        // Update payment status
        await storage.updateCryptoPaymentIntent(paymentIntent.id, {
          status: 'completed',
          transactionId,
          completedAt: new Date()
        });

        // Create transaction record for tracking (balance will be updated manually by admin)
        await storage.createCompanyTransaction({
          companyId: paymentIntent.companyId,
          amount: 0, // No automatic balance update
          type: 'crypto_payment_pending',
          note: `Crypto payment received via Binance Pay: ${transactionId} - Amount: ${(paymentIntent.amount / 100).toFixed(2)} ${paymentIntent.currency} - Pending admin approval`
        });

        // Create crypto transaction record
        await storage.createCryptoTransaction({
          companyId: paymentIntent.companyId,
          transactionType: 'payment_in',
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          transactionHash: transactionId,
          status: 'confirmed',
          relatedPaymentIntentId: paymentIntent.id,
          metadata: {
            note: 'Payment to admin Binance account - requires manual wallet update'
          }
        });

        return { success: true };
      } else if (status === 'FAILED' || status === 'EXPIRED') {
        // Update payment status to failed
        const paymentIntent = await storage.getCryptoPaymentIntentByMerchantOrderId(merchantOrderId);
        if (paymentIntent) {
          await storage.updateCryptoPaymentIntent(paymentIntent.id, {
            status: 'failed',
            completedAt: new Date()
          });
        }
        return { success: false, reason: status };
      }
    } catch (error) {
      console.error('Error handling Binance Pay webhook:', error);
      throw error;
    }
  }

  // Create crypto withdrawal for researchers
  static async createCryptoWithdrawal(withdrawalRequest: CryptoWithdrawalRequest) {
    try {
      const { userId, amount, currency, walletAddress, network } = withdrawalRequest;

      // Verify user has sufficient balance
      const wallet = await storage.getWallet(userId);
      if (!wallet || wallet.balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Verify wallet address format (basic validation)
      if (!this.isValidWalletAddress(walletAddress, network)) {
        throw new Error('Invalid wallet address');
      }

      // Check withdrawal limits and fraud detection
      const fraudCheck = await this.performWithdrawalFraudCheck(userId, amount);
      if (fraudCheck.isFraudulent) {
        throw new Error(`Withdrawal blocked: ${fraudCheck.reason}`);
      }

      // Create withdrawal record with pending status for admin approval
      const withdrawal = await storage.createCryptoWithdrawal({
        userId,
        amount,
        currency,
        walletAddress: encrypt(walletAddress), // Encrypt wallet address
        network,
        status: 'pending', // Always start as pending for admin approval
        provider: 'binance_pay'
      });

      // Don't deduct from wallet yet - wait for admin approval
      // Create transaction record as pending approval
      await storage.createTransaction({
        walletId: wallet.id,
        type: 'crypto_withdrawal_request',
        amount: -amount,
        description: `Crypto withdrawal request to ${walletAddress.substring(0, 10)}... - Pending approval`,
        status: 'pending_approval'
      });

      return withdrawal;
    } catch (error) {
      console.error('Error creating crypto withdrawal:', error);
      throw error;
    }
  }

  // Validate wallet address format
  private static isValidWalletAddress(address: string, network: string): boolean {
    switch (network.toLowerCase()) {
      case 'bitcoin':
      case 'btc':
        return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/.test(address);
      case 'ethereum':
      case 'eth':
      case 'erc20':
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      case 'bsc':
      case 'binance':
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      case 'tron':
      case 'trx':
        return /^T[A-Za-z1-9]{33}$/.test(address);
      default:
        return address.length > 20 && address.length < 100; // Basic length check
    }
  }

  // Fraud detection for withdrawals
  private static async performWithdrawalFraudCheck(
    userId: number, 
    amount: number
  ): Promise<{ isFraudulent: boolean; reason?: string }> {
    try {
      // Check withdrawal frequency
      const recentWithdrawals = await storage.getRecentCryptoWithdrawals(userId, 24); // Last 24 hours
      if (recentWithdrawals.length > 5) {
        return { isFraudulent: true, reason: 'Too many withdrawal attempts in 24 hours' };
      }

      // Check large amounts
      if (amount > 500000) { // > $5000
        return { isFraudulent: true, reason: 'Large withdrawal amount requires manual review' };
      }

      // Check total daily withdrawal amount
      const dailyTotal = recentWithdrawals.reduce((sum, w) => sum + w.amount, 0);
      if (dailyTotal + amount > 1000000) { // > $10,000 daily limit
        return { isFraudulent: true, reason: 'Daily withdrawal limit exceeded' };
      }

      return { isFraudulent: false };
    } catch (error) {
      console.error('Error in withdrawal fraud check:', error);
      return { isFraudulent: false }; // Allow withdrawal if check fails
    }
  }

  // Add user wallet
  static async addUserWallet(userId: number, walletData: {
    walletType: string;
    walletAddress: string;
    network: string;
  }) {
    try {
      const { walletType, walletAddress, network } = walletData;

      // Validate wallet address
      if (!this.isValidWalletAddress(walletAddress, network)) {
        throw new Error('Invalid wallet address format');
      }

      // Check if wallet already exists
      const existingWallet = await storage.getCryptoWalletByAddress(walletAddress);
      if (existingWallet) {
        throw new Error('Wallet address already registered');
      }

      // Create wallet record
      const wallet = await storage.createCryptoWallet({
        userId,
        walletType,
        walletAddress: encrypt(walletAddress),
        network,
        isVerified: false
      });

      // In production, implement wallet verification process
      // For now, auto-verify
      await storage.updateCryptoWallet(wallet.id, { isVerified: true });

      return wallet;
    } catch (error) {
      console.error('Error adding user wallet:', error);
      throw error;
    }
  }

  // Get user wallets
  static async getUserWallets(userId: number) {
    try {
      const wallets = await storage.getCryptoWalletsByUser(userId);
      
      // Decrypt wallet addresses for display (mask for security)
      return wallets.map(wallet => ({
        ...wallet,
        walletAddress: this.maskWalletAddress(decrypt(wallet.walletAddress))
      }));
    } catch (error) {
      console.error('Error getting user wallets:', error);
      throw error;
    }
  }

  // Mask wallet address for security
  private static maskWalletAddress(address: string): string {
    if (address.length <= 10) return address;
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
  }

  // Get crypto withdrawal history
  static async getCryptoWithdrawals(userId: number, limit: number = 50) {
    try {
      return await storage.getCryptoWithdrawalsByUser(userId, limit);
    } catch (error) {
      console.error('Error getting crypto withdrawals:', error);
      throw error;
    }
  }

  // Get platform crypto statistics (for admin)
  static async getCryptoStatistics() {
    try {
      const stats = await storage.getCryptoStatistics();
      return {
        totalCryptoPayments: stats.totalPayments || 0,
        totalCryptoWithdrawals: stats.totalWithdrawals || 0,
        pendingWithdrawals: stats.pendingWithdrawals || 0,
        totalVolume: stats.totalVolume || 0
      };
    } catch (error) {
      console.error('Error getting crypto statistics:', error);
      return {
        totalCryptoPayments: 0,
        totalCryptoWithdrawals: 0,
        pendingWithdrawals: 0,
        totalVolume: 0
      };
    }
  }
}
