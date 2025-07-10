
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";

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

export default function CompanyWalletPage() {
  const [wallet, setWallet] = useState<CompanyWallet | null>(null);
  const [transactions, setTransactions] = useState<CompanyTransaction[]>([]);
  const [isRechargeDialogOpen, setIsRechargeDialogOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, []);

  const fetchWallet = async () => {
    try {
      const response = await fetch('/api/company/wallet', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setWallet(data);
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
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

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-matrix mb-2">Company Wallet</h1>
            <p className="text-dim-gray">Manage your platform balance and payments</p>
          </div>
          
          <Dialog open={isRechargeDialogOpen} onOpenChange={setIsRechargeDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-matrix hover:bg-matrix/80 text-dark-bg">
                Request Recharge
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-dark-bg border-matrix/20">
              <DialogHeader>
                <DialogTitle className="text-matrix">Request Recharge</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 bg-matrix/10 border border-matrix/20 rounded">
                  <h3 className="text-matrix font-semibold mb-3">Payment Instructions</h3>
                  <div className="space-y-2 text-sm text-white">
                    <p><strong>Company:</strong> {user?.companyName || user?.username}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <hr className="border-matrix/20 my-3" />
                    <p className="text-dim-gray">To add funds to your wallet, please contact our admin team with the following information:</p>
                    <ul className="list-disc list-inside space-y-1 text-dim-gray">
                      <li>Your company name and email</li>
                      <li>Amount you wish to add</li>
                      <li>Payment method preference</li>
                      <li>Any specific payment reference or note</li>
                    </ul>
                    <div className="mt-4 p-3 bg-dark-bg border border-matrix/20 rounded">
                      <p className="text-matrix font-medium">Contact Information:</p>
                      <p className="text-white">Email: admin@cyberhunt.com</p>
                      <p className="text-white">Phone: +1 (555) 123-4567</p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setIsRechargeDialogOpen(false)}
                  className="w-full bg-matrix hover:bg-matrix/80 text-dark-bg"
                >
                  Got it
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Wallet Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-dark-bg/50 border-matrix/20">
            <CardHeader>
              <CardTitle className="text-matrix">Available Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {wallet ? formatCurrency(wallet.balance) : '$0.00'}
              </div>
              <p className="text-dim-gray text-sm mt-1">Ready to use for bounty payouts</p>
            </CardContent>
          </Card>

          <Card className="bg-dark-bg/50 border-matrix/20">
            <CardHeader>
              <CardTitle className="text-matrix">Total Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {wallet ? formatCurrency(wallet.totalPaid) : '$0.00'}
              </div>
              <p className="text-dim-gray text-sm mt-1">Lifetime payments to platform</p>
            </CardContent>
          </Card>

          <Card className="bg-dark-bg/50 border-matrix/20">
            <CardHeader>
              <CardTitle className="text-matrix">Last Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-white">
                {wallet?.lastUpdated ? formatDate(wallet.lastUpdated) : 'Never'}
              </div>
              <p className="text-dim-gray text-sm mt-1">Most recent wallet activity</p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="bg-dark-bg/50 border-matrix/20">
          <CardHeader>
            <CardTitle className="text-matrix">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-dim-gray">No transactions found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center p-4 bg-dark-bg border border-matrix/20 rounded">
                    <div>
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={transaction.type === 'manual' ? 'default' : 'secondary'}
                          className={transaction.type === 'manual' ? 'bg-matrix text-dark-bg' : 'bg-dim-gray text-white'}
                        >
                          {transaction.type === 'manual' ? 'Payment' : 'Automated'}
                        </Badge>
                        <span className="text-white font-medium">
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                      {transaction.note && (
                        <p className="text-dim-gray text-sm mt-1">{transaction.note}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-dim-gray text-sm">{formatDateTime(transaction.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
