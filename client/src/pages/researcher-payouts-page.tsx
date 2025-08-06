
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Wallet, Clock, CheckCircle, XCircle, CreditCard, TrendingUp, DollarSign, Calendar, ArrowUpRight, ArrowDownRight, Eye, Download } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { Progress } from '../components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface Payout {
  id: number;
  amount: number;
  currency: string;
  status: string;
  completedAt: string | null;
  createdAt: string;
  submissionTitle: string;
  paymentMethodName: string;
}

interface PaymentMethod {
  id: number;
  name: string;
  type: string;
  supportedCurrencies: string[];
}

interface EarningsData {
  month: string;
  earnings: number;
  payouts: number;
}

interface HackerBalance {
  currentBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  lastUpdated: string;
}

export default function ResearcherPayoutsPage() {
  const { user } = useAuth();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [hackerBalance, setHackerBalance] = useState<HackerBalance | null>(null);
  const [earningsHistory, setEarningsHistory] = useState<EarningsData[]>([]);
  const [loading, setLoading] = useState(true);

  // Payout request form state
  const [selectedSubmission, setSelectedSubmission] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch payouts
      const payoutsResponse = await fetch('/api/payouts', {
        credentials: 'include'
      });
      if (payoutsResponse.ok) {
        const payoutsData = await payoutsResponse.json();
        setPayouts(payoutsData);
      }

      // Fetch payment methods
      const methodsResponse = await fetch('/api/payment-methods', {
        credentials: 'include'
      });
      if (methodsResponse.ok) {
        const methodsData = await methodsResponse.json();
        setPaymentMethods(methodsData);
      }

      // Fetch user submissions
      const submissionsResponse = await fetch('/api/submissions', {
        credentials: 'include'
      });
      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json();
        const approvedSubmissions = submissionsData.filter(
          (sub: any) => sub.status === 'approved' && sub.reward > 0
        );
        setSubmissions(approvedSubmissions);
      }

      // Fetch hacker balance (simulate for now)
      const totalCompleted = payouts
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

      const pendingAmount = payouts
        .filter(p => ['pending', 'processing'].includes(p.status))
        .reduce((sum, p) => sum + p.amount, 0);

      setHackerBalance({
        currentBalance: totalCompleted,
        pendingBalance: pendingAmount,
        totalEarnings: totalCompleted + pendingAmount + (user?.reputation || 0) * 10,
        lastUpdated: new Date().toISOString()
      });

      // Generate mock earnings history
      const last6Months = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        last6Months.push({
          month,
          earnings: Math.floor(Math.random() * 5000) + 1000,
          payouts: Math.floor(Math.random() * 8) + 2
        });
      }
      setEarningsHistory(last6Months);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching payout data:', error);
      setLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    setRequestLoading(true);
    try {
      const response = await fetch('/api/payouts/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          submissionId: parseInt(selectedSubmission),
          paymentMethodId: parseInt(selectedPaymentMethod),
          paymentDetails: { destination: paymentDetails }
        })
      });

      if (response.ok) {
        setShowRequestDialog(false);
        setSelectedSubmission('');
        setSelectedPaymentMethod('');
        setPaymentDetails('');
        fetchData();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error requesting payout:', error);
      alert('Failed to request payout');
    } finally {
      setRequestLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount / 100);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-500',
      processing: 'bg-blue-500',
      completed: 'bg-green-500',
      failed: 'bg-red-500',
      cancelled: 'bg-gray-500'
    };

    return (
      <Badge className={`${statusColors[status] || 'bg-gray-500'} text-white`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Chart colors
  const COLORS = ['#00ff00', '#00cccc', '#ffff00', '#ff6600'];

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-black text-light-gray p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading hacker dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-black text-light-gray p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-mono font-bold text-matrix mb-2">Hacker Dashboard</h1>
            <p className="text-dim-gray">Track your earnings, balance, and manage payouts</p>
            {hackerBalance && (
              <p className="text-xs text-dim-gray mt-1">
                Last updated: {new Date(hackerBalance.lastUpdated).toLocaleString()}
              </p>
            )}
          </div>
          
          <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
            <DialogTrigger asChild>
              <Button className="bg-matrix hover:bg-matrix-dark text-black font-mono">
                <Wallet className="mr-2 h-4 w-4" />
                Request Payout
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-terminal border border-matrix/30 text-light-gray">
              <DialogHeader>
                <DialogTitle className="text-matrix font-mono">Request Payout</DialogTitle>
                <DialogDescription className="text-dim-gray">
                  Request a payout for your approved submissions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="submission" className="text-light-gray">Submission</Label>
                  <Select value={selectedSubmission} onValueChange={setSelectedSubmission}>
                    <SelectTrigger className="bg-terminal border-matrix/30 text-light-gray">
                      <SelectValue placeholder="Select submission" />
                    </SelectTrigger>
                    <SelectContent>
                      {submissions.map((submission) => (
                        <SelectItem key={submission.id} value={submission.id.toString()}>
                          {submission.title} - {formatCurrency(submission.reward)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod" className="text-light-gray">Payment Method</Label>
                  <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                    <SelectTrigger className="bg-terminal border-matrix/30 text-light-gray">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id.toString()}>
                          {method.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentDetails" className="text-light-gray">Payment Details</Label>
                  <Input
                    id="paymentDetails"
                    placeholder="Email, wallet address, or account number"
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                    className="bg-terminal border-matrix/30 text-light-gray"
                  />
                </div>
                <Button 
                  onClick={handleRequestPayout}
                  disabled={requestLoading || !selectedSubmission || !selectedPaymentMethod || !paymentDetails}
                  className="w-full bg-matrix hover:bg-matrix-dark text-black font-mono"
                >
                  {requestLoading ? 'Processing...' : 'Request Payout'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Balance Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="terminal-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dim-gray">Current Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-matrix" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-light-gray">
                {formatCurrency(hackerBalance?.currentBalance || 0)}
              </div>
              <p className="text-xs text-dim-gray">Available for withdrawal</p>
            </CardContent>
          </Card>

          <Card className="terminal-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dim-gray">Pending Balance</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-light-gray">
                {formatCurrency(hackerBalance?.pendingBalance || 0)}
              </div>
              <p className="text-xs text-dim-gray">Awaiting processing</p>
            </CardContent>
          </Card>

          <Card className="terminal-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dim-gray">Total Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 text-matrix" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-light-gray">
                {formatCurrency(hackerBalance?.totalEarnings || 0)}
              </div>
              <p className="text-xs text-dim-gray">Lifetime earnings</p>
            </CardContent>
          </Card>

          <Card className="terminal-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dim-gray">Available for Payout</CardTitle>
              <Wallet className="h-4 w-4 text-electric-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-light-gray">
                {submissions.length}
              </div>
              <p className="text-xs text-dim-gray">Approved submissions</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="bg-terminal border-b border-matrix/30 w-full justify-start rounded-b-none h-12 p-0">
            <TabsTrigger 
              value="overview" 
              className="font-mono data-[state=active]:text-matrix data-[state=active]:border-matrix data-[state=active]:border-b-2 rounded-none h-full px-4"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="earnings" 
              className="font-mono data-[state=active]:text-matrix data-[state=active]:border-matrix data-[state=active]:border-b-2 rounded-none h-full px-4"
            >
              Earnings History
            </TabsTrigger>
            <TabsTrigger 
              value="payouts" 
              className="font-mono data-[state=active]:text-matrix data-[state=active]:border-matrix data-[state=active]:border-b-2 rounded-none h-full px-4"
            >
              Payout History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Earnings Trend Chart */}
              <Card className="terminal-card">
                <CardHeader>
                  <CardTitle className="text-xl font-mono text-matrix">Earnings Trend (Last 6 Months)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={earningsHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="month" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a1a1a', 
                          border: '1px solid #00ff00',
                          borderRadius: '4px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="earnings" 
                        stroke="#00ff00" 
                        strokeWidth={2}
                        dot={{ fill: '#00ff00', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Payout Methods Distribution */}
              <Card className="terminal-card">
                <CardHeader>
                  <CardTitle className="text-xl font-mono text-matrix">Payout Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Crypto', value: 40, color: '#00ff00' },
                          { name: 'PayPal', value: 35, color: '#00cccc' },
                          { name: 'Bank Transfer', value: 20, color: '#ffff00' },
                          { name: 'Other', value: 5, color: '#ff6600' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: 'Crypto', value: 40, color: '#00ff00' },
                          { name: 'PayPal', value: 35, color: '#00cccc' },
                          { name: 'Bank Transfer', value: 20, color: '#ffff00' },
                          { name: 'Other', value: 5, color: '#ff6600' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Monthly Performance */}
              <Card className="terminal-card">
                <CardHeader>
                  <CardTitle className="text-xl font-mono text-matrix">Monthly Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={earningsHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="month" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a1a1a', 
                          border: '1px solid #00ff00',
                          borderRadius: '4px'
                        }}
                      />
                      <Bar dataKey="payouts" fill="#00ff00" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="terminal-card">
                <CardHeader>
                  <CardTitle className="text-xl font-mono text-matrix">Quick Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-dim-gray">Average Monthly Earnings</span>
                      <span className="text-light-gray font-mono">
                        {formatCurrency(earningsHistory.reduce((sum, data) => sum + data.earnings, 0) / earningsHistory.length)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-dim-gray">Best Month</span>
                      <span className="text-matrix font-mono">
                        {earningsHistory.reduce((best, current) => 
                          current.earnings > best.earnings ? current : best, earningsHistory[0]
                        )?.month || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-dim-gray">Total Payouts Received</span>
                      <span className="text-light-gray font-mono">
                        {payouts.filter(p => p.status === 'completed').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-dim-gray">Success Rate</span>
                      <span className="text-matrix font-mono">
                        {payouts.length > 0 ? Math.round((payouts.filter(p => p.status === 'completed').length / payouts.length) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="earnings" className="pt-6">
            <Card className="terminal-card">
              <CardHeader>
                <CardTitle className="text-xl font-mono text-matrix">Detailed Earnings History</CardTitle>
                <CardDescription className="text-dim-gray">
                  Track your earnings progression over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {earningsHistory.map((data, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-matrix/20 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Calendar className="h-5 w-5 text-matrix" />
                        <div>
                          <div className="font-mono text-light-gray">{data.month}</div>
                          <div className="text-sm text-dim-gray">
                            {data.payouts} payout{data.payouts !== 1 ? 's' : ''} received
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-lg text-matrix">
                          {formatCurrency(data.earnings)}
                        </div>
                        <div className="flex items-center text-sm text-dim-gray">
                          {index > 0 && (
                            <>
                              {data.earnings > earningsHistory[index - 1].earnings ? (
                                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                              ) : (
                                <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                              )}
                              {Math.abs(((data.earnings - earningsHistory[index - 1].earnings) / earningsHistory[index - 1].earnings) * 100).toFixed(1)}%
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts" className="pt-6">
            <Card className="terminal-card">
              <CardHeader>
                <CardTitle className="text-xl font-mono text-matrix">Payout History</CardTitle>
              </CardHeader>
              <CardContent>
                {payouts.length > 0 ? (
                  <div className="space-y-4">
                    {payouts.map((payout) => (
                      <div key={payout.id} className="flex items-center justify-between p-4 border border-matrix/20 rounded-lg">
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(payout.status)}
                          <div>
                            <div className="font-mono text-light-gray">{payout.submissionTitle}</div>
                            <div className="text-sm text-dim-gray">
                              via {payout.paymentMethodName} • {new Date(payout.createdAt).toLocaleDateString()}
                              {payout.completedAt && (
                                <span className="ml-2">
                                  • Completed {new Date(payout.completedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-lg text-matrix">
                            {formatCurrency(payout.amount, payout.currency)}
                          </div>
                          {getStatusBadge(payout.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-dim-gray py-8">
                    <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No payouts yet</p>
                    <p className="text-sm">Get some submissions approved to request payouts</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
