import { useAuth } from "../hooks/use-auth";
import { Link } from "wouter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MatrixBackground from "../components/matrix-background";

export default function DashboardPage() {
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for demonstration
  const { data: activities } = useQuery({
    queryKey: ["/api/user/activities"],
    queryFn: () => Promise.resolve([
      { id: 1, type: "submission", message: "You submitted a vulnerability for Program A", date: "2023-11-05" },
      { id: 2, type: "reward", message: "You received a $500 reward for XSS vulnerability", date: "2023-11-03" },
      { id: 3, type: "status", message: "Your submission #1337 was accepted", date: "2023-11-01" }
    ]),
    enabled: !!user,
  });

  // Mock stats data
  const { data: stats } = useQuery({
    queryKey: ["/api/user/stats"],
    queryFn: () => Promise.resolve({
      totalSubmissions: 12,
      acceptedSubmissions: 7,
      totalRewards: 2850,
      reputation: user?.reputation || 0
    }),
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-black text-green-500 relative">
      <MatrixBackground />
      
      {/* Navbar */}
      <nav className="bg-black/90 border-b border-green-800 p-4 sticky top-0 z-20">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/">
            <a className="text-2xl font-bold cyber-text">CyberHunt</a>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link href="/programs">
              <a className="hover:text-green-400 transition-colors duration-200 font-mono">Programs</a>
            </Link>
            <Link href="/submit">
              <a className="hover:text-green-400 transition-colors duration-200 font-mono">Submit Bug</a>
            </Link>
            
            <div className="relative group">
              <button className="flex items-center space-x-1 hover:text-green-400 transition-colors duration-200 font-mono">
                <span>{user?.username}</span>
                <span>▼</span>
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-black border border-green-700 rounded shadow-lg py-1 hidden group-hover:block">
                <button
                  onClick={() => logoutMutation.mutate()}
                  className="block w-full text-left px-4 py-2 hover:bg-green-900/30 transition-colors duration-200 font-mono"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="container mx-auto p-6 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 cyber-text">Dashboard</h1>
          <p className="font-mono">Welcome back, {user?.username}. Here's your activity overview.</p>
        </div>
        
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="cyber-container p-4">
              <h3 className="text-sm text-green-700 font-mono mb-1">Reputation</h3>
              <p className="text-2xl font-bold">{stats.reputation}</p>
            </div>
            
            <div className="cyber-container p-4">
              <h3 className="text-sm text-green-700 font-mono mb-1">Total Submissions</h3>
              <p className="text-2xl font-bold">{stats.totalSubmissions}</p>
            </div>
            
            <div className="cyber-container p-4">
              <h3 className="text-sm text-green-700 font-mono mb-1">Accepted Reports</h3>
              <p className="text-2xl font-bold">{stats.acceptedSubmissions}</p>
            </div>
            
            <div className="cyber-container p-4">
              <h3 className="text-sm text-green-700 font-mono mb-1">Total Rewards</h3>
              <p className="text-2xl font-bold">${stats.totalRewards}</p>
            </div>
          </div>
        )}
        
        {/* Tabs Navigation */}
        <div className="border-b border-green-800 mb-6">
          <nav className="flex space-x-4 -mb-px">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-2 px-4 font-mono ${
                activeTab === "overview"
                  ? "border-b-2 border-green-500 text-green-400"
                  : "text-green-700 hover:text-green-500"
              }`}
            >
              Overview
            </button>
            
            <button
              onClick={() => setActiveTab("submissions")}
              className={`py-2 px-4 font-mono ${
                activeTab === "submissions"
                  ? "border-b-2 border-green-500 text-green-400"
                  : "text-green-700 hover:text-green-500"
              }`}
            >
              My Submissions
            </button>
            
            <button
              onClick={() => setActiveTab("settings")}
              className={`py-2 px-4 font-mono ${
                activeTab === "settings"
                  ? "border-b-2 border-green-500 text-green-400"
                  : "text-green-700 hover:text-green-500"
              }`}
            >
              Account Settings
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        <div>
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div>
              <h2 className="text-xl font-bold mb-4 cyber-text">Recent Activity</h2>
              
              {activities && activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="cyber-container p-4">
                      <div className="flex justify-between mb-2">
                        <span className="font-mono text-sm text-green-400">
                          {activity.date}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-900/50 text-green-500 font-mono">
                          {activity.type}
                        </span>
                      </div>
                      <p className="font-mono">{activity.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="cyber-container p-6 text-center">
                  <p className="font-mono text-green-700">No recent activity found.</p>
                  <p className="font-mono mt-2">
                    Start by exploring available programs and submitting your first bug report.
                  </p>
                  <Link href="/programs">
                    <a className="inline-block mt-4 px-4 py-2 bg-green-900/30 hover:bg-green-900/50 border border-green-700 rounded transition-colors duration-300 font-mono">
                      Browse Programs
                    </a>
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {/* Submissions Tab */}
          {activeTab === "submissions" && (
            <div>
              <h2 className="text-xl font-bold mb-4 cyber-text">My Submissions</h2>
              <p className="font-mono mb-4">Track all your vulnerability reports and their status.</p>
              
              {/* This would be replaced with actual submissions data */}
              <div className="cyber-container p-6 text-center">
                <p className="font-mono">Your submissions will appear here.</p>
                <Link href="/submit">
                  <a className="inline-block mt-4 px-4 py-2 bg-green-900/30 hover:bg-green-900/50 border border-green-700 rounded transition-colors duration-300 font-mono">
                    Submit New Bug
                  </a>
                </Link>
              </div>
            </div>
          )}
          
          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div>
              <h2 className="text-xl font-bold mb-4 cyber-text">Account Settings</h2>
              <p className="font-mono mb-6">Manage your profile and account preferences.</p>
              
              <form className="cyber-container p-6 space-y-4">
                <div>
                  <label className="block mb-1 font-mono">Username</label>
                  <input
                    type="text"
                    value={user?.username}
                    readOnly
                    className="w-full p-2 bg-black border border-green-700 rounded outline-none font-mono"
                  />
                </div>
                
                <div>
                  <label className="block mb-1 font-mono">Email</label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    className="w-full p-2 bg-black border border-green-700 focus:border-green-500 rounded outline-none font-mono"
                  />
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-black font-bold rounded transition-colors duration-300"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}