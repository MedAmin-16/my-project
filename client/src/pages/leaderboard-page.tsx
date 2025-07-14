import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { MatrixBackground } from "@/components/matrix-background";
import {
  Search,
  Award,
  User,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Code,
  Shield,
  Target,
  Trophy,
  Zap,
  Calendar,
  Filter,
  Clock,
  Check
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User as UserType } from "@shared/schema";

// Achievement definitions
const achievements = [
  {
    id: "first_blood",
    name: "First Blood",
    description: "Submit your first valid vulnerability",
    icon: <Zap className="h-5 w-5 text-yellow-400" />,
    color: "text-yellow-400",
  },
  {
    id: "bug_hunter",
    name: "Bug Hunter",
    description: "Find 10 confirmed vulnerabilities",
    icon: <Target className="h-5 w-5 text-green-500" />,
    color: "text-green-500",
  },
  {
    id: "elite_hacker",
    name: "Elite Hacker",
    description: "Find a critical vulnerability that earns you a top bounty",
    icon: <Trophy className="h-5 w-5 text-orange-500" />,
    color: "text-orange-500",
  },
  {
    id: "code_ninja",
    name: "Code Ninja",
    description: "Find 5 different types of vulnerabilities across multiple programs",
    icon: <Code className="h-5 w-5 text-electric-blue" />,
    color: "text-electric-blue",
  },
  {
    id: "security_sentinel",
    name: "Security Sentinel",
    description: "Maintain activity for 3 consecutive months",
    icon: <Shield className="h-5 w-5 text-purple-400" />,
    color: "text-purple-400",
  }
];

// Mock leaderboard data
const mockLeaderboard = Array(50).fill(0).map((_, index) => ({
  id: index + 1,
  username: `hacker${index + 1}`,
  fullName: `${["Alice", "Bob", "Charlie", "Dave", "Eve", "Frank", "Grace", "Heidi", "Ivan", "Judy"][index % 10]} ${["Smith", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez"][index % 10]}`,
  reputation: 10000 - (index * 150) + Math.floor(Math.random() * 100),
  level: Math.max(1, Math.floor((10000 - (index * 150)) / 1000)),
  rank: index + 1,
  submissionCount: Math.floor(Math.random() * 50) + 10,
  acceptedCount: Math.floor(Math.random() * 40) + 5,
  achievements: Array(5).fill(0).map(() => achievements[Math.floor(Math.random() * achievements.length)].id)
    .filter((value, i, self) => self.indexOf(value) === i) // Remove duplicates
    .slice(0, Math.floor(Math.random() * 4) + 1), // Random number of achievements (1-4)
  topProgram: ["SecureTech Web", "PaySecure Gateway", "CloudStack Infrastructure", "HealthTrack Mobile", "NetSecure IoT"][Math.floor(Math.random() * 5)],
  lastActive: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date in last 30 days
}));

// Calculate tier based on reputation
const calculateTier = (reputation: number) => {
  if (reputation >= 8000) return { name: "Elite", color: "text-yellow-400" };
  if (reputation >= 5000) return { name: "Diamond", color: "text-electric-blue" };
  if (reputation >= 3000) return { name: "Platinum", color: "text-purple-400" };
  if (reputation >= 1500) return { name: "Gold", color: "text-orange-400" };
  if (reputation >= 800) return { name: "Silver", color: "text-gray-400" };
  return { name: "Bronze", color: "text-amber-600" };
};

// Time period options
const timePeriods = [
  { id: "all_time", name: "All Time" },
  { id: "this_month", name: "This Month" },
  { id: "this_year", name: "This Year" },
  { id: "last_30_days", name: "Last 30 Days" },
  { id: "last_90_days", name: "Last 90 Days" }
];

export default function LeaderboardPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("global");
  const [timePeriod, setTimePeriod] = useState("all_time");
  const [sortBy, setSortBy] = useState("reputation");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Fetch leaderboard data
  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ["/api/users/leaderboard", timePeriod],
    queryFn: async () => {
      // In a real implementation, this would fetch from the API with the time period
      // For now, return the mock data after a small delay to simulate network
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockLeaderboard;
    }
  });
  
  // Filter users based on search query
  const filteredUsers = leaderboard.filter(user => 
    searchQuery === "" || 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Sort users based on selected sort option and order
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === "reputation") {
      comparison = a.reputation - b.reputation;
    } else if (sortBy === "submissions") {
      comparison = a.submissionCount - b.submissionCount;
    } else if (sortBy === "acceptance_rate") {
      const rateA = a.submissionCount > 0 ? a.acceptedCount / a.submissionCount : 0;
      const rateB = b.submissionCount > 0 ? b.acceptedCount / b.submissionCount : 0;
      comparison = rateA - rateB;
    } else if (sortBy === "level") {
      comparison = a.level - b.level;
    } else if (sortBy === "achievements") {
      comparison = a.achievements.length - b.achievements.length;
    } else if (sortBy === "last_active") {
      comparison = new Date(a.lastActive).getTime() - new Date(b.lastActive).getTime();
    }
    
    return sortOrder === "desc" ? -comparison : comparison;
  });
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };
  
  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground className="opacity-20" />
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-mono font-bold text-matrix mb-4">Hacker Leaderboard</h1>
          <p className="text-dim-gray max-w-3xl">
            Discover the top security researchers on CyberHunt ranked by reputation, submissions, and other metrics.
            Compete for glory, recognition, and exclusive opportunities.
          </p>
        </div>
        
        {/* Top Hackers Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {sortedUsers.slice(0, 3).map((user, index) => {
            const tier = calculateTier(user.reputation);
            return (
              <Card key={user.id} className={`bg-terminal border-matrix/30 ${index === 0 ? 'border-yellow-400/50' : index === 1 ? 'border-electric-blue/50' : 'border-green-500/50'}`}>
                <CardContent className="p-0">
                  <div className="p-6 text-center relative">
                    <div className={`absolute top-4 left-4 rounded-full h-8 w-8 flex items-center justify-center ${
                      index === 0 ? 'bg-yellow-400/20 text-yellow-400' : 
                      index === 1 ? 'bg-electric-blue/20 text-electric-blue' : 
                      'bg-green-500/20 text-green-500'
                    }`}>
                      <Trophy className="h-4 w-4" />
                    </div>
                    
                    <div className="mb-4 flex justify-center">
                      <Avatar className="h-20 w-20 border-2 border-matrix">
                        <AvatarFallback className="bg-matrix/20 text-matrix text-xl">
                          {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="mb-2">
                      <h3 className="text-xl font-mono text-light-gray hover:text-matrix">
                        <Link href={`/profile/${user.id}`}>
                          <a>{user.username}</a>
                        </Link>
                      </h3>
                      <p className="text-sm text-dim-gray">{user.fullName}</p>
                    </div>
                    
                    <div className="mb-4">
                      <Badge variant={index === 0 ? "outline" : "secondary"} className="bg-matrix/10 border-matrix/30 text-matrix">
                        <Award className="mr-1 h-3.5 w-3.5" />
                        Rank #{user.rank}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-mono text-matrix">{user.reputation.toLocaleString()}</p>
                        <p className="text-xs text-dim-gray">Reputation</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-mono text-matrix">{user.level}</p>
                        <p className="text-xs text-dim-gray">Level</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-mono text-matrix">{user.acceptedCount}</p>
                        <p className="text-xs text-dim-gray">Accepted</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 justify-center mb-4">
                      {user.achievements.slice(0, 3).map((id) => {
                        const achievement = achievements.find(a => a.id === id);
                        return achievement ? (
                          <div 
                            key={id} 
                            className="h-8 w-8 rounded-full bg-terminal border border-matrix/30 flex items-center justify-center"
                            title={achievement.name}
                          >
                            {achievement.icon}
                          </div>
                        ) : null;
                      })}
                      {user.achievements.length > 3 && (
                        <div className="h-8 w-8 rounded-full bg-terminal border border-matrix/30 flex items-center justify-center text-dim-gray text-xs">
                          +{user.achievements.length - 3}
                        </div>
                      )}
                    </div>
                    
                    <div className={`text-sm ${tier.color}`}>
                      {tier.name} Tier Hacker
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Search and Filters */}
        <div className="terminal-card p-6 rounded-lg mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder="Search hackers by username or name..."
                className="bg-dark-terminal border-matrix/30 pl-10 h-12 font-mono"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-dim-gray pointer-events-none" />
            </div>
            
            <div className="flex gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-matrix/30 text-light-gray whitespace-nowrap">
                    <Calendar className="mr-2 h-4 w-4" />
                    {timePeriods.find(p => p.id === timePeriod)?.name || "All Time"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-terminal border-matrix/30">
                  {timePeriods.map((period) => (
                    <DropdownMenuItem 
                      key={period.id}
                      className={`text-light-gray hover:text-matrix ${timePeriod === period.id ? 'bg-matrix/10 text-matrix' : ''}`}
                      onClick={() => setTimePeriod(period.id)}
                    >
                      {timePeriod === period.id && <Check className="mr-2 h-4 w-4" />}
                      {period.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-matrix/30 text-light-gray">
                    <Filter className="mr-2 h-4 w-4" />
                    Sort By
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-terminal border-matrix/30">
                  <DropdownMenuItem 
                    className={`text-light-gray hover:text-matrix ${sortBy === 'reputation' ? 'bg-matrix/10 text-matrix' : ''}`}
                    onClick={() => setSortBy('reputation')}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        {sortBy === 'reputation' && <Check className="mr-2 h-4 w-4" />}
                        Reputation
                      </div>
                      {sortBy === 'reputation' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={(e) => { e.stopPropagation(); toggleSortOrder(); }}
                        >
                          {sortOrder === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={`text-light-gray hover:text-matrix ${sortBy === 'submissions' ? 'bg-matrix/10 text-matrix' : ''}`}
                    onClick={() => setSortBy('submissions')}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        {sortBy === 'submissions' && <Check className="mr-2 h-4 w-4" />}
                        Submissions Count
                      </div>
                      {sortBy === 'submissions' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={(e) => { e.stopPropagation(); toggleSortOrder(); }}
                        >
                          {sortOrder === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={`text-light-gray hover:text-matrix ${sortBy === 'level' ? 'bg-matrix/10 text-matrix' : ''}`}
                    onClick={() => setSortBy('level')}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        {sortBy === 'level' && <Check className="mr-2 h-4 w-4" />}
                        Level
                      </div>
                      {sortBy === 'level' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={(e) => { e.stopPropagation(); toggleSortOrder(); }}
                        >
                          {sortOrder === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={`text-light-gray hover:text-matrix ${sortBy === 'acceptance_rate' ? 'bg-matrix/10 text-matrix' : ''}`}
                    onClick={() => setSortBy('acceptance_rate')}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        {sortBy === 'acceptance_rate' && <Check className="mr-2 h-4 w-4" />}
                        Acceptance Rate
                      </div>
                      {sortBy === 'acceptance_rate' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={(e) => { e.stopPropagation(); toggleSortOrder(); }}
                        >
                          {sortOrder === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={`text-light-gray hover:text-matrix ${sortBy === 'achievements' ? 'bg-matrix/10 text-matrix' : ''}`}
                    onClick={() => setSortBy('achievements')}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        {sortBy === 'achievements' && <Check className="mr-2 h-4 w-4" />}
                        Achievements
                      </div>
                      {sortBy === 'achievements' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={(e) => { e.stopPropagation(); toggleSortOrder(); }}
                        >
                          {sortOrder === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={`text-light-gray hover:text-matrix ${sortBy === 'last_active' ? 'bg-matrix/10 text-matrix' : ''}`}
                    onClick={() => setSortBy('last_active')}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        {sortBy === 'last_active' && <Check className="mr-2 h-4 w-4" />}
                        Last Active
                      </div>
                      {sortBy === 'last_active' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={(e) => { e.stopPropagation(); toggleSortOrder(); }}
                        >
                          {sortOrder === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent h-auto p-0 border-b border-matrix/20 w-full justify-start space-x-6 mb-0">
              <TabsTrigger 
                value="global" 
                className="px-0 py-3 bg-transparent text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-matrix data-[state=active]:text-matrix text-dim-gray h-auto"
              >
                Global Ranking
              </TabsTrigger>
              <TabsTrigger 
                value="country" 
                className="px-0 py-3 bg-transparent text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-matrix data-[state=active]:text-matrix text-dim-gray h-auto"
              >
                By Country
              </TabsTrigger>
              <TabsTrigger 
                value="program" 
                className="px-0 py-3 bg-transparent text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-matrix data-[state=active]:text-matrix text-dim-gray h-auto"
              >
                By Program
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Leaderboard Table */}
        <div className="terminal-card rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-terminal/70 border-b border-matrix/20">
                  <th className="px-4 py-3 text-left text-xs font-mono text-dim-gray">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-dim-gray">Hacker</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-dim-gray">Reputation</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-dim-gray">Level</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-dim-gray">Submissions</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-dim-gray">Achievements</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-dim-gray">Top Program</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-dim-gray">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array(10).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-matrix/10 last:border-0 animate-pulse">
                      <td colSpan={8} className="px-4 py-6">
                        <div className="h-6 bg-terminal/50 rounded"></div>
                      </td>
                    </tr>
                  ))
                ) : sortedUsers.length > 0 ? (
                  sortedUsers.map((user, index) => {
                    const tier = calculateTier(user.reputation);
                    return (
                      <tr key={user.id} className="border-b border-matrix/10 last:border-0 hover:bg-matrix/5">
                        <td className="px-4 py-4 text-light-gray">
                          <div className="flex items-center">
                            <span className="font-mono">{user.rank}</span>
                            {user.rank <= 3 && (
                              <Trophy className={`ml-1.5 h-4 w-4 ${
                                user.rank === 1 ? 'text-yellow-400' : 
                                user.rank === 2 ? 'text-electric-blue' : 
                                'text-green-500'
                              }`} />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-3">
                              <AvatarFallback className="bg-matrix/20 text-matrix text-xs">
                                {user.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <Link href={`/profile/${user.id}`}>
                                <a className="text-light-gray hover:text-matrix font-mono block">{user.username}</a>
                              </Link>
                              <span className="text-dim-gray text-xs">{user.fullName}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className="text-light-gray font-mono">{user.reputation.toLocaleString()}</span>
                            <span className={`text-xs ${tier.color}`}>{tier.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div className="h-6 w-6 rounded-full bg-matrix/20 flex items-center justify-center mr-2">
                              <span className="text-xs text-matrix font-mono">{user.level}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className="text-light-gray">{user.submissionCount}</span>
                            <span className="text-dim-gray text-xs">{user.acceptedCount} accepted</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex">
                            {user.achievements.slice(0, 3).map((id) => {
                              const achievement = achievements.find(a => a.id === id);
                              return achievement ? (
                                <div key={id} className="h-6 w-6 rounded-full flex items-center justify-center mr-1" title={achievement.name}>
                                  {achievement.icon}
                                </div>
                              ) : null;
                            })}
                            {user.achievements.length > 3 && (
                              <div className="h-6 flex items-center text-dim-gray text-xs">
                                +{user.achievements.length - 3} more
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-dim-gray text-sm">
                          {user.topProgram}
                        </td>
                        <td className="px-4 py-4 text-dim-gray text-sm">
                          <div className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1.5" />
                            <span>{new Date(user.lastActive).toLocaleDateString()}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-dim-gray">
                      <User className="h-8 w-8 mx-auto mb-3 text-matrix/50" />
                      <p>No hackers found matching your search criteria.</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="mt-4 border-matrix/30 text-matrix"
                        onClick={() => setSearchQuery("")}
                      >
                        Clear Search
                      </Button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Achievements Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-mono font-bold text-matrix mb-6">Available Achievements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="terminal-card p-5 rounded-lg border border-matrix/30 hover:bg-matrix/5 transition duration-200">
                <div className="flex items-center mb-3">
                  <div className="h-12 w-12 rounded-md bg-terminal border border-matrix/30 flex items-center justify-center mr-4">
                    {achievement.icon}
                  </div>
                  <div>
                    <h3 className={`text-lg font-mono ${achievement.color}`}>{achievement.name}</h3>
                  </div>
                </div>
                <p className="text-dim-gray text-sm mb-3">{achievement.description}</p>
                <div className="flex items-center text-xs text-dim-gray">
                  <Trophy className="h-3.5 w-3.5 mr-1 text-matrix/50" />
                  <span>{Math.floor(Math.random() * 1000) + 100} hackers have earned this</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="terminal-card p-8 rounded-lg mt-12 text-center">
          <h2 className="text-2xl font-mono font-bold text-matrix mb-3">Want to Join the Leaderboard?</h2>
          <p className="text-dim-gray mb-6 max-w-2xl mx-auto">
            Create an account, find vulnerabilities, and earn reputation points to climb the ranks.
            The higher your reputation, the more exclusive programs you'll unlock.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/auth?mode=register">
              <a className="px-6 py-3 bg-matrix text-black rounded-md font-mono hover:bg-matrix/80 transition duration-200">
                Sign Up Now
              </a>
            </Link>
            <Link href="/programs">
              <a className="px-6 py-3 border border-matrix text-matrix rounded-md font-mono hover:bg-matrix/10 transition duration-200">
                Browse Programs
              </a>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}