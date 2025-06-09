
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Wallet, Clock, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';

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

export default function ResearcherPayoutsPage() {
  const { user } = useAuth();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
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
        // Filter approved submissions without payouts
        const approvedSubmissions = submissionsData.filter(
          (sub: any) => sub.status === 'approved' && sub.reward > 0
        );
        setSubmissions(approvedSubmissions);
      }

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
        fetchData(); // Refresh data
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

  const totalEarnings = payouts
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayouts = payouts
    .filter(p => ['pending', 'processing'].includes(p.status))
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-black text-light-gray p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading payout dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-black text-light-gray p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-mono font-bold text-matrix mb-2">Payout Dashboard</h1>
            <p className="text-dim-gray">Manage your bounty payouts and earnings</p>
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

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="terminal-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dim-gray">Total Earnings</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-light-gray">
                {formatCurrency(totalEarnings)}
              </div>
            </CardContent>
          </Card>

          <Card className="terminal-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dim-gray">Pending Payouts</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-light-gray">
                {formatCurrency(pendingPayouts)}
              </div>
            </CardContent>
          </Card>

          <Card className="terminal-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dim-gray">Available for Payout</CardTitle>
              <Wallet className="h-4 w-4 text-matrix" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-light-gray">
                {submissions.length}
              </div>
              <p className="text-xs text-dim-gray">Approved submissions</p>
            </CardContent>
          </Card>
        </div>

        {/* Payouts Table */}
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
      </div>
    </div>
  );
}
