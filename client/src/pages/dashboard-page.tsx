import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/navbar";
import ProgramCard from "@/components/ui/program-card";
import ActivityItem from "@/components/ui/activity-item";
import { Program, Activity } from "@shared/schema";
import { 
  AlertTriangle, Bug, Search, User, Terminal, Award, 
  BarChart2, TrendingUp, Shield, Zap, ArrowRight, Clock, 
  Server, Code, Target, CheckCircle, XCircle, Megaphone
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { MatrixBackground } from "@/components/matrix-background";
import PublicChat from "@/components/public-chat";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// Badges data
const badges = [
  { id: 1, name: "First Blood", icon: <Zap className="h-5 w-5 text-matrix" />, acquired: true },
  { id: 2, name: "Bug Hunter", icon: <Bug className="h-5 w-5 text-matrix" />, acquired: true },
  { id: 3, name: "Code Breaker", icon: <Code className="h-5 w-5 text-matrix" />, acquired: false },
  { id: 4, name: "Perfect Score", icon: <Target className="h-5 w-5 text-matrix" />, acquired: false },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate next rank thresholds
  const reputation = user?.reputation || 0;
  let nextRankThreshold = 100;
  let nextRank = "Researcher";

  if (reputation >= 100 && reputation < 500) {
    nextRankThreshold = 500;
    nextRank = "Bug Hunter";
  } else if (reputation >= 500 && reputation < 2000) {
    nextRankThreshold = 2000;
    nextRank = "Veteran";
  } else if (reputation >= 2000 && reputation < 5000) {
    nextRankThreshold = 5000;
    nextRank = "Elite Hunter";
  }

  const progressPercentage = Math.min(100, (reputation / nextRankThreshold) * 100);

  // Fetch active programs
  const {
    data: programs,
    isLoading: programsLoading,
    error: programsError
  } = useQuery<Program[]>({
    queryKey: ["/api/programs"],
  });

  // Fetch user activities
  const {
    data: activities,
    isLoading: activitiesLoading,
    error: activitiesError
  } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  // Filter programs for different categories (would use separate API endpoints in production)
  const popularPrograms = programs?.filter((_, index) => index < 2) || [];
  const newPrograms = programs?.filter((_, index) => index < 3).reverse() || [];

  // Stats cards data (would be from API in production)
  const statsCards = [
    { 
      title: "Valid Submissions", 
      value: Math.floor((user?.reputation || 0) / 50), 
      icon: <CheckCircle className="h-5 w-5 text-matrix" />, 
      change: "+3 this month",
      trend: "up"
    },
    { 
      title: "Pending Review", 
      value: Math.floor((user?.reputation || 0) / 300), 
      icon: <Clock className="h-5 w-5 text-warning-yellow" />, 
      change: "2 new",
      trend: "neutral"
    },
    { 
      title: "Total Earnings", 
      value: `$${(user?.reputation || 0) * 4}`, 
      icon: <Award className="h-5 w-5 text-electric-blue" />, 
      change: "+$450 this month",
      trend: "up"
    },
    { 
      title: "Acceptance Rate", 
      value: "78%", 
      icon: <BarChart2 className="h-5 w-5 text-matrix" />, 
      change: "+5% from last month",
      trend: "up"
    }
  ];

  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Terminal-style welcome message with typing effect */}
        <div className="terminal-card p-6 rounded-lg mb-8 relative overflow-hidden">
          <div className="terminal-header mb-4"></div>
          <div className="z-10 relative">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <Terminal className="h-5 w-5 text-matrix mr-2" />
                  <h1 className="text-2xl font-mono font-bold text-light-gray">
                    <span className="text-dim-gray mr-2">&gt;</span>
                    <span className="text-matrix">sys.welcome</span>("{user?.username || "Hacker"}")
                  </h1>
                </div>
                <p className="text-dim-gray font-mono ml-7 mb-2">
                  <span className="text-warning-yellow">{user?.rank || "Newbie"}</span> |  
                  <span className="text-matrix ml-2">{user?.reputation || 0}</span> reputation points
                </p>

                {/* Progress to next rank */}
                <div className="ml-7 mt-4 mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-dim-gray font-mono">Progress to {nextRank}</span>
                    <span className="text-xs text-matrix font-mono">{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-1.5 bg-surface" indicatorClassName="bg-matrix" />
                </div>
              </div>

              {/* Security Level Animation */}
              <div className="mt-4 md:mt-0 p-3 bg-terminal/50 border border-matrix/30 rounded animate-pulse-glow">
                <div className="text-center">
                  <p className="text-xs text-dim-gray font-mono mb-1">SECURITY LEVEL</p>
                  <div className="flex justify-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-3 w-3 rounded-sm ${i < Math.ceil((user?.reputation || 0) / 1000) ? 'bg-matrix' : 'bg-dim-gray/20'}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-matrix font-mono">AUTHORIZED</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-matrix/5 via-transparent to-transparent"></div>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="mb-8" onValueChange={setActiveTab}>
          <TabsList className="bg-terminal border-b border-matrix/30 w-full justify-start rounded-b-none h-12 p-0">
            <TabsTrigger 
              value="overview" 
              className="font-mono data-[state=active]:text-matrix data-[state=active]:border-matrix data-[state=active]:border-b-2 rounded-none h-full px-4"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="programs" 
              className="font-mono data-[state=active]:text-matrix data-[state=active]:border-matrix data-[state=active]:border-b-2 rounded-none h-full px-4"
            >
              Programs
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className="font-mono data-[state=active]:text-matrix data-[state=active]:border-matrix data-[state=active]:border-b-2 rounded-none h-full px-4"
            >
              Activity
            </TabsTrigger>
            <TabsTrigger 
              value="achievements" 
              className="font-mono data-[state=active]:text-matrix data-[state=active]:border-matrix data-[state=active]:border-b-2 rounded-none h-full px-4"
            >
              Achievements
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="font-mono data-[state=active]:text-matrix data-[state=active]:border-matrix data-[state=active]:border-b-2 rounded-none h-full px-4"
            >
              Community Chat
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab Content */}
          <TabsContent value="overview" className="pt-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statsCards.map((stat, index) => (
                <div key={index} className="terminal-card p-4 rounded-lg border border-matrix/30 relative overflow-hidden">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs text-dim-gray font-mono mb-1">{stat.title}</p>
                      <p className="text-2xl text-light-gray font-mono mb-1">{stat.value}</p>
                      <p className={`text-xs font-mono ${stat.trend === 'up' ? 'text-matrix' : stat.trend === 'down' ? 'text-alert-red' : 'text-dim-gray'} flex items-center`}>
                        {stat.trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                        {stat.trend === 'down' && <TrendingUp className="h-3 w-3 mr-1 transform rotate-180" />}
                        {stat.change}
                      </p>
                    </div>
                    <div className="bg-surface/80 p-2 rounded-md border border-matrix/20 h-fit">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-matrix/30 to-transparent"></div>
                </div>
              ))}
            </div>

            {/* Two Column Layout for Programs and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Programs Column */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-mono font-bold text-light-gray">Active Programs</h2>
                  <Link href="/programs" className="text-matrix hover:text-matrix-dark text-sm font-mono flex items-center">
                    View All <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>

                {programsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-matrix" />
                  </div>
                ) : programsError ? (
                  <div className="terminal-card p-6 rounded-lg text-center">
                    <AlertTriangle className="h-8 w-8 text-alert-red mx-auto mb-2" />
                    <p className="text-alert-red font-mono">Error loading programs</p>
                  </div>
                ) : programs && programs.length > 0 ? (
                  programs.map((program) => (
                    <ProgramCard key={program.id} program={program} />
                  ))
                ) : (
                  <div className="terminal-card p-6 rounded-lg text-center">
                    <p className="text-dim-gray font-mono">No active programs found</p>
                  </div>
                )}
              </div>

              {/* Activity & Actions Column */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="terminal-card p-4 rounded-lg border border-matrix/30">
                  <h2 className="text-lg font-mono font-bold text-light-gray mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 gap-2">
                    <Link href="/submit">
                      <a className="flex items-center p-3 rounded bg-matrix/10 hover:bg-matrix/20 transition-all duration-200 border border-matrix/40 group">
                        <Bug className="text-matrix mr-3 h-5 w-5 group-hover:animate-pulse" />
                        <span className="text-light-gray font-mono text-sm">Submit New Bug</span>
                      </a>
                    </Link>
                    <Link href="/programs">
                      <a className="flex items-center p-3 rounded bg-surface hover:bg-matrix/10 transition-all duration-200 border border-matrix/20">
                        <Search className="text-matrix mr-3 h-5 w-5" />
                        <span className="text-light-gray font-mono text-sm">Find Programs</span>
                      </a>
                    </Link>
                    <Link href="/profile">
                      <a className="flex items-center p-3 rounded bg-surface hover:bg-matrix/10 transition-all duration-200 border border-matrix/20">
                        <User className="text-matrix mr-3 h-5 w-5" />
                        <span className="text-light-gray font-mono text-sm">Edit Profile</span>
                      </a>
                    </Link>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="terminal-card p-4 rounded-lg border border-matrix/30">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-mono font-bold text-light-gray">Recent Activity</h2>
                    <Link href="/activities" className="text-matrix hover:text-matrix-dark text-xs font-mono flex items-center">
                      View All <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </div>

                  {activitiesLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-matrix" />
                    </div>
                  ) : activitiesError ? (
                    <div className="text-center py-4">
                      <AlertTriangle className="h-6 w-6 text-alert-red mx-auto mb-2" />
                      <p className="text-alert-red font-mono text-sm">Error loading activities</p>
                    </div>
                  ) : activities && activities.length > 0 ? (
                    <div className="space-y-4">
                      {activities.slice(0, 3).map((activity) => (
                        <ActivityItem key={activity.id} activity={activity} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-dim-gray font-mono text-sm">No recent activities</p>
                    </div>
                  )}
                </div>

                {/* Your Badges */}
                <div className="terminal-card p-4 rounded-lg border border-matrix/30">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-mono font-bold text-light-gray">Your Badges</h2>
                    <Link href="/badges" className="text-matrix hover:text-matrix-dark text-xs font-mono">
                      View All
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {badges.map((badge) => (
                      <div 
                        key={badge.id} 
                        className={`p-3 rounded-md border flex items-center justify-center flex-col ${
                          badge.acquired 
                            ? 'border-matrix/40 bg-matrix/5' 
                            : 'border-dim-gray/20 bg-surface/50 opacity-50'
                        }`}
                      >
                        <div className={`mb-1 ${badge.acquired ? 'text-matrix' : 'text-dim-gray'}`}>
                          {badge.icon}
                        </div>
                        <p className={`text-xs font-mono ${badge.acquired ? 'text-light-gray' : 'text-dim-gray'}`}>
                          {badge.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Programs Tab Content */}
          <TabsContent value="programs" className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-8">
                {/* Popular Programs */}
                <div>
                  <h2 className="text-xl font-mono font-bold text-light-gray mb-4">Popular Programs</h2>
                  {programsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-matrix" />
                    </div>
                  ) : programsError ? (
                    <div className="terminal-card p-6 rounded-lg text-center">
                      <AlertTriangle className="h-8 w-8 text-alert-red mx-auto mb-2" />
                      <p className="text-alert-red font-mono">Error loading programs</p>
                    </div>
                  ) : popularPrograms.length > 0 ? (
                    <div className="space-y-4">
                      {popularPrograms.map(program => (
                        <ProgramCard key={program.id} program={program} />
                      ))}
                    </div>
                  ) : (
                    <div className="terminal-card p-6 rounded-lg text-center">
                      <p className="text-dim-gray font-mono">No popular programs found</p>
                    </div>
                  )}
                </div>

                {/* Newly Added Programs */}
                <div>
                  <h2 className="text-xl font-mono font-bold text-light-gray mb-4">Newly Added</h2>
                  {programsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-matrix" />
                    </div>
                  ) : programsError ? (
                    <div className="terminal-card p-6 rounded-lg text-center">
                      <AlertTriangle className="h-8 w-8 text-alert-red mx-auto mb-2" />
                      <p className="text-alert-red font-mono">Error loading programs</p>
                    </div>
                  ) : newPrograms.length > 0 ? (
                    <div className="space-y-4">
                      {newPrograms.map(program => (
                        <ProgramCard key={program.id} program={program} />
                      ))}
                    </div>
                  ) : (
                    <div className="terminal-card p-6 rounded-lg text-center">
                      <p className="text-dim-gray font-mono">No new programs found</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                {/* Program Categories */}
                <div className="terminal-card p-4 rounded-lg border border-matrix/30 mb-6">
                  <h2 className="text-lg font-mono font-bold text-light-gray mb-4">Categories</h2>
                  <div className="space-y-2">
                    <Link href="/programs?category=web">
                      <a className="flex items-center justify-between p-3 rounded bg-surface hover:bg-matrix/10 transition-all duration-200 border border-matrix/20">
                        <div className="flex items-center">
                          <Server className="text-matrix mr-3 h-5 w-5" />
                          <span className="text-light-gray font-mono text-sm">Web Applications</span>
                        </div>
                        <span className="text-matrix text-xs font-mono">24</span>
                      </a>
                    </Link>
                    <Link href="/programs?category=mobile">
                      <a className="flex items-center justify-between p-3 rounded bg-surface hover:bg-matrix/10 transition-all duration-200 border border-matrix/20">
                        <div className="flex items-center">
                          <Terminal className="text-matrix mr-3 h-5 w-5" />
                          <span className="text-light-gray font-mono text-sm">Mobile Apps</span>
                        </div>
                        <span className="text-matrix text-xs font-mono">16</span>
                      </a>
                    </Link>
                    <Link href="/programs?category=api">
                      <a className="flex items-center justify-between p-3 rounded bg-surface hover:bg-matrix/10 transition-all duration-200 border border-matrix/20">
                        <div className="flex items-center">
                          <Code className="text-matrix mr-3 h-5 w-5" />
                          <span className="text-light-gray font-mono text-sm">API Security</span>
                        </div>
                        <span className="text-matrix text-xs font-mono">12</span>
                      </a>
                    </Link>
                    <Link href="/programs?category=network">
                      <a className="flex items-center justify-between p-3 rounded bg-surface hover:bg-matrix/10 transition-all duration-200 border border-matrix/20">
                        <div className="flex items-center">
                          <Shield className="text-matrix mr-3 h-5 w-5" />
                          <span className="text-light-gray font-mono text-sm">Network Security</span>
                        </div>
                        <span className="text-matrix text-xs font-mono">8</span>
                      </a>
                    </Link>
                  </div>
                </div>

                {/* Filters */}
                <div className="terminal-card p-4 rounded-lg border border-matrix/30">
                  <h2 className="text-lg font-mono font-bold text-light-gray mb-4">Reward Ranges</h2>
                  <div className="space-y-2">
                    <Link href="/programs?reward=high">
                      <a className="flex items-center justify-between p-3 rounded bg-surface hover:bg-matrix/10 transition-all duration-200 border border-matrix/20">
                        <span className="text-light-gray font-mono text-sm">$10,000+</span>
                        <span className="text-warning-yellow text-xs font-mono">8 programs</span>
                      </a>
                    </Link>
                    <Link href="/programs?reward=medium">
                      <a className="flex items-center justify-between p-3 rounded bg-surface hover:bg-matrix/10 transition-all duration-200 border border-matrix/20">
                        <span className="text-light-gray font-mono text-sm">$1,000 - $10,000</span>
                        <span className="text-warning-yellow text-xs font-mono">15 programs</span>
                      </a>
                    </Link>
                    <Link href="/programs?reward=low">
                      <a className="flex items-center justify-between p-3 rounded bg-surface hover:bg-matrix/10 transition-all duration-200 border border-matrix/20">
                        <span className="text-light-gray font-mono text-sm">Up to $1,000</span>
                        <span className="text-warning-yellow text-xs font-mono">42 programs</span>
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Activity Tab Content */}
          <TabsContent value="activity" className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <h2 className="text-xl font-mono font-bold text-light-gray mb-4">All Activity</h2>

                {activitiesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-matrix" />
                  </div>
                ) : activitiesError ? (
                  <div className="terminal-card p-6 rounded-lg text-center">
                    <AlertTriangle className="h-8 w-8 text-alert-red mx-auto mb-2" />
                    <p className="text-alert-red font-mono">Error loading activities</p>
                  </div>
                ) : activities && activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))}
                    {/* Add some more mock activities for UI fullness */}
                    <ActivityItem 
                      activity={{
                        id: 9999,
                        type: "submission_pending",
                        message: "Your submission is pending review",
                        details: "XSS Vulnerability in user profile",
                        userId: user?.id || 1,
                        relatedId: 1,
                        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
                      }} 
                    />
                    <ActivityItem 
                      activity={{
                        id: 9998,
                        type: "submission_accepted",
                        message: "Your submission was accepted",
                        details: "CSRF vulnerability in payment form - $500",
                        userId: user?.id || 1,
                        relatedId: 1,
                        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
                      }} 
                    />
                  </div>
                ) : (
                  <div className="terminal-card p-6 rounded-lg text-center">
                    <p className="text-dim-gray font-mono">No activities found</p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Activity Filters */}
                <div className="terminal-card p-4 rounded-lg border border-matrix/30">
                  <h2 className="text-lg font-mono font-bold text-light-gray mb-4">Filter Activity</h2>
                  <div className="space-y-2">
                    <button className="w-full flex items-center p-3 rounded bg-matrix/10 hover:bg-matrix/20 transition-all duration-200 border border-matrix/30">
                      <CheckCircle className="text-matrix mr-3 h-5 w-5" />
                      <span className="text-light-gray font-mono text-sm">Accepted Submissions</span>
                    </button>
                    <button className="w-full flex items-center p-3 rounded bg-surface hover:bg-matrix/10 transition-all duration-200 border border-matrix/20">
                      <XCircle className="text-alert-red mr-3 h-5 w-5" />
                      <span className="text-light-gray font-mono text-sm">Rejected Submissions</span>
                    </button>
                    <button className="w-full flex items-center p-3 rounded bg-surface hover:bg-matrix/10 transition-all duration-200 border border-matrix/20">
                      <Clock className="text-warning-yellow mr-3 h-5 w-5" />
                      <span className="text-light-gray font-mono text-sm">Pending Review</span>
                    </button>
                    <button className="w-full flex items-center p-3 rounded bg-surface hover:bg-matrix/10 transition-all duration-200 border border-matrix/20">
                      <Award className="text-electric-blue mr-3 h-5 w-5" />
                      <span className="text-light-gray font-mono text-sm">Achievements</span>
                    </button>
                  </div>
                </div>

                {/* Activity Stats */}
                <div className="terminal-card p-4 rounded-lg border border-matrix/30">
                  <h2 className="text-lg font-mono font-bold text-light-gray mb-4">Activity Stats</h2>
                  <div className="space-y-4">
                    {/* Submissions by Status */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-dim-gray font-mono">Accepted</span>
                        <span className="text-xs text-matrix font-mono">65%</span>
                      </div>
                      <Progress value={65} className="h-1.5 bg-surface" indicatorClassName="bg-matrix" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-dim-gray font-mono">Rejected</span>
                        <span className="text-xs text-alert-red font-mono">20%</span>
                      </div>
                      <Progress value={20} className="h-1.5 bg-surface" indicatorClassName="bg-alert-red" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-dim-gray font-mono">Pending</span>
                        <span className="text-xs text-warning-yellow font-mono">15%</span>
                      </div>
                      <Progress value={15} className="h-1.5 bg-surface" indicatorClassName="bg-warning-yellow" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Achievements Tab Content */}
          <TabsContent value="achievements" className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h2 className="text-xl font-mono font-bold text-light-gray mb-6">Your Achievements</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {/* Unlocked Achievements */}
                  <div className="terminal-card p-5 rounded-lg border border-matrix/30 hover:shadow-glow-sm transition-all duration-300">
                    <div className="flex items-center mb-3">
                      <div className="h-10 w-10 rounded-full bg-matrix/10 p-2 mr-3 border border-matrix/50 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-matrix" />
                      </div>
                      <div>
                        <h3 className="text-light-gray font-mono text-md">First Blood</h3>
                        <p className="text-dim-gray font-mono text-xs">First accepted submission</p>
                      </div>
                    </div>
                    <div className="ml-13 pl-13">
                      <p className="text-sm text-dim-gray font-mono mt-2">
                        <span className="text-matrix">+50</span> reputation points
                      </p>
                      <p className="text-xs text-dim-gray font-mono mt-1">Unlocked 3 days ago</p>
                    </div>
                  </div>

                  <div className="terminal-card p-5 rounded-lg border border-matrix/30 hover:shadow-glow-sm transition-all duration-300">
                    <div className="flex items-center mb-3">
                      <div className="h-10 w-10 rounded-full bg-matrix/10 p-2 mr-3 border border-matrix/50 flex items-center justify-center">
                        <Bug className="h-5 w-5 text-matrix" />
                      </div>
                      <div>
                        <h3 className="text-light-gray font-mono text-md">Bug Hunter</h3>
                        <p className="text-dim-gray font-mono text-xs">Find 5 confirmed vulnerabilities</p>
                      </div>
                    </div>
                    <div className="ml-13 pl-13">
                      <p className="text-sm text-dim-gray font-mono mt-2">
                        <span className="text-matrix">+100</span> reputation points
                      </p>
                      <p className="text-xs text-dim-gray font-mono mt-1">Unlocked 1 week ago</p>
                    </div>
                  </div>

                  {/* Locked Achievements with Progress */}
                  <div className="terminal-card p-5 rounded-lg border border-dim-gray/30 opacity-70 hover:opacity-90 transition-all duration-300">
                    <div className="flex items-center mb-3">
                      <div className="h-10 w-10 rounded-full bg-surface p-2 mr-3 border border-dim-gray/30 flex items-center justify-center">
                        <Code className="h-5 w-5 text-dim-gray" />
                      </div>
                      <div>
                        <h3 className="text-light-gray font-mono text-md">Code Breaker</h3>
                        <p className="text-dim-gray font-mono text-xs">Find a critical RCE vulnerability</p>
                      </div>
                    </div>
                    <div className="ml-13 pl-13">
                      <p className="text-sm text-dim-gray font-mono mt-2">
                        Reward: <span className="text-matrix">+200</span> reputation
                      </p>
                      <div className="mt-2">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-dim-gray font-mono">Progress</span>
                          <span className="text-xs text-dim-gray font-mono">0/1</span>
                        </div>
                        <Progress value={0} className="h-1.5 bg-dim-gray/20" indicatorClassName="bg-matrix" />
                      </div>
                    </div>
                  </div>

                  <div className="terminal-card p-5 rounded-lg border border-dim-gray/30 opacity-70 hover:opacity-90 transition-all duration-300">
                    <div className="flex items-center mb-3">
                      <div className="h-10 w-10 rounded-full bg-surface p-2 mr-3 border border-dim-gray/30 flex items-center justify-center">
                        <Target className="h-5 w-5 text-dim-gray" />
                      </div>
                      <div>
                        <h3 className="text-light-gray font-mono text-md">Perfect Score</h3>
                        <p className="text-dim-gray font-mono text-xs">3 accepted submissions in a row</p>
                      </div>
                    </div>
                    <div className="ml-13 pl-13">
                      <p className="text-sm text-dim-gray font-mono mt-2">
                        Reward: <span className="text-matrix">+150</span> reputation
                      </p>
                      <div className="mt-2">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-dim-gray font-mono">Progress</span>
                          <span className="text-xs text-dim-gray font-mono">1/3</span>
                        </div>
                        <Progress value={33} className="h-1.5 bg-dim-gray/20" indicatorClassName="bg-matrix" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rank Progress */}
                <div className="terminal-card p-5 rounded-lg border border-matrix/30 mb-6">
                  <h2 className="text-lg font-mono font-bold text-light-gray mb-4">Rank Progress</h2>

                  <div className="space-y-6">
                    <div className="relative pt-8">
                      {/* Rank progression line */}
                      <div className="absolute top-0 left-1/2 w-0.5 h-full bg-dim-gray/30 -translate-x-1/2"></div>

                      {/* Checkpoints */}
                      <div className="relative mb-8">
                        <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-matrix bg-deep-black z-10"></div>
                        <div className="pl-8 ml-8">
                          <p className="text-light-gray font-mono text-sm">Newbie</p>
                          <p className="text-matrix font-mono text-xs">0 reputation</p>
                          <p className="text-dim-gray font-mono text-xs">Complete</p>
                        </div>
                      </div>

                      <div className="relative mb-8">
                        <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-matrix bg-deep-black z-10"></div>
                        <div className="pl-8 ml-8">
                          <p className="text-light-gray font-mono text-sm">Researcher</p>
                          <p className="text-matrix font-mono text-xs">100 reputation</p>
                          <p className="text-dim-gray font-mono text-xs">Complete</p>
                        </div>
                      </div>

                      <div className="relative mb-8">
                        <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-matrix bg-deep-black z-10"></div>
                        <div className="pl-8 ml-8">
                          <p className="text-light-gray font-mono text-sm">Bug Hunter</p>
                          <p className="text-matrix font-mono text-xs">500 reputation</p>
                          <p className="text-warning-yellow font-mono text-xs">In progress ({Math.round(progressPercentage)}%)</p>
                        </div>
                      </div>

                      <div className="relative mb-8">
                        <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-dim-gray/50 bg-deep-black z-10"></div>
                        <div className="pl-8 ml-8">
                          <p className="text-dim-gray font-mono text-sm">Veteran</p>
                          <p className="text-dim-gray font-mono text-xs">2,000 reputation</p>
                          <p className="text-dim-gray font-mono text-xs">Locked</p>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-dim-gray/50 bg-deep-black z-10"></div>
                        <div className="pl-8 ml-8">
                          <p className="text-dim-gray font-mono text-sm">Elite Hunter</p>
                          <p className="text-dim-gray font-mono text-xs">5,000 reputation</p>
                          <p className="text-dim-gray font-mono text-xs">Locked</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Leaderboard Preview */}
                <div className="terminal-card p-4 rounded-lg border border-matrix/30">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-mono font-bold text-light-gray">Top Hunters</h2>
                    <Link href="/leaderboard" className="text-matrix hover:text-matrix-dark text-xs font-mono">
                      View Full Leaderboard
                    </Link>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 rounded bg-matrix/5 border border-matrix/20">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-terminal p-1 mr-3 border border-matrix/30 flex items-center justify-center">
                          <span className="text-electric-blue font-mono text-xs">01</span>
                        </div>
                        <span className="text-light-gray text-sm font-mono">hackerman</span>
                      </div>
                      <span className="text-matrix text-xs font-mono">54,320 pts</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded bg-surface border border-matrix/20">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-terminal p-1 mr-3 border border-matrix/30 flex items-center justify-center">
                          <span className="text-electric-blue font-mono text-xs">02</span>
                        </div>
                        <span className="text-light-gray text-sm font-mono">zerocool</span>
                      </div>
                      <span className="text-matrix text-xs font-mono">48,750 pts</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded bg-surface border border-matrix/20">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-terminal p-1 mr-3 border border-matrix/30 flex items-center justify-center">
                          <span className="text-electric-blue font-mono text-xs">03</span>
                        </div>
                        <span className="text-light-gray text-sm font-mono">cyph3r</span>
                      </div>
                      <span className="text-matrix text-xs font-mono">42,130 pts</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded bg-surface border border-matrix/20">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-terminal p-1 mr-3 border border-matrix/30 flex items-center justify-center">
                          <span className="text-electric-blue font-mono text-xs">04</span>
                        </div>
                        <span className="text-light-gray text-sm font-mono">l33thax0r</span>
                      </div>
                      <span className="text-matrix text-xs font-mono">36,840 pts</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded bg-surface border border-matrix/20">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-terminal p-1 mr-3 border border-matrix/30 flex items-center justify-center">
                          <span className="text-electric-blue font-mono text-xs">05</span>
                        </div>
                        <span className="text-light-gray text-sm font-mono">neocortex</span>
                      </div>
                      <span className="text-matrix text-xs font-mono">33,210 pts</span>
                    </div>
                  </div>
                </div>

                {/* Your position */}
                <div className="terminal-card p-4 rounded-lg border border-matrix/30">
                  <h2 className="text-lg font-mono font-bold text-light-gray mb-4">Your Position</h2>
                  <div className="p-3 rounded bg-matrix/10 border border-matrix/30">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-terminal p-1 mr-3 border border-matrix/30 flex items-center justify-center">
                          <span className="text-electric-blue font-mono text-xs">186</span>
                        </div>
                        <span className="text-light-gray text-sm font-mono">{user?.username || "you"}</span>
                      </div>
                      <span className="text-matrix text-xs font-mono">{user?.reputation || 0} pts</span>
                    </div>
                    <div className="text-center mt-3">
                      <p className="text-xs text-dim-gray font-mono">
                        <span className="text-matrix">+85</span> positions in the last month
                      </p>
                    </div>
                  </div>
                </div>

                {/* Achievement Statistics */}
                <div className="terminal-card p-4 rounded-lg border border-matrix/30">
                  <h2 className="text-lg font-mono font-bold text-light-gray mb-4">Statistics</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-dim-gray font-mono text-sm">Total Achievements</span>
                      <span className="text-light-gray font-mono text-sm">2/12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dim-gray font-mono text-sm">Rare Badges</span>
                      <span className="text-light-gray font-mono text-sm">0/4</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dim-gray font-mono text-sm">Reputation from Achievements</span>
                      <span className="text-matrix font-mono text-sm">150 pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dim-gray font-mono text-sm">Next Achievement</span>
                      <span className="text-warning-yellow font-mono text-sm">33% complete</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Chat Tab Content */}
          <TabsContent value="chat" className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <PublicChat />
              </div>

              <div className="space-y-6">
                {/* Chat Guidelines */}
                <div className="terminal-card p-4 rounded-lg border border-matrix/30">
                  <h2 className="text-lg font-mono font-bold text-light-gray mb-4">Chat Guidelines</h2>
                  <div className="space-y-3 text-sm text-dim-gray font-mono">
                    <div className="flex items-start">
                      <div className="h-2 w-2 bg-matrix rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <p>Be respectful to all community members</p>
                    </div>
                    <div className="flex items-start">
                      <div className="h-2 w-2 bg-matrix rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <p>No spam or promotional content</p>
                    </div>
                    <div className="flex items-start">
                      <div className="h-2 w-2 bg-matrix rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <p>Share vulnerability findings responsibly</p>
                    </div>
                    <div className="flex items-start">
                      <div className="h-2 w-2 bg-matrix rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <p>Companies can post program announcements</p>
                    </div>
                    <div className="flex items-start">
                      <div className="h-2 w-2 bg-matrix rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <p>Ask questions and help fellow hackers</p>
                    </div>
                  </div>
                </div>

                {/* Active Users */}
                <div className="terminal-card p-4 rounded-lg border border-matrix/30">
                  <h2 className="text-lg font-mono font-bold text-light-gray mb-4">Online Now</h2>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded bg-surface">
                      <div className="flex items-center">
                        <div className="h-2 w-2 bg-matrix rounded-full mr-2"></div>
                        <span className="text-light-gray text-sm font-mono">hackerman</span>
                      </div>
                      <Badge className="bg-matrix/20 text-matrix border-matrix/30 text-xs">
                        Elite Hunter
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-surface">
                      <div className="flex items-center">
                        <div className="h-2 w-2 bg-matrix rounded-full mr-2"></div>
                        <span className="text-light-gray text-sm font-mono">TechCorp</span>
                      </div>
                      <Badge className="bg-electric-blue/20 text-electric-blue border-electric-blue/30 text-xs">
                        Company
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-surface">
                      <div className="flex items-center">
                        <div className="h-2 w-2 bg-matrix rounded-full mr-2"></div>
                        <span className="text-light-gray text-sm font-mono">zerocool</span>
                      </div>
                      <Badge className="bg-matrix/20 text-matrix border-matrix/30 text-xs">
                        Bug Hunter
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Recent Announcements */}
                <div className="terminal-card p-4 rounded-lg border border-matrix/30">
                  <h2 className="text-lg font-mono font-bold text-light-gray mb-4">Recent Announcements</h2>
                  <div className="space-y-3">
                    <div className="p-3 rounded bg-warning-yellow/5 border border-warning-yellow/30">
                      <div className="flex items-center mb-1">
                        <Megaphone className="h-3 w-3 text-warning-yellow mr-2" />
                        <span className="text-light-gray text-xs font-mono">TechCorp</span>
                      </div>
                      <p className="text-sm text-dim-gray font-mono">
                        New bug bounty program launched! Check out our web application scope.
                      </p>
                      <p className="text-xs text-dim-gray font-mono mt-1">2 hours ago</p>
                    </div>
                    
                    <div className="p-3 rounded bg-warning-yellow/5 border border-warning-yellow/30">
                      <div className="flex items-center mb-1">
                        <Megaphone className="h-3 w-3 text-warning-yellow mr-2" />
                        <span className="text-light-gray text-xs font-mono">SecureBank</span>
                      </div>
                      <p className="text-sm text-dim-gray font-mono">
                        Increased rewards for critical vulnerabilities - up to $10,000!
                      </p>
                      <p className="text-xs text-dim-gray font-mono mt-1">1 day ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Terminal-style system message */}
        <div className="terminal-card p-3 rounded-lg mb-2 mt-8 relative overflow-hidden border-matrix/10">
          <p className="text-dim-gray font-mono text-xs">
            <span className="text-matrix mr-2">sys.message:</span>
            "Remember to check for new programs daily. Rewards are claimed on a first-come, first-served basis."
          </p>
        </div>
      </main>
    </div>
  );
}