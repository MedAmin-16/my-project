
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { MatrixBackground } from "@/components/matrix-background";
import { useAuth } from "@/hooks/use-auth";
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
  Edit
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

export default function AdminPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("users");

  // Fetch users data
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      // This would fetch from your API in production
      return [];
    }
  });

  // Fetch programs data
  const { data: programs = [], isLoading: programsLoading } = useQuery({
    queryKey: ["/api/admin/programs"],
    queryFn: async () => {
      // This would fetch from your API in production
      return [];
    }
  });

  // Fetch submissions data
  const { data: submissions = [], isLoading: submissionsLoading } = useQuery({
    queryKey: ["/api/admin/submissions"],
    queryFn: async () => {
      // This would fetch from your API in production
      return [];
    }
  });

  return (
    <div className="min-h-screen bg-deep-black">
      <MatrixBackground />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Admin Header */}
        <div className="terminal-card p-6 rounded-lg mb-8 relative overflow-hidden border-matrix/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-mono font-bold text-light-gray">
                Admin Dashboard
              </h1>
              <p className="text-dim-gray font-mono">
                System management and oversight
              </p>
            </div>
            <Shield className="h-8 w-8 text-matrix" />
          </div>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-terminal border-matrix/30">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-dim-gray font-mono text-sm">Total Users</p>
                  <p className="text-2xl text-light-gray font-mono">{users.length}</p>
                </div>
                <Users className="h-8 w-8 text-matrix" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-terminal border-matrix/30">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-dim-gray font-mono text-sm">Active Programs</p>
                  <p className="text-2xl text-light-gray font-mono">{programs.length}</p>
                </div>
                <Shield className="h-8 w-8 text-matrix" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-terminal border-matrix/30">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-dim-gray font-mono text-sm">Pending Reviews</p>
                  <p className="text-2xl text-light-gray font-mono">
                    {submissions.filter(s => s.status === 'pending').length}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-warning-yellow" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-terminal border-matrix/30">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-dim-gray font-mono text-sm">System Status</p>
                  <p className="text-2xl text-light-gray font-mono">Active</p>
                </div>
                <Settings className="h-8 w-8 text-electric-blue animate-spin-slow" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="bg-terminal border-b border-matrix/30 w-full justify-start rounded-b-none h-12">
            <TabsTrigger value="users" className="data-[state=active]:text-matrix data-[state=active]:border-matrix">
              Users
            </TabsTrigger>
            <TabsTrigger value="programs" className="data-[state=active]:text-matrix data-[state=active]:border-matrix">
              Programs
            </TabsTrigger>
            <TabsTrigger value="submissions" className="data-[state=active]:text-matrix data-[state=active]:border-matrix">
              Submissions
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:text-matrix data-[state=active]:border-matrix">
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 bg-terminal border-matrix/30"
                  />
                  <Button variant="outline" className="border-matrix/30">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
                <Button className="bg-matrix text-black hover:bg-matrix/80">
                  Add User
                </Button>
              </div>

              <div className="bg-terminal border border-matrix/30 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-matrix/30">
                      <th className="p-4 text-left text-dim-gray font-mono">User</th>
                      <th className="p-4 text-left text-dim-gray font-mono">Role</th>
                      <th className="p-4 text-left text-dim-gray font-mono">Status</th>
                      <th className="p-4 text-left text-dim-gray font-mono">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-matrix/10">
                        <td className="p-4">
                          <div className="flex items-center">
                            <User className="h-5 w-5 text-matrix mr-2" />
                            <span className="text-light-gray font-mono">{user.username}</span>
                          </div>
                        </td>
                        <td className="p-4 text-light-gray font-mono">{user.role}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded text-xs font-mono bg-matrix/10 text-matrix">
                            Active
                          </span>
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-alert-red">
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Other tabs would be implemented similarly */}
          <TabsContent value="programs">
            <div className="text-dim-gray font-mono">Programs management coming soon</div>
          </TabsContent>

          <TabsContent value="submissions">
            <div className="text-dim-gray font-mono">Submissions management coming soon</div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="text-dim-gray font-mono">System settings coming soon</div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
