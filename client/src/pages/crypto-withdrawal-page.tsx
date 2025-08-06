import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Wallet, Plus, Clock, CheckCircle, XCircle, AlertTriangle, Copy } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { MatrixBackground } from '../components/matrix-background';
import { Navbar } from '../components/layout/navbar';
import { TwoFactorVerification } from '../components/two-factor-verification';
import { SecurityNotice } from '../components/security-notice';

interface CryptoWallet {
  id: number;
  walletType: string;
  walletAddress: string;
  network: string;
  isVerified: boolean;
  createdAt: string;
}

interface CryptoWithdrawal {
  id: number;
  amount: number;
  currency: string;
  status: string;
  transactionId?: string;
  completedAt?: string;
  createdAt: string;
}

interface CryptoNetwork {
  id: number;
  network: string;
  displayName: string;
  currency: string;
  minWithdrawal: number;
  maxWithdrawal: number;
  networkFee: number;
}

export default function CryptoWithdrawalPage() {
  const { user } = useAuth();
  const [userWallets, setUserWallets] = useState<CryptoWallet[]>([]);
  const [withdrawals, setWithdrawals] = useState<CryptoWithdrawal[]>([]);
  const [cryptoNetworks, setCryptoNetworks] = useState<CryptoNetwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [showWithdrawalDialog, setShowWithdrawalDialog] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [pendingWithdrawal, setPendingWithdrawal] = useState<{
    amount: number;
    currency: string;
    walletAddress: string;
    network: string;
  } | null>(null);

  // Wallet form state
  const [walletType, setWalletType] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [walletNetwork, setWalletNetwork] = useState('');

  // Withdrawal form state
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalCurrency, setWithdrawalCurrency] = useState('USDT');
  const [selectedWallet, setSelectedWallet] = useState<CryptoWallet | null>(null);

  useEffect(() => {
    fetchUserWallets();
    fetchWithdrawals();
    fetchCryptoNetworks();
  }, []);

  const fetchUserWallets = async () => {
    try {
      const response = await fetch('/api/crypto/wallets');
      if (response.ok) {
        const wallets = await response.json();
        setUserWallets(wallets);
      }
    } catch (error) {
      console.error('Error fetching user wallets:', error);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const response = await fetch('/api/crypto/withdrawals');
      if (response.ok) {
        const withdrawalData = await response.json();
        setWithdrawals(withdrawalData);
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    }
  };

  const fetchCryptoNetworks = async () => {
    try {
      const response = await fetch('/api/crypto/networks');
      if (response.ok) {
        const networks = await response.json();
        setCryptoNetworks(networks);
      }
    } catch (error) {
      console.error('Error fetching crypto networks:', error);
    }
  };

  const addWallet = async () => {
    if (!walletType || !walletAddress || !walletNetwork) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/crypto/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletType,
          walletAddress,
          network: walletNetwork
        })
      });

      if (response.ok) {
        await fetchUserWallets();
        setShowWalletDialog(false);
        setWalletType('');
        setWalletAddress('');
        setWalletNetwork('');
        alert('Wallet added successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add wallet');
      }
    } catch (error) {
      console.error('Error adding wallet:', error);
      alert('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createWithdrawal = async () => {
    if (!withdrawalAmount || !selectedWallet) {
      alert('Please select a wallet and enter an amount');
      return;
    }

    const amount = parseFloat(withdrawalAmount);
    if (amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // Set up 2FA verification before processing withdrawal
    setPendingWithdrawal({
      amount,
      currency: withdrawalCurrency,
      walletAddress: selectedWallet.walletAddress,
      network: selectedWallet.network
    });
    setShowWithdrawalDialog(false);
    setShow2FA(true);
  };

  const verify2FA = async (code: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          code, 
          operation: 'crypto_withdrawal',
          amount: pendingWithdrawal?.amount 
        })
      });

      if (response.ok) {
        // Proceed with the actual withdrawal after 2FA verification
        await processWithdrawal();
        return true;
      }
      return false;
    } catch (error) {
      console.error('2FA verification failed:', error);
      return false;
    }
  };

  const processWithdrawal = async () => {
    if (!pendingWithdrawal) return;

    setLoading(true);
    try {
      const response = await fetch('/api/crypto/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(pendingWithdrawal.amount * 100), // Convert to cents
          currency: pendingWithdrawal.currency,
          walletAddress: pendingWithdrawal.walletAddress,
          network: pendingWithdrawal.network
        })
      });

      if (response.ok) {
        await fetchWithdrawals();
        setWithdrawalAmount('');
        setSelectedWallet(null);
        alert('Withdrawal request submitted successfully and is under review!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create withdrawal');
      }
    } catch (error) {
      console.error('Error creating withdrawal:', error);
      alert('Network error occurred');
    } finally {
      setLoading(false);
      setPendingWithdrawal(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'processing':
        return <Badge className="bg-blue-600"><Clock className="h-3 w-3 mr-1" />Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-600"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-600"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${(amount / 100).toFixed(2)} ${currency}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (user?.userType !== 'hacker') {
    return (
      <div className="min-h-screen bg-deep-black relative">
        <MatrixBackground className="opacity-20" />
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="terminal-card p-8 text-center">
            <h2 className="text-2xl font-mono text-matrix mb-4">Access Denied</h2>
            <p className="text-dim-gray">This page is only available to researcher accounts.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground className="opacity-20" />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold text-matrix mb-2">Crypto Withdrawals</h1>
          <p className="text-dim-gray">Withdraw your bounty earnings to your cryptocurrency wallets</p>
          <div className="mt-4 p-4 border border-green-600/30 rounded-lg bg-green-600/10">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <span className="font-mono">🔐 Crypto Only</span>
            </div>
            <p className="text-sm text-dim-gray">
              All researcher payments are processed exclusively through cryptocurrency. Add your crypto wallet to receive bounty payments.
            </p>
          </div>
        </div>

        <SecurityNotice />

        <Tabs defaultValue="withdrawal" className="space-y-6">
          <TabsList className="terminal-tabs">
            <TabsTrigger value="withdrawal" className="terminal-tab">
              <Wallet className="h-4 w-4 mr-2" />
              Withdraw
            </TabsTrigger>
            <TabsTrigger value="wallets" className="terminal-tab">
              <Plus className="h-4 w-4 mr-2" />
              My Wallets
            </TabsTrigger>
            <TabsTrigger value="history" className="terminal-tab">
              <Clock className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="withdrawal">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="terminal-card">
                <CardHeader>
                  <CardTitle className="text-xl font-mono text-matrix">Create Withdrawal</CardTitle>
                  <CardDescription className="text-dim-gray">
                    Withdraw your earnings to your crypto wallet
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-light-gray font-mono">Amount (USD)</Label>
                    <Input
                      type="number"
                      placeholder="50.00"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      className="terminal-input mt-1"
                      min="1"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <Label className="text-light-gray font-mono">Currency</Label>
                    <Select value={withdrawalCurrency} onValueChange={setWithdrawalCurrency}>
                      <SelectTrigger className="terminal-input mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="terminal-select">
                        <SelectItem value="USDT">USDT (Tether)</SelectItem>
                        <SelectItem value="BTC">BTC (Bitcoin)</SelectItem>
                        <SelectItem value="ETH">ETH (Ethereum)</SelectItem>
                        <SelectItem value="BNB">BNB (Binance Coin)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-light-gray font-mono">Destination Wallet</Label>
                    <Select onValueChange={(value) => {
                      const wallet = userWallets.find(w => w.id.toString() === value);
                      setSelectedWallet(wallet || null);
                    }}>
                      <SelectTrigger className="terminal-input mt-1">
                        <SelectValue placeholder="Select a wallet" />
                      </SelectTrigger>
                      <SelectContent className="terminal-select">
                        {userWallets.map((wallet) => (
                          <SelectItem key={wallet.id} value={wallet.id.toString()}>
                            {wallet.walletType} - {wallet.network} ({wallet.walletAddress})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {userWallets.length === 0 && (
                    <div className="p-4 border border-yellow-600/30 rounded-lg bg-yellow-600/10">
                      <div className="flex items-center gap-2 text-yellow-400 mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-mono">No Wallets Found</span>
                      </div>
                      <p className="text-sm text-dim-gray">
                        Please add a crypto wallet first in the "My Wallets" tab.
                      </p>
                    </div>
                  )}

                  <Button 
                    onClick={() => setShowWithdrawalDialog(true)}
                    disabled={loading || !withdrawalAmount || !selectedWallet}
                    className="terminal-button w-full"
                  >
                    {loading ? 'Processing...' : 'Create Withdrawal'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="terminal-card">
                <CardHeader>
                  <CardTitle className="text-xl font-mono text-matrix">Withdrawal Limits</CardTitle>
                  <CardDescription className="text-dim-gray">
                    Network fees and limits per currency
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cryptoNetworks.map((network) => (
                      <div key={network.id} className="flex items-center justify-between p-3 border border-dark-terminal rounded-lg">
                        <div>
                          <span className="font-mono text-light-gray">{network.displayName}</span>
                          <p className="text-sm text-dim-gray">{network.currency}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-matrix">Fee: ${(network.networkFee / 100).toFixed(2)}</p>
                          <p className="text-xs text-dim-gray">
                            Min: ${(network.minWithdrawal / 100).toFixed(0)} | 
                            Max: ${(network.maxWithdrawal / 100).toFixed(0)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="wallets">
            <Card className="terminal-card">
              <CardHeader>
                <CardTitle className="text-xl font-mono text-matrix flex items-center justify-between">
                  My Crypto Wallets
                  <Button 
                    onClick={() => setShowWalletDialog(true)}
                    className="terminal-button-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Wallet
                  </Button>
                </CardTitle>
                <CardDescription className="text-dim-gray">
                  Manage your cryptocurrency wallet addresses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userWallets.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-dim-gray">No wallets added yet</p>
                      <Button 
                        onClick={() => setShowWalletDialog(true)}
                        className="terminal-button mt-4"
                      >
                        Add Your First Wallet
                      </Button>
                    </div>
                  ) : (
                    userWallets.map((wallet) => (
                      <div key={wallet.id} className="flex items-center justify-between p-4 border border-dark-terminal rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono text-light-gray">{wallet.walletType}</span>
                            <Badge className={wallet.isVerified ? "bg-green-600" : "bg-yellow-600"}>
                              {wallet.isVerified ? "Verified" : "Pending"}
                            </Badge>
                          </div>
                          <p className="text-sm text-dim-gray">{wallet.network}</p>
                          <p className="text-xs text-dim-gray font-mono">
                            {wallet.walletAddress}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(wallet.walletAddress)}
                          className="terminal-button-outline"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="terminal-card">
              <CardHeader>
                <CardTitle className="text-xl font-mono text-matrix">Withdrawal History</CardTitle>
                <CardDescription className="text-dim-gray">
                  Your cryptocurrency withdrawal transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {withdrawals.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-dim-gray">No withdrawals found</p>
                    </div>
                  ) : (
                    withdrawals.map((withdrawal) => (
                      <div key={withdrawal.id} className="flex items-center justify-between p-4 border border-dark-terminal rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono text-light-gray">
                              {formatAmount(withdrawal.amount, withdrawal.currency)}
                            </span>
                            {getStatusBadge(withdrawal.status)}
                          </div>
                          <p className="text-xs text-dim-gray">
                            {new Date(withdrawal.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          {withdrawal.transactionId && (
                            <p className="text-xs text-matrix font-mono">
                              {withdrawal.transactionId.substring(0, 16)}...
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Wallet Dialog */}
      <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
        <DialogContent className="terminal-card max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-mono text-matrix">Add Crypto Wallet</DialogTitle>
            <DialogDescription className="text-dim-gray">
              Add a new cryptocurrency wallet for withdrawals
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-light-gray font-mono">Wallet Type</Label>
              <Select value={walletType} onValueChange={setWalletType}>
                <SelectTrigger className="terminal-input mt-1">
                  <SelectValue placeholder="Select wallet type" />
                </SelectTrigger>
                <SelectContent className="terminal-select">
                  <SelectItem value="binance">Binance</SelectItem>
                  <SelectItem value="metamask">MetaMask</SelectItem>
                  <SelectItem value="trust_wallet">Trust Wallet</SelectItem>
                  <SelectItem value="coinbase">Coinbase</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-light-gray font-mono">Network</Label>
              <Select value={walletNetwork} onValueChange={setWalletNetwork}>
                <SelectTrigger className="terminal-input mt-1">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent className="terminal-select">
                  <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                  <SelectItem value="bsc">Binance Smart Chain (BSC)</SelectItem>
                  <SelectItem value="tron">Tron (TRX)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-light-gray font-mono">Wallet Address</Label>
              <Input
                type="text"
                placeholder="Enter your wallet address"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="terminal-input mt-1"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={addWallet}
                disabled={loading || !walletType || !walletAddress || !walletNetwork}
                className="terminal-button flex-1"
              >
                {loading ? 'Adding...' : 'Add Wallet'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowWalletDialog(false)}
                className="terminal-button-outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdrawal Confirmation Dialog */}
      <Dialog open={showWithdrawalDialog} onOpenChange={setShowWithdrawalDialog}>
        <DialogContent className="terminal-card max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-mono text-matrix">Confirm Withdrawal</DialogTitle>
            <DialogDescription className="text-dim-gray">
              Please review and confirm your withdrawal details
            </DialogDescription>
          </DialogHeader>

          {selectedWallet && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-dim-gray">Amount:</span>
                  <span className="text-matrix font-mono">
                    {withdrawalAmount} {withdrawalCurrency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dim-gray">Destination:</span>
                  <span className="text-light-gray font-mono text-sm">
                    {selectedWallet.walletType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dim-gray">Network:</span>
                  <span className="text-light-gray">{selectedWallet.network}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dim-gray">Address:</span>
                  <span className="text-light-gray font-mono text-xs">
                    {selectedWallet.walletAddress}
                  </span>
                </div>
              </div>

              <div className="p-4 border border-red-600/30 rounded-lg bg-red-600/10">
                <div className="flex items-center gap-2 text-red-400 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-mono">Important</span>
                </div>
                <p className="text-sm text-dim-gray">
                  Please double-check the wallet address. Cryptocurrency transactions cannot be reversed.
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={createWithdrawal}
                  disabled={loading}
                  className="terminal-button flex-1"
                >
                  {loading ? 'Processing...' : 'Confirm Withdrawal'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowWithdrawalDialog(false)}
                  className="terminal-button-outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <TwoFactorVerification
        isOpen={show2FA}
        onClose={() => {
          setShow2FA(false);
          setPendingWithdrawal(null);
        }}
        onVerify={verify2FA}
        operation="crypto withdrawal"
        amount={pendingWithdrawal?.amount}
        currency={pendingWithdrawal?.currency}
      />
    </div>
  );
}