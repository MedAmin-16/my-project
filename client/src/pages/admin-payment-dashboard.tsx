
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { DollarSign, Shield, AlertTriangle, TrendingUp, Clock, Users } from 'lucide-react';

interface PaymentAnalytics {
  totalPayments: { count: number; total: number };
  totalPayouts: { count: number; total: number };
  pendingEscrow: { count: number; total: number };
  commissions: { totalCommissions: number; count: number };
}

interface PaymentDispute {
  id: number;
  disputeType: string;
  description: string;
  status: string;
  resolution: string | null;
  createdAt: string;
  resolvedAt: string | null;
  submissionTitle: string;
  disputedByName: string;
}

export default function AdminPaymentDashboard() {
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
  const [disputes, setDisputes] = useState<PaymentDispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<PaymentDispute | null>(null);
  const [disputeStatus, setDisputeStatus] = useState('');
  const [disputeResolution, setDisputeResolution] = useState('');
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch payment analytics
      const analyticsResponse = await fetch('/api/admin/payment-analytics', {
        credentials: 'include'
      });
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      }

      // Fetch payment disputes
      const disputesResponse = await fetch('/api/admin/disputes', {
        credentials: 'include'
      });
      if (disputesResponse.ok) {
        const disputesData = await disputesResponse.json();
        setDisputes(disputesData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching admin payment data:', error);
      setLoading(false);
    }
  };

  const handleResolveDispute = async () => {
    if (!selectedDispute || !disputeStatus) return;

    setUpdateLoading(true);
    try {
      const response = await fetch(`/api/admin/disputes/${selectedDispute.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          status: disputeStatus,
          resolution: disputeResolution
        })
      });

      if (response.ok) {
        setSelectedDispute(null);
        setDisputeStatus('');
        setDisputeResolution('');
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error resolving dispute:', error);
      alert('Failed to resolve dispute');
    } finally {
      setUpdateLoading(false);
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
      open: 'bg-red-500',
      under_review: 'bg-yellow-500',
      resolved: 'bg-green-500',
      rejected: 'bg-gray-500'
    };

    return (
      <Badge className={`${statusColors[status] || 'bg-gray-500'} text-white`}>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-black text-light-gray p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading admin payment dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-black text-light-gray p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold text-matrix mb-2">Payment Administration</h1>
          <p className="text-dim-gray">Monitor and manage all payment activities, disputes, and analytics</p>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="terminal-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dim-gray">Total Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-light-gray">
                {analytics ? formatCurrency(analytics.totalPayments.total || 0) : '$0.00'}
              </div>
              <p className="text-xs text-dim-gray">
                {analytics?.totalPayments.count || 0} transactions
              </p>
            </CardContent>
          </Card>

          <Card className="terminal-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dim-gray">Total Payouts</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-light-gray">
                {analytics ? formatCurrency(analytics.totalPayouts.total || 0) : '$0.00'}
              </div>
              <p className="text-xs text-dim-gray">
                {analytics?.totalPayouts.count || 0} payouts
              </p>
            </CardContent>
          </Card>

          <Card className="terminal-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dim-gray">Pending Escrow</CardTitle>
              <Shield className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-light-gray">
                {analytics ? formatCurrency(analytics.pendingEscrow.total || 0) : '$0.00'}
              </div>
              <p className="text-xs text-dim-gray">
                {analytics?.pendingEscrow.count || 0} accounts
              </p>
            </CardContent>
          </Card>

          <Card className="terminal-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dim-gray">Platform Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-matrix" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-light-gray">
                {analytics ? formatCurrency(analytics.commissions.totalCommissions || 0) : '$0.00'}
              </div>
              <p className="text-xs text-dim-gray">
                {analytics?.commissions.count || 0} commissions
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="disputes" className="space-y-6">
          <TabsList className="bg-terminal border border-matrix/30">
            <TabsTrigger value="disputes" className="data-[state=active]:bg-matrix/20">Payment Disputes</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-matrix/20">Analytics</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-matrix/20">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="disputes">
            <Card className="terminal-card">
              <CardHeader>
                <CardTitle className="text-xl font-mono text-matrix">Payment Disputes</CardTitle>
                <CardDescription className="text-dim-gray">
                  Manage and resolve payment-related disputes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {disputes.length > 0 ? (
                  <div className="space-y-4">
                    {disputes.map((dispute) => (
                      <div key={dispute.id} className="flex items-center justify-between p-4 border border-matrix/20 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          <div>
                            <div className="font-mono text-light-gray">{dispute.submissionTitle}</div>
                            <div className="text-sm text-dim-gray">
                              {dispute.disputeType.replace('_', ' ')} • by {dispute.disputedByName}
                            </div>
                            <div className="text-sm text-dim-gray mt-1">
                              {dispute.description.substring(0, 100)}...
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          {getStatusBadge(dispute.status)}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedDispute(dispute);
                                  setDisputeStatus(dispute.status);
                                  setDisputeResolution(dispute.resolution || '');
                                }}
                                className="border-matrix/30 text-matrix hover:bg-matrix/10"
                              >
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-terminal border border-matrix/30 text-light-gray max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-matrix font-mono">
                                  Dispute Resolution
                                </DialogTitle>
                                <DialogDescription className="text-dim-gray">
                                  Review and resolve the payment dispute
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-mono text-light-gray mb-2">Dispute Details</h4>
                                  <p className="text-dim-gray">{dispute.description}</p>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-light-gray font-mono">Status</label>
                                  <Select value={disputeStatus} onValueChange={setDisputeStatus}>
                                    <SelectTrigger className="bg-terminal border-matrix/30 text-light-gray">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="under_review">Under Review</SelectItem>
                                      <SelectItem value="resolved">Resolved</SelectItem>
                                      <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-light-gray font-mono">Resolution</label>
                                  <Textarea
                                    value={disputeResolution}
                                    onChange={(e) => setDisputeResolution(e.target.value)}
                                    placeholder="Enter resolution details..."
                                    className="bg-terminal border-matrix/30 text-light-gray"
                                  />
                                </div>
                                <Button 
                                  onClick={handleResolveDispute}
                                  disabled={updateLoading || !disputeStatus}
                                  className="w-full bg-matrix hover:bg-matrix-dark text-black font-mono"
                                >
                                  {updateLoading ? 'Updating...' : 'Update Dispute'}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-dim-gray py-8">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No payment disputes</p>
                    <p className="text-sm">All payments are proceeding smoothly</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="terminal-card">
                <CardHeader>
                  <CardTitle className="text-xl font-mono text-matrix">Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-dim-gray">Platform Commissions</span>
                      <span className="text-light-gray font-mono">
                        {analytics ? formatCurrency(analytics.commissions.totalCommissions || 0) : '$0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dim-gray">Processing Fees</span>
                      <span className="text-light-gray font-mono">$0.00</span>
                    </div>
                    <div className="border-t border-matrix/20 pt-4">
                      <div className="flex justify-between font-mono">
                        <span className="text-matrix">Total Revenue</span>
                        <span className="text-matrix">
                          {analytics ? formatCurrency(analytics.commissions.totalCommissions || 0) : '$0.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="terminal-card">
                <CardHeader>
                  <CardTitle className="text-xl font-mono text-matrix">Transaction Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-dim-gray">Incoming Payments</span>
                      <span className="text-light-gray font-mono">
                        {analytics?.totalPayments.count || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dim-gray">Outgoing Payouts</span>
                      <span className="text-light-gray font-mono">
                        {analytics?.totalPayouts.count || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dim-gray">Active Escrows</span>
                      <span className="text-light-gray font-mono">
                        {analytics?.pendingEscrow.count || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="terminal-card">
              <CardHeader>
                <CardTitle className="text-xl font-mono text-matrix">Payment Settings</CardTitle>
                <CardDescription className="text-dim-gray">
                  Configure platform payment parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-mono text-light-gray mb-4">Commission Rates</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-dim-gray">Standard Rate</span>
                        <span className="text-matrix font-mono">15%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-dim-gray">Premium Programs</span>
                        <span className="text-matrix font-mono">12%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-mono text-light-gray mb-4">Payout Limits</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-dim-gray">Daily Limit</span>
                        <span className="text-matrix font-mono">$10,000</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-dim-gray">Monthly Limit</span>
                        <span className="text-matrix font-mono">$100,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
