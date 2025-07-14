
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function AuditTrail() {
  const { data: auditLogs } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const res = await fetch("/api/admin/audit-logs");
      return res.json();
    }
  });

  return (
    <Card className="bg-terminal border-matrix/30">
      <CardHeader>
        <CardTitle className="text-light-gray">Audit Trail</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={auditLogs}>
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#50fa7b" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
