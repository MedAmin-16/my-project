
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function WalletAnalytics() {
  const { data: walletStats } = useQuery({
    queryKey: ["wallet-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/admin/wallet-analytics");
      return res.json();
    }
  });

  return (
    <Card className="bg-terminal border-matrix/30">
      <CardHeader>
        <CardTitle className="text-light-gray">Wallet Analytics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-dark-terminal rounded-lg">
            <p className="text-dim-gray text-sm">Total Paid</p>
            <p className="text-2xl text-matrix">${walletStats?.totalPaid || 0}</p>
          </div>
          <div className="p-4 bg-dark-terminal rounded-lg">
            <p className="text-dim-gray text-sm">Average Reward</p>
            <p className="text-2xl text-matrix">${walletStats?.avgReward || 0}</p>
          </div>
          <div className="p-4 bg-dark-terminal rounded-lg">
            <p className="text-dim-gray text-sm">Pending Payouts</p>
            <p className="text-2xl text-matrix">${walletStats?.pendingPayouts || 0}</p>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={walletStats?.trends}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#50fa7b" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
