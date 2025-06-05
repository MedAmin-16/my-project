
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import Navbar from "@/components/layout/navbar";
import MatrixBackground from "@/components/matrix-background";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      return response.json();
    }
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
      <div className="bg-black/80 border-b border-matrix/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-matrix" />
              <h1 className="text-xl font-mono font-bold text-light-gray">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-dim-gray hover:text-matrix text-sm font-mono">
                View Site
              </Link>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-matrix/30 text-matrix hover:bg-matrix/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="terminal-card border-matrix/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dim-gray text-sm font-mono">Total Users</p>
                  <p className="text-2xl font-mono font-bold text-light-gray">
                    {stats.totalUsers || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-matrix" />
              </div>
            </CardContent>
          </Card>

          <Card className="terminal-card border-matrix/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dim-gray text-sm font-mono">Active Programs</p>
                  <p className="text-2xl font-mono font-bold text-light-gray">
                    {stats.activePrograms || 0}
                  </p>
                </div>
                <Bug className="h-8 w-8 text-matrix" />
              </div>
            </CardContent>
          </Card>

          <Card className="terminal-card border-matrix/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dim-gray text-sm font-mono">Total Submissions</p>
                  <p className="text-2xl font-mono font-bold text-light-gray">
                    {stats.totalSubmissions || 0}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-matrix" />
              </div>
            </CardContent>
          </Card>

          <Card className="terminal-card border-matrix/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dim-gray text-sm font-mono">Pending Reviews</p>
                  <p className="text-2xl font-mono font-bold text-light-gray">
                    {stats.pendingReviews || 0}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-matrix" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/30 border border-primary/20">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-matrix"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="users"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-matrix"
            >
              Users
            </TabsTrigger>
            <TabsTrigger 
              value="programs"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-matrix"
            >
              Programs
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-matrix"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card className="terminal-card border-matrix/30">
              <CardContent className="p-6">
                <h3 className="text-lg font-mono font-bold text-light-gray mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-matrix/20">
                    <span className="text-dim-gray font-mono">New user registration</span>
                    <span className="text-matrix text-sm">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-matrix/20">
                    <span className="text-dim-gray font-mono">Bug submission approved</span>
                    <span className="text-matrix text-sm">4 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-matrix/20">
                    <span className="text-dim-gray font-mono">New program created</span>
                    <span className="text-matrix text-sm">1 day ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="terminal-card border-matrix/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-mono font-bold text-light-gray">
                    User Management
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64 bg-black/50 border-matrix/30"
                    />
                    <Button variant="outline" size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {usersLoading ? (
                    <div className="text-center py-8">
                      <div className="text-dim-gray font-mono">Loading users...</div>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-dim-gray font-mono">No users found</div>
                    </div>
                  ) : (
                    users.map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between py-3 border-b border-matrix/20">
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-matrix" />
                          <div>
                            <div className="text-light-gray font-mono">{user.username}</div>
                            <div className="text-dim-gray text-sm">{user.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            user.userType === 'company' ? 'bg-blue-500/20 text-blue-400' : 'bg-matrix/20 text-matrix'
                          }`}>
                            {user.userType}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-400">
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="programs">
            <Card className="terminal-card border-matrix/30">
              <CardContent className="p-6">
                <h3 className="text-lg font-mono font-bold text-light-gray mb-4">
                  Program Management
                </h3>
                <div className="text-center py-8">
                  <div className="text-dim-gray font-mono">Program management interface coming soon...</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="terminal-card border-matrix/30">
              <CardContent className="p-6">
                <h3 className="text-lg font-mono font-bold text-light-gray mb-4">
                  System Settings
                </h3>
                <div className="text-center py-8">
                  <div className="text-dim-gray font-mono">System settings interface coming soon...</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
