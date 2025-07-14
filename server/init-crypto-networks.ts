
import { storage } from './storage';

const defaultNetworks = [
  {
    network: 'bitcoin',
    displayName: 'Bitcoin',
    currency: 'BTC',
    isActive: true,
    minWithdrawal: 1000, // $10 minimum
    maxWithdrawal: 1000000, // $10,000 maximum
    networkFee: 500, // $5 network fee
    confirmationsRequired: 1,
    processingTimeMinutes: 30,
    metadata: {
      decimals: 8,
      explorerUrl: 'https://blockstream.info/tx/',
      rpcUrl: 'https://blockstream.info/api/'
    }
  },
  {
    network: 'ethereum',
    displayName: 'Ethereum',
    currency: 'ETH',
    isActive: true,
    minWithdrawal: 2000, // $20 minimum (higher due to gas fees)
    maxWithdrawal: 1000000, // $10,000 maximum
    networkFee: 1000, // $10 network fee
    confirmationsRequired: 12,
    processingTimeMinutes: 15,
    metadata: {
      decimals: 18,
      explorerUrl: 'https://etherscan.io/tx/',
      rpcUrl: 'https://mainnet.infura.io/v3/'
    }
  },
  {
    network: 'bsc',
    displayName: 'Binance Smart Chain',
    currency: 'BNB',
    isActive: true,
    minWithdrawal: 500, // $5 minimum
    maxWithdrawal: 1000000, // $10,000 maximum
    networkFee: 100, // $1 network fee
    confirmationsRequired: 15,
    processingTimeMinutes: 5,
    metadata: {
      decimals: 18,
      explorerUrl: 'https://bscscan.com/tx/',
      rpcUrl: 'https://bsc-dataseed.binance.org/'
    }
  },
  {
    network: 'tron',
    displayName: 'Tron',
    currency: 'TRX',
    isActive: true,
    minWithdrawal: 500, // $5 minimum
    maxWithdrawal: 1000000, // $10,000 maximum
    networkFee: 50, // $0.50 network fee
    confirmationsRequired: 20,
    processingTimeMinutes: 3,
    metadata: {
      decimals: 6,
      explorerUrl: 'https://tronscan.org/#/transaction/',
      rpcUrl: 'https://api.trongrid.io'
    }
  },
  {
    network: 'polygon',
    displayName: 'Polygon',
    currency: 'MATIC',
    isActive: true,
    minWithdrawal: 500, // $5 minimum
    maxWithdrawal: 1000000, // $10,000 maximum
    networkFee: 25, // $0.25 network fee
    confirmationsRequired: 100,
    processingTimeMinutes: 2,
    metadata: {
      decimals: 18,
      explorerUrl: 'https://polygonscan.com/tx/',
      rpcUrl: 'https://polygon-rpc.com/'
    }
  }
];

export async function initializeCryptoNetworks() {
  try {
    console.log('Initializing cryptocurrency networks...');
    
    for (const networkData of defaultNetworks) {
      try {
        await storage.createCryptoNetworkSettings(networkData);
        console.log(`✓ Initialized ${networkData.displayName} network`);
      } catch (error) {
        // Network might already exist, skip error
        console.log(`- ${networkData.displayName} network already exists`);
      }
    }
    
    console.log('✓ Cryptocurrency networks initialization completed');
  } catch (error) {
    console.error('Error initializing crypto networks:', error);
  }
}

// Auto-run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeCryptoNetworks()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Failed to initialize crypto networks:', error);
      process.exit(1);
    });
}
