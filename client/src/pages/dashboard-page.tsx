import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import ProgramCard from "@/components/ui/program-card";
import ActivityItem from "@/components/ui/activity-item";
import { Program, Activity } from "@shared/schema";
import { AlertTriangle, Bug, Search, User } from "lucide-react";
import { Loader2 } from "lucide-react";
import MatrixBackground from "@/components/matrix-background";

export default function DashboardPage() {
  const { user } = useAuth();

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

  if (!user) return null; // Should be handled by ProtectedRoute

  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground />

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Welcome Banner */}
        <div className="terminal-card p-6 rounded-lg mb-8 relative overflow-hidden">
          <div className="z-10 relative">
            <h1 className="text-2xl font-mono font-bold text-light-gray mb-2">
              Welcome back, <span className="text-matrix">{user.username}</span>
            </h1>
            <p className="text-dim-gray font-mono mb-4">
              Current rank: <span className="text-warning-yellow">{user.rank}</span> | 
              Reputation: <span className="text-matrix">{user.reputation}</span>
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="bg-surface/50 p-3 rounded-md border border-matrix/20">
                <p className="text-xs text-dim-gray font-mono mb-1">Valid Submissions</p>
                <p className="text-2xl text-light-gray font-mono">
                  {/* Replace with actual data from API when available */}
                  {Math.floor(user.reputation / 50) || 0}
                </p>
              </div>
              <div className="bg-surface/50 p-3 rounded-md border border-matrix/20">
                <p className="text-xs text-dim-gray font-mono mb-1">Pending Review</p>
                <p className="text-2xl text-light-gray font-mono">
                  {/* Replace with actual data from API when available */}
                  {Math.floor(user.reputation / 300) || 0}
                </p>
              </div>
              <div className="bg-surface/50 p-3 rounded-md border border-matrix/20">
                <p className="text-xs text-dim-gray font-mono mb-1">Total Earnings</p>
                <p className="text-2xl text-light-gray font-mono">
                  {/* Replace with actual data from API when available */}
                  ${user.reputation * 4 || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-matrix/5 to-transparent"></div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Programs Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-mono font-bold text-light-gray">Active Programs</h2>
              <Link href="/programs" className="text-matrix hover:text-matrix-dark text-sm font-mono">
                View All
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

          {/* Activity & Stats Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="terminal-card p-4 rounded-lg border border-matrix/30">
              <h2 className="text-lg font-mono font-bold text-light-gray mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link href="/submit">
                  <a className="flex items-center p-3 rounded bg-matrix/5 hover:bg-matrix/10 transition-all duration-200 border border-matrix/20">
                    <Bug className="text-matrix mr-3 h-5 w-5" />
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
              <h2 className="text-lg font-mono font-bold text-light-gray mb-4">Recent Activity</h2>
              
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
              
              <Link href="/activities">
                <a className="block text-center text-matrix hover:text-matrix-dark text-xs font-mono mt-4">
                  View All Activity
                </a>
              </Link>
            </div>
            
            {/* Top Hunters */}
            <div className="terminal-card p-4 rounded-lg border border-matrix/30">
              <h2 className="text-lg font-mono font-bold text-light-gray mb-4">Top Hunters</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-terminal p-1 mr-3 border border-matrix/30 flex items-center justify-center">
                      <span className="text-electric-blue font-mono text-xs">01</span>
                    </div>
                    <span className="text-light-gray text-sm font-mono">hackerman</span>
                  </div>
                  <span className="text-matrix text-xs font-mono">54,320 pts</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-terminal p-1 mr-3 border border-matrix/30 flex items-center justify-center">
                      <span className="text-electric-blue font-mono text-xs">02</span>
                    </div>
                    <span className="text-light-gray text-sm font-mono">zerocool</span>
                  </div>
                  <span className="text-matrix text-xs font-mono">48,750 pts</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-terminal p-1 mr-3 border border-matrix/30 flex items-center justify-center">
                      <span className="text-electric-blue font-mono text-xs">03</span>
                    </div>
                    <span className="text-light-gray text-sm font-mono">cyph3r</span>
                  </div>
                  <span className="text-matrix text-xs font-mono">42,130 pts</span>
                </div>
              </div>
              <Link href="/leaderboard">
                <a className="block text-center text-matrix hover:text-matrix-dark text-xs font-mono mt-4">
                  View Leaderboard
                </a>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
