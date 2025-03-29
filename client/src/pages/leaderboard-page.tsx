import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User } from '@shared/schema';
import { Loader2, Search, AlertTriangle, Trophy, Award, ChevronUp, Users, Star, Shield, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/layout/navbar';
import MatrixBackground from '@/components/matrix-background';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export default function LeaderboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'week'>('all');
  const { user: currentUser } = useAuth();

  // Fetch leaderboard data
  const {
    data: users,
    isLoading,
    error
  } = useQuery<User[]>({
    queryKey: ['/api/leaderboard', timeRange],
    queryFn: () => fetch(`/api/leaderboard?timeRange=${timeRange}`).then(res => {
      if (!res.ok) throw new Error('Failed to load leaderboard');
      return res.json();
    })
  });

  // Filter users based on search term
  const filteredUsers = users?.filter(user => 
    !searchTerm || 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ranking badges
  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="flex items-center justify-center h-8 w-8 bg-yellow-500 text-black rounded-full">
            <Trophy className="h-5 w-5" />
          </div>
        );
      case 1:
        return (
          <div className="flex items-center justify-center h-8 w-8 bg-gray-400 text-black rounded-full">
            <Trophy className="h-5 w-5" />
          </div>
        );
      case 2:
        return (
          <div className="flex items-center justify-center h-8 w-8 bg-amber-700 text-black rounded-full">
            <Trophy className="h-5 w-5" />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-8 w-8 bg-dark-terminal text-matrix rounded-full font-mono">
            {index + 1}
          </div>
        );
    }
  };

  // Get rank color class
  const getRankColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'elite': return 'text-yellow-400';
      case 'expert': return 'text-green-500';
      case 'advanced': return 'text-blue-400';
      case 'intermediate': return 'text-purple-400';
      case 'novice': return 'text-pink-400';
      default: return 'text-matrix';
    }
  };

  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground className="opacity-20" />
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold text-matrix mb-2">Hacker Leaderboard</h1>
          <p className="text-dim-gray">
            Top security researchers ranked by reputation and achievements. Climb the ranks by finding and reporting vulnerabilities.
          </p>
        </div>

        <div className="terminal-card p-5 rounded-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-auto flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-dim-gray" />
              <Input
                type="text"
                placeholder="Search hackers..."
                className="terminal-input pl-9 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-2 w-full md:w-auto">
              <Button
                variant={timeRange === 'all' ? 'matrix' : 'secondary'}
                className="flex-1 md:flex-none"
                onClick={() => setTimeRange('all')}
              >
                All Time
              </Button>
              <Button
                variant={timeRange === 'month' ? 'matrix' : 'secondary'}
                className="flex-1 md:flex-none"
                onClick={() => setTimeRange('month')}
              >
                This Month
              </Button>
              <Button
                variant={timeRange === 'week' ? 'matrix' : 'secondary'}
                className="flex-1 md:flex-none"
                onClick={() => setTimeRange('week')}
              >
                This Week
              </Button>
            </div>
          </div>
        </div>

        {/* Leaderboard Overview */}
        {!isLoading && !error && users && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="terminal-card p-4 rounded-lg flex items-center">
              <div className="h-10 w-10 bg-dark-terminal rounded-full flex items-center justify-center mr-4">
                <Trophy className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-dim-gray text-sm">Top Hacker</p>
                <p className="text-matrix font-mono text-lg">{users[0]?.username || 'N/A'}</p>
              </div>
            </div>
            
            <div className="terminal-card p-4 rounded-lg flex items-center">
              <div className="h-10 w-10 bg-dark-terminal rounded-full flex items-center justify-center mr-4">
                <Users className="h-5 w-5 text-electric-blue" />
              </div>
              <div>
                <p className="text-dim-gray text-sm">Active Hackers</p>
                <p className="text-matrix font-mono text-lg">{users.length}</p>
              </div>
            </div>
            
            <div className="terminal-card p-4 rounded-lg flex items-center">
              <div className="h-10 w-10 bg-dark-terminal rounded-full flex items-center justify-center mr-4">
                <Star className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-dim-gray text-sm">Your Rank</p>
                <p className="text-matrix font-mono text-lg">
                  {currentUser 
                    ? `#${users.findIndex(u => u.id === currentUser.id) + 1 || 'N/A'}` 
                    : 'Log in to see'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-matrix" />
          </div>
        ) : error ? (
          <div className="terminal-card p-8 rounded-lg text-center">
            <AlertTriangle className="h-12 w-12 text-alert-red mx-auto mb-4" />
            <p className="text-alert-red font-mono text-lg">Failed to load leaderboard</p>
            <p className="text-dim-gray font-mono mt-2">Please try again later</p>
          </div>
        ) : filteredUsers && filteredUsers.length > 0 ? (
          <div className="terminal-card rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-dark-terminal">
                  <tr>
                    <th className="px-4 py-3 text-dim-gray text-xs uppercase tracking-wider w-16 text-center">Rank</th>
                    <th className="px-4 py-3 text-dim-gray text-xs uppercase tracking-wider">Hacker</th>
                    <th className="px-4 py-3 text-dim-gray text-xs uppercase tracking-wider text-center">Reputation</th>
                    <th className="px-4 py-3 text-dim-gray text-xs uppercase tracking-wider text-center">Rank</th>
                    <th className="px-4 py-3 text-dim-gray text-xs uppercase tracking-wider text-center hidden md:table-cell">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-terminal">
                  {filteredUsers.map((leaderboardUser, index) => {
                    const isCurrentUser = currentUser && leaderboardUser.id === currentUser.id;
                    
                    return (
                      <tr 
                        key={leaderboardUser.id} 
                        className={`hover:bg-dark-terminal transition-colors ${isCurrentUser ? 'bg-matrix/5' : ''}`}
                      >
                        <td className="px-4 py-3 text-center">
                          {getRankBadge(index)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="h-8 w-8 flex-shrink-0 mr-3 bg-dark-terminal rounded-full flex items-center justify-center overflow-hidden">
                              {isCurrentUser ? (
                                <Shield className="h-4 w-4 text-matrix" />
                              ) : (
                                <span className="text-matrix font-mono">
                                  {leaderboardUser.username.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className={`font-mono ${isCurrentUser ? 'text-matrix' : 'text-light-gray'}`}>
                                {leaderboardUser.username}
                                {isCurrentUser && <span className="ml-2 text-xs text-matrix">(You)</span>}
                              </p>
                              <p className="text-dim-gray text-xs">
                                Member since {new Date(leaderboardUser.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center">
                            <ChevronUp className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-light-gray font-mono">
                              {leaderboardUser.reputation || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-mono ${getRankColor(leaderboardUser.rank || 'Newbie')}`}>
                            {leaderboardUser.rank || 'Newbie'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center hidden md:table-cell">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-dark-terminal">
                            {leaderboardUser.isEmailVerified ? (
                              <span className="text-green-500 flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1" /> Verified
                              </span>
                            ) : (
                              <span className="text-yellow-500">Unverified</span>
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="terminal-card p-8 rounded-lg text-center">
            <p className="text-dim-gray font-mono">No users match your search criteria</p>
          </div>
        )}
      </main>
    </div>
  );
}