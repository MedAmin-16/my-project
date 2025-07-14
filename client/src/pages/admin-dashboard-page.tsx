import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { MatrixBackground } from "@/components/matrix-background";
import {
  Users,
  Shield,
  Activity,
  Settings,
  AlertTriangle,
  User,
  Bug,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  MoreVertical,
  Trash,
  Edit,
  LogOut
} from "lucide-react";
// Removed Tabs components - using custom implementation
// Using custom styled components instead of UI library components

export default function AdminDashboardPage() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Check admin authentication
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          console.log("No admin token found, redirecting to login");
          navigate("/admin");
          return;
        }

        const response = await fetch("/api/admin/verify", {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });
        if (!response.ok) {
          console.log("Admin verification failed, redirecting to login");
          localStorage.removeItem('adminToken');
          navigate("/admin");
        }
      } catch (error) {
        console.error("Admin verification error:", error);
        localStorage.removeItem('adminToken');
        navigate("/admin");
      }
    };

    checkAdminAuth();
  }, [navigate]);

  // Get admin token from localStorage
  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  // Fetch admin stats
  const { data: stats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats", {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          navigate("/admin");
          throw new Error('Admin session expired');
        }
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      return data || {};
    },
    retry: false,
    refetchOnWindowFocus: false
  });

  // Fetch users data
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users", {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          navigate("/admin");
          throw new Error('Admin session expired');
        }
        throw new Error('Failed to fetch users');
      }
      return response.json();
    }
  });

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      localStorage.removeItem('adminToken');
      navigate("/admin");
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem('adminToken');
      navigate("/admin");
    }
  };

  return (
    <div className="min-h-screen bg-deep-black">
      <MatrixBackground />

      {/* Admin Header */}
      <div className="bg-terminal/80 border-b border-matrix/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-matrix" />
              <h1 className="text-xl font-mono font-bold text-matrix">
                ADMIN_PANEL
              </h1>
              <div className="text-xs text-dim-gray font-mono tracking-wider">
                [RESTRICTED_ACCESS]
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-dim-gray hover:text-matrix text-sm font-mono uppercase tracking-wider">
                &lt; Return to Site
              </Link>
              <button
                onClick={handleLogout}
                className="bg-terminal border border-matrix/30 text-matrix hover:bg-matrix/10 px-4 py-2 text-sm font-mono uppercase tracking-wider transition-all duration-300 hover:shadow-[0_0_10px_rgba(14,232,109,0.3)]"
              >
                <LogOut className="h-4 w-4 mr-2 inline" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Stats Overview */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div 
                  className="bg-dark-bg/50 border border-matrix/20 rounded p-6 hover:bg-matrix/5 transition-all duration-300 cursor-pointer group"
                  onClick={() => window.location.href = '/admin/company-wallets'}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-matrix text-2xl">💰</div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-matrix">Wallets</div>
                      <div className="text-xs text-dim-gray">Company Funds</div>
                    </div>
                  </div>
                </div>

                <div className="bg-dark-bg/50 border border-matrix/20 rounded p-6 hover:bg-matrix/5 transition-all duration-300 cursor-pointer group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-matrix text-2xl">👥</div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-matrix">{stats.totalUsers}</div>
                      <div className="text-xs text-dim-gray">Total Users</div>
                    </div>
                  </div>
                </div>

          <div className="bg-terminal border border-matrix/30 p-6 relative overflow-hidden group hover:shadow-[0_0_20px_rgba(14,232,109,0.2)] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-matrix/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-dim-gray text-sm font-mono uppercase tracking-wider">[Total_Users]</p>
                <p className="text-2xl font-mono font-bold text-matrix">
                  {String(stats.totalUsers || 0).padStart(3, '0')}
                </p>
              </div>
              <Users className="h-8 w-8 text-matrix/70" />
            </div>
          </div>

          <div className="bg-terminal border border-matrix/30 p-6 relative overflow-hidden group hover:shadow-[0_0_20px_rgba(14,232,109,0.2)] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-matrix/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-dim-gray text-sm font-mono uppercase tracking-wider">[Active_Programs]</p>
                <p className="text-2xl font-mono font-bold text-matrix">
                  {String(stats.activePrograms || 0).padStart(3, '0')}
                </p>
              </div>
              <Bug className="h-8 w-8 text-matrix/70" />
            </div>
          </div>

          <div className="bg-terminal border border-matrix/30 p-6 relative overflow-hidden group hover:shadow-[0_0_20px_rgba(14,232,109,0.2)] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-matrix/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-dim-gray text-sm font-mono uppercase tracking-wider">[Total_Submissions]</p>
                <p className="text-2xl font-mono font-bold text-matrix">
                  {String(stats.totalSubmissions || 0).padStart(3, '0')}
                </p>
              </div>
              <Activity className="h-8 w-8 text-matrix/70" />
            </div>
          </div>

          <div className="bg-terminal border border-matrix/30 p-6 relative overflow-hidden group hover:shadow-[0_0_20px_rgba(14,232,109,0.2)] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-matrix/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-dim-gray text-sm font-mono uppercase tracking-wider">[Pending_Reviews]</p>
                <p className="text-2xl font-mono font-bold text-matrix">
                  {String(stats.pendingReviews || 0).padStart(3, '0')}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-matrix/70" />
            </div>
          </div>
        </div>

        {/* Admin Tabs */}
        <div className="space-y-6">
          <div className="grid w-full grid-cols-4 bg-terminal border border-matrix/30 p-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`font-mono uppercase tracking-wider py-3 px-6 transition-all duration-300 ${
                activeTab === "overview" 
                  ? "bg-matrix/20 text-matrix border border-matrix/50 shadow-[0_0_10px_rgba(14,232,109,0.3)]" 
                  : "text-dim-gray hover:text-matrix hover:bg-matrix/10"
              }`}
            >
              [Overview]
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`font-mono uppercase tracking-wider py-3 px-6 transition-all duration-300 ${
                activeTab === "users" 
                  ? "bg-matrix/20 text-matrix border border-matrix/50 shadow-[0_0_10px_rgba(14,232,109,0.3)]" 
                  : "text-dim-gray hover:text-matrix hover:bg-matrix/10"
              }`}
            >
              [Users]
            </button>
            <button
              onClick={() => setActiveTab("programs")}
              className={`font-mono uppercase tracking-wider py-3 px-6 transition-all duration-300 ${
                activeTab === "programs" 
                  ? "bg-matrix/20 text-matrix border border-matrix/50 shadow-[0_0_10px_rgba(14,232,109,0.3)]" 
                  : "text-dim-gray hover:text-matrix hover:bg-matrix/10"
              }`}
            >
              [Programs]
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`font-mono uppercase tracking-wider py-3 px-6 transition-all duration-300 ${
                activeTab === "settings" 
                  ? "bg-matrix/20 text-matrix border border-matrix/50 shadow-[0_0_10px_rgba(14,232,109,0.3)]" 
                  : "text-dim-gray hover:text-matrix hover:bg-matrix/10"
              }`}
            >
              [Settings]
            </button>
          </div>

          {activeTab === "overview" && (
            <div className="bg-terminal border border-matrix/30 p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-matrix/5 to-transparent"></div>
              <div className="relative z-10">
                <h3 className="text-lg font-mono font-bold text-matrix mb-6 uppercase tracking-wider">
                  {">> Recent_Activity_Log"}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-matrix/20 group hover:bg-matrix/5 transition-all duration-300 px-2">
                    <span className="text-dim-gray font-mono">[INFO] New user registration</span>
                    <span className="text-matrix text-sm font-mono">2h_ago</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-matrix/20 group hover:bg-matrix/5 transition-all duration-300 px-2">
                    <span className="text-dim-gray font-mono">[SUCCESS] Bug submission approved</span>
                    <span className="text-matrix text-sm font-mono">4h_ago</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-matrix/20 group hover:bg-matrix/5 transition-all duration-300 px-2">
                    <span className="text-dim-gray font-mono">[INFO] New program created</span>
                    <span className="text-matrix text-sm font-mono">1d_ago</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-matrix/20 group hover:bg-matrix/5 transition-all duration-300 px-2">
                    <span className="text-dim-gray font-mono">[SYSTEM] Database backup completed</span>
                    <span className="text-matrix text-sm font-mono">2d_ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="bg-terminal border border-matrix/30 p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-matrix/5 to-transparent"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-mono font-bold text-matrix uppercase tracking-wider">
                    {">> User_Management_Console"}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <input
                      placeholder="[SEARCH_USERS...]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64 bg-deep-black/80 border border-matrix/30 text-matrix font-mono px-4 py-2 focus:border-matrix focus:shadow-[0_0_10px_rgba(14,232,109,0.3)] outline-none"
                    />
                    <button className="bg-terminal border border-matrix/30 text-matrix hover:bg-matrix/10 p-2 transition-all duration-300 hover:shadow-[0_0_10px_rgba(14,232,109,0.3)]">
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  {usersLoading ? (
                    <div className="text-center py-8">
                      <div className="text-dim-gray font-mono">[LOADING_USERS...]</div>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-dim-gray font-mono">[NO_USERS_FOUND]</div>
                    </div>
                  ) : (
                    users.map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between py-4 border-b border-matrix/20 group hover:bg-matrix/5 transition-all duration-300 px-2">
                        <div className="flex items-center space-x-4">
                          <User className="h-5 w-5 text-matrix/70" />
                          <div>
                            <div className="text-matrix font-mono">{user.username}</div>
                            <div className="text-dim-gray text-sm font-mono">{user.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`text-xs px-3 py-1 font-mono uppercase tracking-wider border ${
                            user.userType === 'company' 
                              ? 'bg-blue-500/10 text-blue-400 border-blue-400/30' 
                              : 'bg-matrix/10 text-matrix border-matrix/30'
                          }`}>
                            [{user.userType}]
                          </span>
                          <button className="text-dim-gray hover:text-matrix transition-colors duration-300">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "programs" && (
            <div className="bg-terminal border border-matrix/30 p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-matrix/5 to-transparent"></div>
              <div className="relative z-10">
                <h3 className="text-lg font-mono font-bold text-matrix mb-6 uppercase tracking-wider">
                  {">> Program_Management_Console"}
                </h3>
                <div className="text-center py-12">
                  <div className="text-dim-gray font-mono text-lg">[INTERFACE_LOADING...]</div>
                  <div className="text-dim-gray font-mono text-sm mt-2">Program management interface coming soon...</div>
                  <div className="mt-6 text-matrix font-mono text-xs">
                    {">> Initializing security protocols..."}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="bg-terminal border border-matrix/30 p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-matrix/5 to-transparent"></div>
              <div className="relative z-10">
                <h3 className="text-lg font-mono font-bold text-matrix mb-6 uppercase tracking-wider">
                  {">> System_Settings_Console"}
                </h3>
                <div className="text-center py-12">
                  <div className="text-dim-gray font-mono text-lg">[SYSTEM_CONFIG_LOADING...]</div>
                  <div className="text-dim-gray font-mono text-sm mt-2">System settings interface coming soon...</div>
                  <div className="mt-6 text-matrix font-mono text-xs">
                    {">> Accessing system configuration..."}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}