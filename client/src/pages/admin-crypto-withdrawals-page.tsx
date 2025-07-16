
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { MatrixBackground } from "@/components/matrix-background";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, Eye, Copy } from "lucide-react";

interface CryptoWithdrawal {
  id: number;
  amount: number;
  currency: string;
  walletAddress: string;
  network: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  username: string;
  email: string;
  userId: number;
}

export default function AdminCryptoWithdrawalsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<CryptoWithdrawal | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState("pending");

  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ["/api/admin/crypto/withdrawals", filter],
    queryFn: async () => {
      const response = await fetch(`/api/admin/crypto/withdrawals?status=${filter}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch withdrawals");
      return response.json();
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ withdrawalId, status, notes }: { withdrawalId: number; status: string; notes: string }) => {
      const response = await fetch(`/api/admin/crypto/withdrawals/${withdrawalId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status, notes }),
      });

      if (!response.ok) {
        throw new Error("Failed to update withdrawal status");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Withdrawal status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/crypto/withdrawals"] });
      setIsDialogOpen(false);
      setSelectedWithdrawal(null);
      setActionType(null);
      setNotes("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update withdrawal status",
        variant: "destructive",
      });
    },
  });

  const handleAction = (withdrawal: CryptoWithdrawal, action: 'approve' | 'reject') => {
    setSelectedWithdrawal(withdrawal);
    setActionType(action);
    setNotes("");
    setIsDialogOpen(true);
  };

  const handleConfirmAction = () => {
    if (!selectedWithdrawal || !actionType) return;

    const status = actionType === 'approve' ? 'approved' : 'rejected';
    updateStatusMutation.mutate({
      withdrawalId: selectedWithdrawal.id,
      status,
      notes,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'approved': return 'bg-blue-500';
      case 'rejected': return 'bg-red-500';
      case 'processing': return 'bg-purple-500';
      default: return 'bg-yellow-500';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${(amount / 100).toFixed(2)} ${currency}`;
  };

  const maskWalletAddress = (address: string) => {
    if (address.length <= 10) return address;
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold text-light-gray mb-2">
            Crypto Withdrawal Management
          </h1>
          <p className="text-dim-gray">
            Review and approve cryptocurrency withdrawal requests from researchers
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex space-x-2">
          {['pending', 'approved', 'rejected', 'all'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              onClick={() => setFilter(status)}
              className={filter === status ? "bg-matrix text-black" : "border-matrix/30 text-light-gray"}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center text-dim-gray">Loading withdrawals...</div>
        ) : (
          <div className="terminal-card p-6 rounded-lg border border-matrix/30">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-matrix/30">
                    <TableHead className="text-light-gray">User</TableHead>
                    <TableHead className="text-light-gray">Amount</TableHead>
                    <TableHead className="text-light-gray">Network</TableHead>
                    <TableHead className="text-light-gray">Wallet Address</TableHead>
                    <TableHead className="text-light-gray">Status</TableHead>
                    <TableHead className="text-light-gray">Date</TableHead>
                    <TableHead className="text-light-gray">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals?.map((withdrawal: CryptoWithdrawal) => (
                    <TableRow key={withdrawal.id} className="border-b border-matrix/20">
                      <TableCell>
                        <div>
                          <div className="text-light-gray font-mono">{withdrawal.username}</div>
                          <div className="text-dim-gray text-sm">{withdrawal.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-matrix font-mono">
                        {formatAmount(withdrawal.amount, withdrawal.currency)}
                      </TableCell>
                      <TableCell className="text-light-gray">
                        <Badge variant="outline" className="border-matrix/30 text-matrix">
                          {withdrawal.network.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-dim-gray font-mono text-sm">
                            {maskWalletAddress(withdrawal.walletAddress)}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(withdrawal.walletAddress)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(withdrawal.status)} text-white`}>
                          {withdrawal.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-dim-gray text-sm">
                        {new Date(withdrawal.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {withdrawal.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleAction(withdrawal, 'approve')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleAction(withdrawal, 'reject')}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {withdrawal.status !== 'pending' && (
                            <Badge variant="outline" className="border-matrix/30 text-dim-gray">
                              {withdrawal.status === 'approved' ? 'Ready for Payout' : 'Processed'}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {withdrawals?.length === 0 && (
                <div className="text-center text-dim-gray py-8">
                  No withdrawal requests found for "{filter}" status
                </div>
              )}
            </div>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-surface border border-matrix/30">
            <DialogHeader>
              <DialogTitle className="text-light-gray">
                {actionType === 'approve' ? 'Approve' : 'Reject'} Withdrawal Request
              </DialogTitle>
              <DialogDescription className="text-dim-gray">
                {actionType === 'approve' 
                  ? 'This will mark the withdrawal as approved and ready for manual payout via Binance.'
                  : 'This will reject the withdrawal request and notify the user.'
                }
              </DialogDescription>
            </DialogHeader>

            {selectedWithdrawal && (
              <div className="space-y-4">
                <div className="bg-deep-black p-4 rounded border border-matrix/20">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-dim-gray">User:</span>
                      <span className="text-light-gray ml-2">{selectedWithdrawal.username}</span>
                    </div>
                    <div>
                      <span className="text-dim-gray">Amount:</span>
                      <span className="text-matrix ml-2">
                        {formatAmount(selectedWithdrawal.amount, selectedWithdrawal.currency)}
                      </span>
                    </div>
                    <div>
                      <span className="text-dim-gray">Network:</span>
                      <span className="text-light-gray ml-2">{selectedWithdrawal.network.toUpperCase()}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-dim-gray">Wallet:</span>
                      <span className="text-light-gray ml-2 font-mono text-xs break-all">
                        {selectedWithdrawal.walletAddress}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-light-gray text-sm mb-2 block">
                    Notes {actionType === 'reject' ? '(Required)' : '(Optional)'}
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-surface border-matrix/30 text-light-gray"
                    placeholder={
                      actionType === 'approve' 
                        ? "Add any notes about the approval process..."
                        : "Please provide a reason for rejection..."
                    }
                    rows={3}
                  />
                </div>

                {actionType === 'approve' && (
                  <div className="bg-matrix/10 border border-matrix/30 p-3 rounded">
                    <p className="text-matrix text-sm">
                      ⚡ After approval, you'll need to manually process the payout through Binance.
                      The withdrawal will be marked as "ready for payout" until manually completed.
                    </p>
                  </div>
                )}

                {actionType === 'reject' && (
                  <div className="bg-red-500/10 border border-red-500/30 p-3 rounded">
                    <p className="text-red-400 text-sm">
                      ⚠️ This action will notify the user that their withdrawal request has been rejected.
                    </p>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-matrix/30 text-light-gray"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAction}
                disabled={updateStatusMutation.isPending || (actionType === 'reject' && !notes.trim())}
                className={
                  actionType === 'approve' 
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }
              >
                {updateStatusMutation.isPending ? "Processing..." : 
                 actionType === 'approve' ? "Approve Withdrawal" : "Reject Withdrawal"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
