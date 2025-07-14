import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { MatrixBackground } from "@/components/matrix-background";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export default function WalletPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("paypal");
  const [destination, setDestination] = useState("");

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ["/api/wallet"],
  });

  const { data: withdrawals, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ["/api/withdrawals"],
  });

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), method, destination }),
      });

      if (!response.ok) throw new Error();

      toast({
        title: "Success",
        description: "Withdrawal request submitted successfully",
      });

      setAmount("");
      setDestination("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit withdrawal request",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Redirect hackers to crypto withdrawal page
  if (user?.userType === 'hacker') {
    return (
      <div className="min-h-screen bg-deep-black relative">
        <MatrixBackground className="opacity-20" />
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="terminal-card p-8 text-center max-w-md">
            <h2 className="text-2xl font-mono text-matrix mb-4">Crypto Withdrawals Only</h2>
            <p className="text-dim-gray mb-6">
              Researchers can only withdraw earnings via cryptocurrency. Please use the crypto withdrawal page to manage your funds.
            </p>
            <Button 
              onClick={() => window.location.href = '/crypto/withdrawals'}
              className="terminal-button"
            >
              Go to Crypto Withdrawals
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (walletLoading) {
    return (
      <div className="min-h-screen bg-deep-black relative">
        <MatrixBackground className="opacity-20" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-matrix mx-auto mb-4"></div>
            <p className="text-dim-gray">Loading wallet...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Balance Card */}
          <div className="terminal-card p-6 rounded-lg border border-matrix/30">
            <h2 className="text-xl font-mono font-bold text-light-gray mb-4">Wallet Balance</h2>
            <div className="text-3xl font-mono text-matrix">
              ${walletLoading ? "..." : wallet?.balance || 0}
            </div>


          </div>

          {/* Withdrawal Form */}
          <div className="terminal-card p-6 rounded-lg border border-matrix/30">
              <div className="mb-4">
                <h2 className="text-xl font-mono font-bold text-light-gray mb-2">Earnings</h2>
                <p className="text-dim-gray font-mono text-sm">Your earnings are automatically updated when rewards are processed by our team.</p>
              </div>
              <h2 className="text-xl font-mono font-bold text-light-gray mb-4">Request Withdrawal</h2>
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount"
                    min="1"
                    required
                  />
                </div>
              <div>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full bg-surface border border-matrix/30 rounded p-2 text-light-gray"
                >
                  <option value="paypal">PayPal</option>
                  <option value="wise">Wise</option>
                  <option value="crypto">Cryptocurrency</option>
                </select>
              </div>
              <div>
                <Input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder={method === 'crypto' ? 'Wallet Address' : 'Email'}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Request Withdrawal
              </Button>
            </form>
          </div>
        </div>

        {/* Withdrawal History */}
        <div className="mt-8">
          <h2 className="text-xl font-mono font-bold text-light-gray mb-4">Withdrawal History</h2>
          <div className="terminal-card p-4 rounded-lg border border-matrix/30">
            {withdrawalsLoading ? (
              <p className="text-dim-gray">Loading...</p>
            ) : withdrawals?.length ? (
              <div className="space-y-4">
                {withdrawals.map((withdrawal: any) => (
                  <div key={withdrawal.id} className="p-4 bg-surface rounded border border-matrix/30">
                    <div className="flex justify-between items-center">
                      <span className="text-light-gray">${withdrawal.amount}</span>
                      <span className={`text-sm ${
                        withdrawal.status === 'completed' ? 'text-green-500' :
                        withdrawal.status === 'pending' ? 'text-yellow-500' :
                        'text-red-500'
                      }`}>
                        {withdrawal.status}
                      </span>
                    </div>
                    <div className="text-sm text-dim-gray mt-2">
                      via {withdrawal.method} • {new Date(withdrawal.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-dim-gray">No withdrawal history</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}