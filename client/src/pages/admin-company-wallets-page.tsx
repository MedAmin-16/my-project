
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface CompanyWallet {
  id: number;
  companyId: number;
  balance: number;
  totalPaid: number;
  lastUpdated: string;
  companyName: string;
  email: string;
}

interface Company {
  id: number;
  companyName: string;
  email: string;
  username: string;
}

export default function AdminCompanyWalletsPage() {
  const [companyWallets, setCompanyWallets] = useState<CompanyWallet[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanyWallets();
    fetchCompanies();
  }, []);

  const fetchCompanyWallets = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/company-wallets', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCompanyWallets(data);
      }
    } catch (error) {
      console.error('Error fetching company wallets:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/companies', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleAddPayment = async () => {
    if (!selectedCompany || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please select a company and enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/add-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          companyId: selectedCompany.id,
          amount: Math.round(parseFloat(amount) * 100), // Convert to cents
          note
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Payment added successfully"
        });
        setIsDialogOpen(false);
        setAmount("");
        setNote("");
        setSelectedCompany(null);
        fetchCompanyWallets();
      } else {
        throw new Error('Failed to add payment');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add payment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-matrix mb-2">Company Wallets</h1>
            <p className="text-dim-gray">Manage company payments and balances</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-matrix hover:bg-matrix/80 text-dark-bg">
                + Add Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-dark-bg border-matrix/20">
              <DialogHeader>
                <DialogTitle className="text-matrix">Add Payment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="company" className="text-white">Company</Label>
                  <select
                    id="company"
                    className="w-full bg-dark-bg border border-matrix/20 rounded px-3 py-2 text-white"
                    value={selectedCompany?.id || ''}
                    onChange={(e) => {
                      const company = companies.find(c => c.id === parseInt(e.target.value));
                      setSelectedCompany(company || null);
                    }}
                  >
                    <option value="">Select a company</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.companyName || company.username} ({company.email})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="amount" className="text-white">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-dark-bg border-matrix/20 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="note" className="text-white">Note (optional)</Label>
                  <Textarea
                    id="note"
                    placeholder="Payment note..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="bg-dark-bg border-matrix/20 text-white"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleAddPayment} 
                    disabled={loading}
                    className="bg-matrix hover:bg-matrix/80 text-dark-bg"
                  >
                    {loading ? "Adding..." : "Add Payment"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="border-matrix/20 text-white hover:bg-matrix/10"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {companyWallets.length === 0 ? (
            <Card className="bg-dark-bg/50 border-matrix/20">
              <CardContent className="p-8 text-center">
                <p className="text-dim-gray">No company wallets found</p>
              </CardContent>
            </Card>
          ) : (
            companyWallets.map((wallet) => (
              <Card key={wallet.id} className="bg-dark-bg/50 border-matrix/20">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-matrix">
                        {wallet.companyName || 'Unknown Company'}
                      </CardTitle>
                      <p className="text-dim-gray text-sm">{wallet.email}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-matrix">
                        {formatCurrency(wallet.balance)}
                      </div>
                      <Badge variant="outline" className="border-matrix/20 text-dim-gray">
                        Available Balance
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-dim-gray text-sm">Total Paid</p>
                      <p className="text-white font-semibold">{formatCurrency(wallet.totalPaid)}</p>
                    </div>
                    <div>
                      <p className="text-dim-gray text-sm">Last Updated</p>
                      <p className="text-white font-semibold">
                        {wallet.lastUpdated ? formatDate(wallet.lastUpdated) : 'Never'}
                      </p>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={() => {
                          const company = companies.find(c => c.id === wallet.companyId);
                          setSelectedCompany(company || null);
                          setIsDialogOpen(true);
                        }}
                        size="sm"
                        className="bg-matrix/20 hover:bg-matrix/30 text-matrix border border-matrix/20"
                      >
                        + Add Payment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
