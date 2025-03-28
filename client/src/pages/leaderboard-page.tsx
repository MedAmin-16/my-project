import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import MatrixBackground from "@/components/matrix-background";

export default function LeaderboardPage() {
  const { data: users, isLoading, error } = useQuery<User[]>({
    queryKey: ["/api/leaderboard"],
  });
  
  // State for trophy animation
  const [animateTrophy, setAnimateTrophy] = useState(false);
  
  useEffect(() => {
    // Trigger animation effect when data loads
    if (users && users.length > 0) {
      setAnimateTrophy(true);
      const timer = setTimeout(() => setAnimateTrophy(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [users]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-matrix" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-red-500">
        <h1 className="text-2xl font-mono">Error loading leaderboard</h1>
        <p className="font-mono">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black">
      <MatrixBackground className="opacity-20" />
      
      <div className="container mx-auto py-10 px-4 relative z-10">
        <div className="flex items-center mb-8 justify-between">
          <div>
            <h1 className="text-4xl font-bold text-matrix mb-2 font-mono tracking-tight">
              <span className={`inline-block ${animateTrophy ? "animate-bounce" : ""}`}>🏆</span> Elite Hunters
            </h1>
            <p className="text-gray-400 font-mono">
              Top security researchers ranked by reputation and contributions
            </p>
          </div>
          
          <Badge variant="outline" className="font-mono text-matrix border-matrix px-3 py-1">
            Updated Live
          </Badge>
        </div>
        
        <div className="backdrop-blur-sm bg-black/40 border border-matrix/30 rounded-lg shadow-glow overflow-hidden">
          <Table>
            <TableCaption className="font-mono text-gray-500">
              Leaderboard rankings are updated in real-time based on vulnerability submissions
            </TableCaption>
            <TableHeader>
              <TableRow className="border-b border-matrix/40 hover:bg-black/50">
                <TableHead className="font-mono text-matrix/90 w-[100px]">Rank</TableHead>
                <TableHead className="font-mono text-matrix/90">Hacker</TableHead>
                <TableHead className="font-mono text-matrix/90">Reputation</TableHead>
                <TableHead className="font-mono text-matrix/90">Title</TableHead>
                <TableHead className="font-mono text-matrix/90 text-right">Achievement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user, index) => (
                <TableRow 
                  key={user.id} 
                  className={`
                    border-b border-matrix/20 hover:bg-black/70 transition-colors
                    ${index === 0 ? "bg-gradient-to-r from-matrix/10 to-transparent" : ""}
                  `}
                >
                  <TableCell className="font-bold font-mono">
                    {index === 0 && <span className="text-xl mr-1">👑</span>}
                    {index === 1 && <span className="text-xl mr-1">🥈</span>}
                    {index === 2 && <span className="text-xl mr-1">🥉</span>}
                    {index > 2 && `#${index + 1}`}
                  </TableCell>
                  <TableCell className="font-mono">{user.username}</TableCell>
                  <TableCell className="font-mono">{(user.reputation ?? 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={index < 3 ? "default" : "outline"} 
                      className={`font-mono ${index < 3 ? "bg-matrix/30" : "text-matrix"}`}
                    >
                      {user.rank}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {(user.reputation ?? 0) >= 5000 && "🔥 Legend"}
                    {(user.reputation ?? 0) >= 2000 && (user.reputation ?? 0) < 5000 && "⚡ Expert"}
                    {(user.reputation ?? 0) >= 500 && (user.reputation ?? 0) < 2000 && "🔍 Hunter"}
                    {(user.reputation ?? 0) >= 100 && (user.reputation ?? 0) < 500 && "🔰 Explorer"}
                    {(user.reputation ?? 0) < 100 && "🔹 Rookie"}
                  </TableCell>
                </TableRow>
              ))}
              
              {(!users || users.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 font-mono text-gray-500">
                    No users found. Be the first to join the leaderboard!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}