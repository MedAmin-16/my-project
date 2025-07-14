
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { CreditCard, Wallet, Clock, CheckCircle, XCircle, AlertTriangle, ExternalLink, Copy } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { useToast } from '../hooks/use-toast';
import { MatrixBackground } from '../components/matrix-background';
import { Navbar } from '../components/layout/navbar';

interface CompanyWallet {
  id: number;
  companyId: number;
  balance: number;
  totalPaid: number;
  lastUpdated: string;
}

interface CompanyTransaction {
  id: number;
  companyId: number;
  amount: number;
  type: string;
  note: string;
  createdAt: string;
}

interface CryptoPaymentIntent {
  id: number;
  companyId: number;
  amount: number;
  currency: string;
  status: string;
  providerOrderId: string;
  merchantOrderId: string;
  metadata: any;
  createdAt: string;
}

interface CryptoNetwork {
  id: number;
  networkName: string;
  displayName: string;
  currency: string;
  isActive: boolean;
  minWithdrawal: number;
  maxWithdrawal: number;
  feePercentage: number;
}

export default function CryptoPaymentPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [companyWallet, setCompanyWallet] = useState<CompanyWallet | null>(null);
  const [transactions, setTransactions] = useState<CompanyTransaction[]>([]);
  const [paymentIntents, setPaymentIntents] = useState<CryptoPaymentIntent[]>([]);
  const [cryptoNetworks, setCryptoNetworks] = useState<CryptoNetwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  // Payment form states
  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USDT');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.userType === 'company') {
      fetchCompanyWallet();
      fetchTransactions();
      fetchPaymentIntents();
      fetchCryptoNetworks();
    }
  }, [user]);

  const fetchCompanyWallet = async () => {
    try {
      const response = await fetch('/api/company/wallet');
      if (response.ok) {
        const data = await response.json();
        setCompanyWallet(data);
      }
    } catch (error) {
      console.error('Error fetching company wallet:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/company/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchPaymentIntents = async () => {
    try {
      const response = await fetch('/api/crypto/payments');
      if (response.ok) {
        const data = await response.json();
        setPaymentIntents(data);
      }
    } catch (error) {
      console.error('Error fetching payment intents:', error);
    }
  };

  const fetchCryptoNetworks = async () => {
    try {
      const response = await fetch('/api/crypto/networks');
      if (response.ok) {
        const data = await response.json();
        setCryptoNetworks(data);
      }
    } catch (error) {
      console.error('Error fetching crypto networks:', error);
    }
  };

  const handleCreatePayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      });
      return;
    }

    setPaymentLoading(true);
    try {
      const response = await fetch('/api/crypto/payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(parseFloat(paymentAmount) * 100), // Convert to cents
          currency: selectedCurrency,
          purpose: 'wallet_topup'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Open Binance Pay checkout in new window
        if (data.binancePayData?.checkoutUrl) {
          window.open(data.binancePayData.checkoutUrl, '_blank');
        }

        toast({
          title: "Payment Created",
          description: "Redirecting to Binance Pay. Complete the payment to fund your wallet.",
        });

        setIsPaymentDialogOpen(false);
        setPaymentAmount('');
        fetchPaymentIntents();
      } else {
        const error = await response.json();
        toast({
          title: "Payment Failed",
          description: error.error || "Failed to create payment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Payment Error",
        description: "Failed to create payment intent",
        variant: "destructive",
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    if (currency === 'USD') {
      return `$${(amount / 100).toFixed(2)}`;
    }
    return `${amount.toFixed(2)} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <h1 className="text-3xl font-mono font-bold text-matrix mb-2">Company Crypto Wallet</h1>
          <p className="text-dim-gray">Fund your bounty program with cryptocurrency via Binance Pay</p>
          <div className="mt-4 p-4 border border-blue-600/30 rounded-lg bg-blue-600/10">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <span className="font-mono">💰 Binance Pay Integration</span>
            </div>
            <p className="text-sm text-dim-gray">
              Fund your wallet using Binance Pay. Payments go directly to our admin account and your wallet balance is updated manually after confirmation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wallet Overview */}
          <div className="lg:col-span-1">
            <Card className="bg-dark-bg/50 border-matrix/20">
              <CardHeader>
                <CardTitle className="text-matrix flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Wallet Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-matrix mb-2">
                  {companyWallet ? formatCurrency(companyWallet.balance) : '$0.00'}
                </div>
                <div className="text-sm text-dim-gray">
                  Total Paid: {companyWallet ? formatCurrency(companyWallet.totalPaid) : '$0.00'}
                </div>
                <div className="text-xs text-dim-gray mt-1">
                  Last Updated: {companyWallet ? formatDate(companyWallet.lastUpdated) : 'Never'}
                </div>
                
                <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-4 bg-matrix/20 border-matrix/30 hover:bg-matrix/30 text-matrix">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Fund Wallet
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-deep-black border-matrix/20">
                    <DialogHeader>
                      <DialogTitle className="text-matrix">Fund Wallet via Binance Pay</DialogTitle>
                      <DialogDescription className="text-dim-gray">
                        Add funds to your wallet using cryptocurrency via Binance Pay
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="amount" className="text-dim-gray">Amount (USD)</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="Enter amount"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          className="bg-dark-bg/50 border-matrix/20 text-light-gray"
                        />
                      </div>
                      <div>
                        <Label htmlFor="currency" className="text-dim-gray">Currency</Label>
                        <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                          <SelectTrigger className="bg-dark-bg/50 border-matrix/20 text-light-gray">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-deep-black border-matrix/20">
                            <SelectItem value="USDT">USDT (Tether)</SelectItem>
                            <SelectItem value="BTC">BTC (Bitcoin)</SelectItem>
                            <SelectItem value="ETH">ETH (Ethereum)</SelectItem>
                            <SelectItem value="BNB">BNB (Binance Coin)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="p-3 bg-blue-600/10 border border-blue-600/30 rounded-lg">
                        <p className="text-sm text-blue-400">
                          <strong>Note:</strong> Payment will redirect to Binance Pay. After successful payment, your wallet balance will be updated manually by our admin team.
                        </p>
                      </div>
                      <Button 
                        onClick={handleCreatePayment} 
                        disabled={paymentLoading}
                        className="w-full bg-matrix/20 border-matrix/30 hover:bg-matrix/30 text-matrix"
                      >
                        {paymentLoading ? 'Creating Payment...' : 'Create Binance Pay Order'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          {/* Payment History & Transactions */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="payments" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-dark-bg/50 border-matrix/20">
                <TabsTrigger value="payments" className="text-dim-gray data-[state=active]:text-matrix">
                  Crypto Payments
                </TabsTrigger>
                <TabsTrigger value="transactions" className="text-dim-gray data-[state=active]:text-matrix">
                  Transactions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="payments" className="mt-4">
                <Card className="bg-dark-bg/50 border-matrix/20">
                  <CardHeader>
                    <CardTitle className="text-matrix">Crypto Payment History</CardTitle>
                    <CardDescription className="text-dim-gray">
                      View all your Binance Pay payment attempts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {paymentIntents.length === 0 ? (
                        <p className="text-dim-gray text-center py-8">No payment attempts yet</p>
                      ) : (
                        paymentIntents.map((payment) => (
                          <div key={payment.id} className="p-4 border border-matrix/20 rounded-lg bg-dark-bg/30">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-matrix">
                                    {formatCurrency(payment.amount)} {payment.currency}
                                  </span>
                                  <Badge className={getStatusColor(payment.status)}>
                                    {getStatusIcon(payment.status)}
                                    {payment.status}
                                  </Badge>
                                </div>
                                <div className="text-sm text-dim-gray mt-1">
                                  Order ID: {payment.merchantOrderId}
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => copyToClipboard(payment.merchantOrderId)}
                                    className="ml-2 h-6 w-6 p-0"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-dim-gray">
                                  {formatDate(payment.createdAt)}
                                </div>
                                {payment.metadata?.checkoutUrl && payment.status === 'pending' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => window.open(payment.metadata.checkoutUrl, '_blank')}
                                    className="mt-2 border-matrix/30 text-matrix hover:bg-matrix/20"
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Pay Now
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="transactions" className="mt-4">
                <Card className="bg-dark-bg/50 border-matrix/20">
                  <CardHeader>
                    <CardTitle className="text-matrix">Transaction History</CardTitle>
                    <CardDescription className="text-dim-gray">
                      View all wallet transactions and balance updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {transactions.length === 0 ? (
                        <p className="text-dim-gray text-center py-8">No transactions yet</p>
                      ) : (
                        transactions.map((transaction) => (
                          <div key={transaction.id} className="p-4 border border-matrix/20 rounded-lg bg-dark-bg/30">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`font-mono ${
                                    transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                                  }`}>
                                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                                  </span>
                                  <Badge variant="outline" className="border-matrix/20 text-dim-gray">
                                    {transaction.type.replace('_', ' ')}
                                  </Badge>
                                </div>
                                <div className="text-sm text-dim-gray mt-1">
                                  {transaction.note}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-dim-gray">
                                  {formatDate(transaction.createdAt)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
