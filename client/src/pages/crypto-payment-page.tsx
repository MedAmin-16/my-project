import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { QrCode, Wallet, TrendingUp, Clock, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { MatrixBackground } from '../components/matrix-background';
import { Navbar } from '../components/layout/navbar';

interface CryptoNetwork {
  id: number;
  network: string;
  displayName: string;
  currency: string;
  isActive: boolean;
  minWithdrawal: number;
  maxWithdrawal: number;
  networkFee: number;
}

interface CryptoPaymentIntent {
  id: number;
  amount: number;
  currency: string;
  status: string;
  purpose: string;
  providerOrderId: string;
  transactionId?: string;
  metadata?: any;
  createdAt: string;
  completedAt?: string;
}

export default function CryptoPaymentPage() {
  const { user } = useAuth();
  const [cryptoNetworks, setCryptoNetworks] = useState<CryptoNetwork[]>([]);
  const [paymentIntents, setPaymentIntents] = useState<CryptoPaymentIntent[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<any>(null);

  // Payment form state
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USDT');
  const [purpose, setPurpose] = useState('wallet_topup');

  useEffect(() => {
    fetchCryptoNetworks();
    fetchPaymentHistory();
  }, []);

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

  const fetchPaymentHistory = async () => {
    try {
      const response = await fetch('/api/crypto/payments');
      if (response.ok) {
        const payments = await response.json();
        setPaymentIntents(payments);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  const createPaymentIntent = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/crypto/payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(parseFloat(amount) * 100), // Convert to cents
          currency,
          purpose
        })
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentPayment(result);
        setShowPaymentDialog(true);
        fetchPaymentHistory();
        setAmount('');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create payment');
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      alert('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-600"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'expired':
        return <Badge className="bg-gray-600"><XCircle className="h-3 w-3 mr-1" />Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${(amount / 100).toFixed(2)} ${currency}`;
  };

  const openBinancePayment = () => {
    if (currentPayment?.binancePayData?.checkoutUrl) {
      window.open(currentPayment.binancePayData.checkoutUrl, '_blank');
    }
  };

  if (user?.userType !== 'company') {
    return (
      <div className="min-h-screen bg-deep-black relative">
        <MatrixBackground className="opacity-20" />
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="terminal-card p-8 text-center">
            <h2 className="text-2xl font-mono text-matrix mb-4">Access Denied</h2>
            <p className="text-dim-gray">This page is only available to company accounts.</p>
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
            <h1 className="text-3xl font-mono font-bold text-matrix mb-2">Cryptocurrency Payments</h1>
            <p className="text-dim-gray">Fund your bounty wallet using cryptocurrency via Binance Pay</p>
            <div className="mt-4 p-4 border border-yellow-600/30 rounded-lg bg-yellow-600/10">
              <div className="flex items-center gap-2 text-yellow-400 mb-2">
                <span className="font-mono">📋 Payment Process</span>
              </div>
              <p className="text-sm text-dim-gray">
                Your payment will be sent to our secure Binance account. Once confirmed, your wallet balance will be updated by our admin team within 24 hours.
              </p>
            </div>
          </div>

        <Tabs defaultValue="payment" className="space-y-6">
          <TabsList className="terminal-tabs">
            <TabsTrigger value="payment" className="terminal-tab">
              <Wallet className="h-4 w-4 mr-2" />
              Make Payment
            </TabsTrigger>
            <TabsTrigger value="history" className="terminal-tab">
              <TrendingUp className="h-4 w-4 mr-2" />
              Payment History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payment">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="terminal-card">
                <CardHeader>
                  <CardTitle className="text-xl font-mono text-matrix">Create Payment</CardTitle>
                  <CardDescription className="text-dim-gray">
                    Fund your wallet using cryptocurrency via Binance Pay
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-light-gray font-mono">Amount (USD)</Label>
                    <Input
                      type="number"
                      placeholder="100.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="terminal-input mt-1"
                      min="1"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <Label className="text-light-gray font-mono">Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
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
                    <Label className="text-light-gray font-mono">Purpose</Label>
                    <Select value={purpose} onValueChange={setPurpose}>
                      <SelectTrigger className="terminal-input mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="terminal-select">
                        <SelectItem value="wallet_topup">Wallet Top-up</SelectItem>
                        <SelectItem value="bounty_payment">Direct Bounty Payment</SelectItem>
                        <SelectItem value="subscription">Service Subscription</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={createPaymentIntent}
                    disabled={loading || !amount}
                    className="terminal-button w-full"
                  >
                    {loading ? 'Creating Payment...' : 'Create Crypto Payment'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="terminal-card">
                <CardHeader>
                  <CardTitle className="text-xl font-mono text-matrix">Supported Networks</CardTitle>
                  <CardDescription className="text-dim-gray">
                    Available cryptocurrency networks and fees
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
                          <p className="text-xs text-dim-gray">Min: ${(network.minWithdrawal / 100).toFixed(0)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card className="terminal-card">
              <CardHeader>
                <CardTitle className="text-xl font-mono text-matrix">Payment History</CardTitle>
                <CardDescription className="text-dim-gray">
                  Your cryptocurrency payment transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentIntents.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-dim-gray">No payment history found</p>
                    </div>
                  ) : (
                    paymentIntents.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 border border-dark-terminal rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono text-light-gray">
                              {formatAmount(payment.amount, payment.currency)}
                            </span>
                            {getStatusBadge(payment.status)}
                          </div>
                          <p className="text-sm text-dim-gray">{payment.purpose.replace('_', ' ')}</p>
                          <p className="text-xs text-dim-gray">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          {payment.transactionId && (
                            <p className="text-xs text-matrix font-mono">
                              {payment.transactionId.substring(0, 16)}...
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

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="terminal-card max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-mono text-matrix">Complete Payment</DialogTitle>
            <DialogDescription className="text-dim-gray">
              Use Binance Pay to complete your cryptocurrency payment
            </DialogDescription>
          </DialogHeader>

          {currentPayment && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg inline-block mb-4">
                  <QrCode className="h-32 w-32 text-black" />
                </div>
                <p className="text-sm text-dim-gray">Scan QR code with Binance app</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-dim-gray">Amount:</span>
                  <span className="text-matrix font-mono">
                    {formatAmount(currentPayment.paymentIntent.amount, currentPayment.paymentIntent.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dim-gray">Order ID:</span>
                  <span className="text-light-gray font-mono text-sm">
                    {currentPayment.paymentIntent.merchantOrderId}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={openBinancePayment} 
                  className="terminal-button flex-1"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Binance Pay
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPaymentDialog(false)}
                  className="terminal-button-outline"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}