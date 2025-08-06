import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Wallet, Copy, QrCode, ExternalLink } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { useToast } from '../hooks/use-toast';
import { MatrixBackground } from '../components/matrix-background';
import { Navbar } from '../components/layout/navbar';
import { TwoFactorVerification } from '../components/two-factor-verification';
import { SecurityNotice } from '../components/security-notice';

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

const BINANCE_PAY_ID = "928374001";
const BINANCE_QR_CODE = "https://qr.binance.com/en/qr/dplk/928374001";

export default function CryptoPaymentPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [companyWallet, setCompanyWallet] = useState<CompanyWallet | null>(null);
  const [transactions, setTransactions] = useState<CompanyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [show2FA, setShow2FA] = useState(false);
  const [pendingDeposit, setPendingDeposit] = useState<{ amount: number; currency: string } | null>(null);

  useEffect(() => {
    if (user?.userType === 'company') {
      fetchWalletData();
      fetchTransactions();
    }
  }, [user]);

  const fetchWalletData = async () => {
    try {
      const response = await fetch('/api/company/wallet', {
        credentials: 'include'
      });
      if (response.ok) {
        const wallet = await response.json();
        setCompanyWallet(wallet);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/company/transactions', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
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

  const verify2FA = async (code: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          code, 
          operation: 'crypto_deposit',
          amount: pendingDeposit?.amount 
        })
      });

      if (response.ok) {
        // Proceed with the actual deposit after 2FA verification
        await processCryptoDeposit();
        return true;
      }
      return false;
    } catch (error) {
      console.error('2FA verification failed:', error);
      return false;
    }
  };

  const processCryptoDeposit = async () => {
    if (!pendingDeposit) return;

    try {
      const response = await fetch('/api/crypto/payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: Math.round(pendingDeposit.amount * 100),
          currency: pendingDeposit.currency,
          purpose: 'wallet_topup'
        })
      });

      if (response.ok) {
        toast({
          title: "Deposit Request Created",
          description: `Your deposit request for ${pendingDeposit.amount} ${pendingDeposit.currency} has been submitted for processing.`,
        });
        fetchWalletData();
        fetchTransactions();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to process deposit",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Failed to process deposit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPendingDeposit(null);
    }
  };

  const handleCryptoDeposit = (amount: number, currency: string = 'USDT') => {
    setPendingDeposit({ amount, currency });
    setShow2FA(true);
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

      <main className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold text-matrix mb-2">Company Wallet</h1>
          <p className="text-dim-gray">Fund your bounty program with cryptocurrency</p>
        </div>

        <SecurityNotice />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Wallet Balance */}
          <Card className="bg-dark-bg/50 border-matrix/20">
            <CardHeader>
              <CardTitle className="text-matrix flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-matrix mb-4">
                {companyWallet ? formatCurrency(companyWallet.balance) : '$0.00'}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-dim-gray">Total Deposited:</span>
                  <span className="text-light-gray">
                    {companyWallet ? formatCurrency(companyWallet.totalPaid) : '$0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dim-gray">Last Updated:</span>
                  <span className="text-light-gray">
                    {companyWallet ? formatDate(companyWallet.lastUpdated) : 'Never'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Binance Pay Payment */}
          <Card className="bg-dark-bg/50 border-matrix/20">
            <CardHeader>
              <CardTitle className="text-matrix flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Fund Wallet - Binance Pay
              </CardTitle>
              <CardDescription className="text-dim-gray">
                Send cryptocurrency to fund your wallet balance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Code */}
              <div className="text-center">
                <div className="inline-block p-4 bg-white rounded-lg">
                  <img 
                    src={BINANCE_QR_CODE} 
                    alt="Binance Pay QR Code"
                    className="w-48 h-48 mx-auto"
                    onError={(e) => {
                      // Fallback if QR code fails to load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling!.style.display = 'block';
                    }}
                  />
                  <div className="hidden w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                    QR Code
                  </div>
                </div>
                <p className="text-xs text-dim-gray mt-2">Scan with Binance app</p>
              </div>

              {/* Pay ID */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-dim-gray block mb-2">Binance Pay ID</label>
                  <div className="flex items-center gap-2 p-3 bg-deep-black/50 border border-matrix/20 rounded">
                    <code className="flex-1 text-matrix font-mono">{BINANCE_PAY_ID}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(BINANCE_PAY_ID, "Pay ID")}
                      className="text-matrix hover:bg-matrix/20"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg">
                  <h4 className="text-blue-400 font-medium mb-2">Payment Instructions</h4>
                  <ol className="text-sm text-dim-gray space-y-1">
                    <li>1. Open your Binance app</li>
                    <li>2. Go to Pay → Send</li>
                    <li>3. Scan QR code or enter Pay ID: <code className="text-matrix">{BINANCE_PAY_ID}</code></li>
                    <li>4. Send USDT, BUSD, or other supported cryptocurrencies</li>
                    <li>5. Your balance will be updated manually after confirmation</li>
                  </ol>
                </div>

                <div className="p-4 bg-amber-600/10 border border-amber-600/30 rounded-lg">
                  <h4 className="text-amber-400 font-medium mb-2">Important Notes</h4>
                  <ul className="text-sm text-dim-gray space-y-1">
                    <li>• Include your company name in the payment memo</li>
                    <li>• Balance updates are processed manually within 24 hours</li>
                    <li>• Contact support if your payment isn't reflected after 24 hours</li>
                  </ul>
                </div>

                <Button 
                  className="w-full bg-amber-600/20 border-amber-600/30 hover:bg-amber-600/30 text-amber-400"
                  onClick={() => window.open('https://www.binance.com/en/download', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Download Binance App
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="mt-8 bg-dark-bg/50 border-matrix/20">
          <CardHeader>
            <CardTitle className="text-matrix">Transaction History</CardTitle>
            <CardDescription className="text-dim-gray">
              Recent wallet activity and balance updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-deep-black/50">
                <TabsTrigger value="all" className="data-[state=active]:bg-matrix/20 data-[state=active]:text-matrix">
                  All Transactions
                </TabsTrigger>
                <TabsTrigger value="deposits" className="data-[state=active]:bg-matrix/20 data-[state=active]:text-matrix">
                  Deposits
                </TabsTrigger>
                <TabsTrigger value="payments" className="data-[state=active]:bg-matrix/20 data-[state=active]:text-matrix">
                  Payments
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <div className="space-y-4">
                  {transactions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-dim-gray">No transactions yet</p>
                      <p className="text-sm text-dim-gray mt-1">
                        Make your first deposit using Binance Pay above
                      </p>
                    </div>
                  ) : (
                    transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-deep-black/30 border border-matrix/10 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-light-gray">
                            {transaction.type === 'admin_adjustment' ? 'Balance Update' : 
                             transaction.type === 'crypto_deposit' ? 'Crypto Deposit' : 
                             'Payment'}
                          </div>
                          <div className="text-sm text-dim-gray">{transaction.note}</div>
                          <div className="text-xs text-dim-gray">{formatDate(transaction.createdAt)}</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${transaction.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                          </div>
                          <Badge variant="outline" className="border-matrix/20 text-dim-gray mt-1">
                            {transaction.amount > 0 ? 'Credit' : 'Debit'}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="deposits" className="mt-6">
                <div className="space-y-4">
                  {transactions.filter(t => t.amount > 0).length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-dim-gray">No deposits yet</p>
                    </div>
                  ) : (
                    transactions
                      .filter(t => t.amount > 0)
                      .map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 bg-deep-black/30 border border-matrix/10 rounded-lg"
                        >
                          <div>
                            <div className="font-medium text-light-gray">Balance Update</div>
                            <div className="text-sm text-dim-gray">{transaction.note}</div>
                            <div className="text-xs text-dim-gray">{formatDate(transaction.createdAt)}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-400">
                              +{formatCurrency(transaction.amount)}
                            </div>
                            <Badge variant="outline" className="border-green-400/20 text-green-400 mt-1">
                              Credit
                            </Badge>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="payments" className="mt-6">
                <div className="space-y-4">
                  {transactions.filter(t => t.amount < 0).length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-dim-gray">No payments yet</p>
                    </div>
                  ) : (
                    transactions
                      .filter(t => t.amount < 0)
                      .map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 bg-deep-black/30 border border-matrix/10 rounded-lg"
                        >
                          <div>
                            <div className="font-medium text-light-gray">Bounty Payment</div>
                            <div className="text-sm text-dim-gray">{transaction.note}</div>
                            <div className="text-xs text-dim-gray">{formatDate(transaction.createdAt)}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-red-400">
                              {formatCurrency(transaction.amount)}
                            </div>
                            <Badge variant="outline" className="border-red-400/20 text-red-400 mt-1">
                              Debit
                            </Badge>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <TwoFactorVerification
        isOpen={show2FA}
        onClose={() => {
          setShow2FA(false);
          setPendingDeposit(null);
        }}
        onVerify={verify2FA}
        operation="crypto deposit"
        amount={pendingDeposit?.amount}
        currency={pendingDeposit?.currency}
      />
    </div>
  );
}