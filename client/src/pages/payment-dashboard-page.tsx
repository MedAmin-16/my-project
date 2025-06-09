
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { CreditCard, DollarSign, Shield, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';

interface PaymentIntent {
  id: number;
  amount: number;
  currency: string;
  status: string;
  purpose: string;
  createdAt: string;
}

interface EscrowAccount {
  id: number;
  amount: number;
  currency: string;
  status: string;
  submissionId: number;
  platformCommission: number;
  researcherPayout: number;
  createdAt: string;
}

export default function PaymentDashboardPage() {
  const { user } = useAuth();
  const [paymentIntents, setPaymentIntents] = useState<PaymentIntent[]>([]);
  const [escrowAccounts, setEscrowAccounts] = useState<EscrowAccount[]>([]);
  const [companyWallet, setCompanyWallet] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Deposit form state
  const [depositAmount, setDepositAmount] = useState('');
  const [depositCurrency, setDepositCurrency] = useState('USD');
  const [depositLoading, setDepositLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch company wallet
      const walletResponse = await fetch('/api/company/wallet', {
        credentials: 'include'
      });
      if (walletResponse.ok) {
        const wallet = await walletResponse.json();
        setCompanyWallet(wallet);
      }

      // Fetch payment analytics (admin endpoint, but companies should have their own)
      const analyticsResponse = await fetch('/api/admin/payment-analytics', {
        credentials: 'include'
      });
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching payment data:', error);
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    setDepositLoading(true);
    try {
      const amount = Math.floor(parseFloat(depositAmount) * 100); // Convert to cents

      // Create payment intent
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          amount,
          currency: depositCurrency,
          purpose: 'wallet_topup'
        })
      });

      if (response.ok) {
        const { clientSecret } = await response.json();
        
        // In a real implementation, you would integrate with Stripe Elements here
        // For demo purposes, we'll simulate successful payment
        setTimeout(async () => {
          const confirmResponse = await fetch('/api/payments/confirm', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
              paymentIntentId: 'pi_simulated_' + Date.now()
            })
          });

          if (confirmResponse.ok) {
            setDepositAmount('');
            fetchData(); // Refresh data
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Error processing deposit:', error);
    } finally {
      setDepositLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount / 100);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-500',
      succeeded: 'bg-green-500',
      failed: 'bg-red-500',
      held: 'bg-blue-500',
      released: 'bg-green-500'
    };

    return (
      <Badge className={`${statusColors[status] || 'bg-gray-500'} text-white`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-black text-light-gray p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading payment dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-black text-light-gray p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold text-matrix mb-2">Payment Dashboard</h1>
          <p className="text-dim-gray">Manage your company's payments, escrow, and bounty settlements</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="terminal-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dim-gray">Wallet Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-matrix" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-light-gray">
                {companyWallet ? formatCurrency(companyWallet.balance) : '$0.00'}
              </div>
            </CardContent>
          </Card>

          <Card className="terminal-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dim-gray">Total Paid</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-light-gray">
                {companyWallet ? formatCurrency(companyWallet.totalPaid) : '$0.00'}
              </div>
            </CardContent>
          </Card>

          <Card className="terminal-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dim-gray">Pending Escrow</CardTitle>
              <Shield className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-light-gray">
                {analytics ? formatCurrency(analytics.pendingEscrow.total || 0) : '$0.00'}
              </div>
            </CardContent>
          </Card>

          <Card className="terminal-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dim-gray">Platform Fees</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-light-gray">
                {analytics ? formatCurrency(analytics.commissions?.totalCommissions || 0) : '$0.00'}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="deposit" className="space-y-6">
          <TabsList className="bg-terminal border border-matrix/30">
            <TabsTrigger value="deposit" className="data-[state=active]:bg-matrix/20">Deposit Funds</TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-matrix/20">Transactions</TabsTrigger>
            <TabsTrigger value="escrow" className="data-[state=active]:bg-matrix/20">Escrow Accounts</TabsTrigger>
          </TabsList>

          <TabsContent value="deposit">
            <Card className="terminal-card">
              <CardHeader>
                <CardTitle className="text-xl font-mono text-matrix">Add Funds to Wallet</CardTitle>
                <CardDescription className="text-dim-gray">
                  Deposit funds to pay for bounties and platform fees
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-light-gray">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="bg-terminal border-matrix/30 text-light-gray"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency" className="text-light-gray">Currency</Label>
                    <Select value={depositCurrency} onValueChange={setDepositCurrency}>
                      <SelectTrigger className="bg-terminal border-matrix/30 text-light-gray">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={handleDeposit}
                  disabled={depositLoading || !depositAmount}
                  className="bg-matrix hover:bg-matrix-dark text-black font-mono"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {depositLoading ? 'Processing...' : 'Add Funds'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="terminal-card">
              <CardHeader>
                <CardTitle className="text-xl font-mono text-matrix">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-dim-gray py-8">
                  No transactions yet. Make a deposit to get started.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="escrow">
            <Card className="terminal-card">
              <CardHeader>
                <CardTitle className="text-xl font-mono text-matrix">Escrow Accounts</CardTitle>
                <CardDescription className="text-dim-gray">
                  Funds held in escrow for approved bounties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-dim-gray py-8">
                  No escrow accounts. Approve some submissions to create escrow accounts.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
