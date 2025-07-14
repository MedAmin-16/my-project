
import { useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Withdrawal {
  id: number;
  amount: number;
  method: string;
  destination: string;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
  username: string;
  email: string;
}

export default function AdminWithdrawalsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ["/api/admin/withdrawals"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ withdrawalId, status, notes }: { withdrawalId: number; status: string; notes: string }) => {
      const response = await fetch(`/api/admin/withdrawals/${withdrawalId}/status`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      setIsDialogOpen(false);
      setSelectedWithdrawal(null);
      setNewStatus("");
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

  const handleUpdateStatus = () => {
    if (!selectedWithdrawal || !newStatus) return;

    updateStatusMutation.mutate({
      withdrawalId: selectedWithdrawal.id,
      status: newStatus,
      notes,
    });
  };

  const openUpdateDialog = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setNewStatus(withdrawal.status);
    setNotes(withdrawal.notes || "");
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'approved': return 'bg-blue-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getMethodDisplay = (method: string) => {
    switch (method) {
      case 'paypal': return 'PayPal';
      case 'wise': return 'Wise';
      case 'crypto': return 'Cryptocurrency';
      default: return method.charAt(0).toUpperCase() + method.slice(1);
    }
  };

  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold text-light-gray mb-2">
            Withdrawal Management
          </h1>
          <p className="text-dim-gray">
            Manage and process withdrawal requests from users
          </p>
        </div>

        {isLoading ? (
          <div className="text-center text-dim-gray">Loading withdrawals...</div>
        ) : (
          <div className="terminal-card p-6 rounded-lg border border-matrix/30">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-matrix/30">
                    <th className="text-left p-3 text-light-gray">User</th>
                    <th className="text-left p-3 text-light-gray">Amount</th>
                    <th className="text-left p-3 text-light-gray">Method</th>
                    <th className="text-left p-3 text-light-gray">Destination</th>
                    <th className="text-left p-3 text-light-gray">Status</th>
                    <th className="text-left p-3 text-light-gray">Date</th>
                    <th className="text-left p-3 text-light-gray">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals?.map((withdrawal: Withdrawal) => (
                    <tr key={withdrawal.id} className="border-b border-matrix/20">
                      <td className="p-3">
                        <div>
                          <div className="text-light-gray font-mono">{withdrawal.username}</div>
                          <div className="text-dim-gray text-sm">{withdrawal.email}</div>
                        </div>
                      </td>
                      <td className="p-3 text-matrix font-mono">${withdrawal.amount}</td>
                      <td className="p-3 text-light-gray">{getMethodDisplay(withdrawal.method)}</td>
                      <td className="p-3 text-dim-gray font-mono text-sm">{withdrawal.destination}</td>
                      <td className="p-3">
                        <Badge className={`${getStatusColor(withdrawal.status)} text-white`}>
                          {withdrawal.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-dim-gray text-sm">
                        {new Date(withdrawal.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <Button
                          size="sm"
                          onClick={() => openUpdateDialog(withdrawal)}
                          className="bg-matrix/20 hover:bg-matrix/30 text-matrix border border-matrix/30"
                        >
                          Update
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {withdrawals?.length === 0 && (
                <div className="text-center text-dim-gray py-8">
                  No withdrawal requests found
                </div>
              )}
            </div>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-surface border border-matrix/30">
            <DialogHeader>
              <DialogTitle className="text-light-gray">Update Withdrawal Status</DialogTitle>
              <DialogDescription className="text-dim-gray">
                Change the status of the withdrawal request. When set to "completed", 
                an automatic email notification will be sent to the user.
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
                      <span className="text-matrix ml-2">${selectedWithdrawal.amount}</span>
                    </div>
                    <div>
                      <span className="text-dim-gray">Method:</span>
                      <span className="text-light-gray ml-2">{getMethodDisplay(selectedWithdrawal.method)}</span>
                    </div>
                    <div>
                      <span className="text-dim-gray">Destination:</span>
                      <span className="text-light-gray ml-2">{selectedWithdrawal.destination}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-light-gray text-sm mb-2 block">Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="bg-surface border-matrix/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-surface border border-matrix/30">
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-light-gray text-sm mb-2 block">Notes (Optional)</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-surface border-matrix/30 text-light-gray"
                    placeholder="Add any notes about this withdrawal..."
                    rows={3}
                  />
                </div>

                {newStatus === 'completed' && (
                  <div className="bg-matrix/10 border border-matrix/30 p-3 rounded">
                    <p className="text-matrix text-sm">
                      ⚡ Setting status to "completed" will automatically send a payment confirmation email to the user.
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
                onClick={handleUpdateStatus}
                disabled={updateStatusMutation.isPending}
                className="bg-matrix hover:bg-matrix/80 text-black"
              >
                {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
