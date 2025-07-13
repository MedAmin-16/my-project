import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Save } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { BadgeCheck, ShieldAlert, Shield, DollarSign, Users, Cpu, BugIcon, Clock, BarChart3, PlusCircle, Zap, Settings, Plus, CheckCircle, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
import { Link, useLocation } from "wouter";
import PublicChat from "@/components/public-chat";

// Company Dashboard Page
export default function CompanyDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Fetch company's bug bounty programs
  const { data: programs = [] } = useQuery({
    queryKey: ["/api/company/programs"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0]);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user && user.userType === "company"
  });

  // Fetch submissions for company programs
  const { data: submissions = [] } = useQuery({
    queryKey: ["/api/company/submissions"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0]);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user && user.userType === "company"
  });

  // Stats calculation
  const stats = {
    totalPrograms: programs.length,
    activePrograms: programs.filter((p: any) => p.status === "active").length,
    pendingSubmissions: submissions.filter((s: any) => s.status === "pending").length,
    approvedSubmissions: submissions.filter((s: any) => s.status === "approved").length,
    rejectedSubmissions: submissions.filter((s: any) => s.status === "rejected").length,
    totalSubmissions: submissions.length,
    totalPayout: submissions
      .filter((s: any) => s.status === "approved")
      .reduce((sum: number, s: any) => sum + (s.reward || 0), 0),
  };

  // Calculate submission status distribution
  const submissionDistribution = {
    pending: (stats.pendingSubmissions / (stats.totalSubmissions || 1)) * 100,
    approved: (stats.approvedSubmissions / (stats.totalSubmissions || 1)) * 100,
    rejected: (stats.rejectedSubmissions / (stats.totalSubmissions || 1)) * 100,
  };

  // Handle creating a new program
  const handleCreateProgram = () => {
    // Navigate to the create program page
    setLocation("/create-program");
  };

  // Filter submissions to recent ones and pending
  const recentSubmissions = submissions
    .sort((a: any, b: any) => {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    })
    .slice(0, 5);

  const pendingSubmissions = submissions
    .filter((s: any) => s.status === "pending")
    .sort((a: any, b: any) => {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    })
    .slice(0, 5);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();

      // Clear all cookies
      document.cookie.split(';').forEach(c => {
        document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      });

      // Clear stored data
      localStorage.clear();
      sessionStorage.clear();

      // Clear any cached queries
      queryClient.clear();

      // Redirect to auth page
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col space-y-6 p-6 bg-black min-h-screen text-white">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-matrix">Company Dashboard</h1>
        <p className="text-dim-gray">
          Welcome back, <span className="text-matrix">{user?.companyName || user?.username}</span>
        </p>
      </div>

      <Tabs
        defaultValue={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-5 mb-6 bg-black border border-matrix/20">
          <TabsTrigger value="overview" className="data-[state=active]:bg-matrix/20 data-[state=active]:text-matrix">
            <BarChart3 className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="programs" className="data-[state=active]:bg-matrix/20 data-[state=active]:text-matrix">
            <Shield className="mr-2 h-4 w-4" />
            Programs
          </TabsTrigger>
          <TabsTrigger value="submissions" className="data-[state=active]:bg-matrix/20 data-[state=active]:text-matrix">
            <BugIcon className="mr-2 h-4 w-4" />
            Submissions
          </TabsTrigger>
          <TabsTrigger value="triage" className="data-[state=active]:bg-matrix/20 data-[state=active]:text-matrix">
            <Shield className="mr-2 h-4 w-4" />
            Triage Service
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-matrix/20 data-[state=active]:text-matrix">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="chat">Community Chat</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-black border border-matrix/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-dim-gray">
                  Total Programs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-matrix mr-2" />
                  <span className="text-2xl font-bold">{stats.totalPrograms}</span>
                </div>
                <p className="text-xs text-dim-gray mt-2">
                  {stats.activePrograms} active programs
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black border border-matrix/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-dim-gray">
                  Total Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <BugIcon className="h-5 w-5 text-matrix mr-2" />
                  <span className="text-2xl font-bold">{stats.totalSubmissions}</span>
                </div>
                <p className="text-xs text-dim-gray mt-2">
                  {stats.pendingSubmissions} pending review
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black border border-matrix/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-dim-gray">
                  Approved Vulnerabilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <BadgeCheck className="h-5 w-5 text-matrix mr-2" />
                  <span className="text-2xl font-bold">{stats.approvedSubmissions}</span>
                </div>
                <p className="text-xs text-dim-gray mt-2">
                  {((stats.approvedSubmissions / (stats.totalSubmissions || 1)) * 100).toFixed(1)}% approval rate
                </p>
              </CardContent>
            </Card>

            <Card 
              className="bg-black border border-matrix/20 hover:border-matrix cursor-pointer transition-colors"
              onClick={() => setLocation("/company/wallet")}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-dim-gray">
                  Total Payout
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-matrix mr-2" />
                  <span className="text-2xl font-bold">${stats.totalPayout.toLocaleString()}</span>
                </div>
                <p className="text-xs text-dim-gray mt-2">
                  💼 Click to view wallet
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-2 bg-black border border-matrix/20">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest submissions across all your programs</CardDescription>
              </CardHeader>
              <CardContent>
                {recentSubmissions.length > 0 ? (
                  <div className="space-y-4">
                    {recentSubmissions.map((submission: any) => (
                      <div key={submission.id} className="flex items-start space-x-4 pb-3 border-b border-primary/10">
                        <div className={`p-2 rounded-full ${
                          submission.status === "approved" 
                          ? "bg-green-900/20" 
                          : submission.status === "rejected" 
                          ? "bg-red-900/20" 
                          : "bg-yellow-900/20"
                        }`}>
                          {submission.status === "approved" ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : submission.status === "rejected" ? (
                            <ShieldAlert className="h-4 w-4 text-red-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="text-sm font-semibold">
                              {submission.title}
                            </h4>
                            <span className="text-xs text-dim-gray">
                              {submission.createdAt ? formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true }) : "Recently"}
                            </span>
                          </div>
                          <p className="text-xs text-dim-gray mt-1">
                            Reported by: {submission.username || "Anonymous"}
                          </p>
                          <div className="mt-1 flex items-center">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              submission.severity === "critical" ? "bg-red-900/20 text-red-500" :
                              submission.severity === "high" ? "bg-orange-900/20 text-orange-500" :
                              submission.severity === "medium" ? "bg-yellow-900/20 text-yellow-500" :
                              "bg-blue-900/20 text-blue-500"
                            }`}>
                              {submission.severity || "Low"}
                            </span>
                            {submission.status === "approved" && submission.reward && (
                              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-900/20 text-green-500">
                                ${submission.reward}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <BugIcon className="h-8 w-8 text-dim-gray mx-auto mb-3" />
                    <h3 className="text-lg font-medium">No submissions yet</h3>
                    <p className="text-dim-gray text-sm mt-1">
                      When researchers submit vulnerabilities, they'll appear here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-black border border-matrix/20">
              <CardHeader>
                <CardTitle>Submission Status</CardTitle>
                <CardDescription>Distribution of vulnerability reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {stats.totalSubmissions > 0 ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-dim-gray">Pending</span>
                        <span>{stats.pendingSubmissions} ({submissionDistribution.pending.toFixed(0)}%)</span>
                      </div>
                      <Progress value={submissionDistribution.pending} className="h-2 bg-primary/10">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${submissionDistribution.pending}%` }}></div>
                      </Progress>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-dim-gray">Approved</span>
                        <span>{stats.approvedSubmissions} ({submissionDistribution.approved.toFixed(0)}%)</span>
                      </div>
                      <Progress value={submissionDistribution.approved} className="h-2 bg-primary/10">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${submissionDistribution.approved}%` }}></div>
                      </Progress>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-dim-gray">Rejected</span>
                        <span>{stats.rejectedSubmissions} ({submissionDistribution.rejected.toFixed(0)}%)</span>
                      </div>
                      <Progress value={submissionDistribution.rejected} className="h-2 bg-primary/10">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${submissionDistribution.rejected}%` }}></div>
                      </Progress>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <BarChart3 className="h-8 w-8 text-dim-gray mx-auto mb-3" />
                    <h3 className="text-lg font-medium">No data yet</h3>
                    <p className="text-dim-gray text-sm mt-1">
                      Statistics will appear once you receive submissions.
                    </p>
                  </div>
                )}

                <div className="space-y-2 mt-4">
                  <Button 
                    onClick={handleCreateProgram}
                    className="w-full glow-button"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Program
                  </Button>
                  <Button 
                    onClick={() => setLocation("/company/wallet")}
                    variant="outline"
                    className="w-full border-matrix/30 hover:bg-matrix/20 hover:text-matrix"
                  >
                    💼 My Wallet
                  </Button>
                  <Button 
                    onClick={() => setLocation("/triage-dashboard")}
                    variant="outline"
                    className="w-full border-matrix/30 hover:bg-matrix/20 hover:text-matrix"
                  >
                    🔍 Managed Triage Service
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-black border border-matrix/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 text-matrix mr-2" />
                Managed Triage Service
              </CardTitle>
              <CardDescription>Professional vulnerability assessment for your security programs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-dim-gray text-sm mb-4">
                Don't have a security team? Let our experts handle vulnerability triage, validation, and prioritization for you.
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setLocation("/triage-dashboard")}
                  className="glow-button flex-1"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Access Triage Dashboard
                </Button>
                <Button 
                  variant="outline"
                  className="border-matrix/30 hover:bg-matrix/20 hover:text-matrix"
                  onClick={() => setActiveTab("triage")}
                >
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Programs Tab */}
        <TabsContent value="programs" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Your Bug Bounty Programs</h2>
            <Button onClick={handleCreateProgram} className="glow-button">
              <Plus className="mr-2 h-4 w-4" />
              New Program
            </Button>
          </div>

          {programs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {programs.map((program: any) => (
                <Card key={program.id} className="bg-black border border-matrix/20 hover:border-matrix transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          {program.name}
                          {program.status === "active" && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900/20 text-green-500">
                              Active
                            </span>
                          )}
                          {program.status === "paused" && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-900/20 text-yellow-500">
                              Paused
                            </span>
                          )}
                          {program.status === "closed" && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-900/20 text-red-500">
                              Closed
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {program.description?.substring(0, 100)}{program.description?.length > 100 ? '...' : ''}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm mb-4">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-matrix mr-1" />
                        <span>{program.rewardsRange}</span>
                      </div>
                      <div className="flex items-center">
                        <BugIcon className="h-4 w-4 text-matrix mr-1" />
                        <span>
                          {
                            submissions.filter((s: any) => s.programId === program.id).length || 0
                          } submissions
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <Link href={`/programs/${program.id}`}>
                        <Button variant="outline" className="w-full border-matrix/30 hover:bg-matrix/20 hover:text-matrix">
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/programs/${program.id}/edit`}>
                        <Button variant="outline" className="w-full border-matrix/30 hover:bg-matrix/20 hover:text-matrix">
                          Edit Program
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 terminal-card bg-terminal/50 border border-dashed border-matrix/30 rounded-lg">
              <Shield className="h-12 w-12 text-dim-gray mx-auto mb-4" />
              <h3 className="text-lg font-medium">No programs yet</h3>
              <p className="text-dim-gray text-sm mt-2 max-w-md mx-auto">
                Create your first bug bounty program to start receiving vulnerability reports from security researchers.
              </p>
              <Button onClick={handleCreateProgram} className="mt-6 glow-button">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Program
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Vulnerability Submissions</h2>
            <div className="flex space-x-2">
              <Button variant="outline" className="border-matrix/30 hover:bg-matrix/20 hover:text-matrix">
                <Clock className="mr-2 h-4 w-4" />
                Pending ({stats.pendingSubmissions})
              </Button>
              <Button variant="outline" className="border-matrix/30 hover:bg-matrix/20 hover:text-matrix">
                All Submissions
              </Button>
            </div>
          </div>

          {submissions.length > 0 ? (
            <div className="space-y-4">
              {pendingSubmissions.length > 0 ? (
                <div className="bg-yellow-900/10 border border-yellow-900/30 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Pending Review</h3>
                      <p className="text-sm text-dim-gray">
                        You have {stats.pendingSubmissions} submissions awaiting your review.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-matrix/20">
                      <th className="py-3 px-4 text-left text-xs font-medium text-dim-gray uppercase tracking-wider">Title</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-dim-gray uppercase tracking-wider">Program</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-dim-gray uppercase tracking-wider">Severity</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-dim-gray uppercase tracking-wider">Status</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-dim-gray uppercase tracking-wider">Submitted</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-dim-gray uppercase tracking-wider">Reward</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-dim-gray uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((submission: any) => {
                      const program = programs.find((p: any) => p.id === submission.programId);
                      return (
                        <tr key={submission.id} className="border-b border-primary/10 hover:bg-primary/5">
                          <td className="py-3 px-4">
                            <div className="font-medium">{submission.title}</div>
                            <div className="text-xs text-dim-gray">by {submission.username || "Anonymous"}</div>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {program?.name || "Unknown Program"}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex text-xs px-2 py-0.5 rounded-full ${
                              submission.severity === "critical" ? "bg-red-900/20 text-red-500" :
                              submission.severity === "high" ? "bg-orange-900/20 text-orange-500" :
                              submission.severity === "medium" ? "bg-yellow-900/20 text-yellow-500" :
                              "bg-blue-900/20 text-blue-500"
                            }`}>
                              {submission.severity || "Low"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex text-xs px-2 py-0.5 rounded-full ${
                              submission.status === "approved" ? "bg-green-900/20 text-green-500" :
                              submission.status === "rejected" ? "bg-red-900/20 text-red-500" :
                              submission.status === "yellow" ? "bg-yellow-900/20 text-yellow-500" :
                              "bg-blue-900/20 text-blue-500"
                            }`}>
                              {submission.status === "approved" ? "Approved" : 
                               submission.status === "rejected" ? "Rejected" : "Pending"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {submission.createdAt ? formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true }) : "Recently"}
                          </td>
                          <td className="py-3 px-4">
                            {submission.status === "approved" && submission.reward ? (
                              <span className="text-green-500">${submission.reward}</span>
                            ) : (
                              <span className="text-dim-gray">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link href={`/submissions/${submission.id}`}>
                              <Button variant="outline" size="sm" className="border-matrix/30 hover:bg-matrix/20 hover:text-matrix">
                                View
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 terminal-card bg-terminal/50 border border-dashed border-matrix/30 rounded-lg">
              <BugIcon className="h-12 w-12 text-dim-gray mx-auto mb-4" />
              <h3 className="text-lg font-medium">No submissions yet</h3>
              <p className="text-dim-gray text-sm mt-2 max-w-md mx-auto">
                Once you create programs and researchers find vulnerabilities, they'll submit reports that appear here.
              </p>
              <Button onClick={handleCreateProgram} className="mt-6 glow-button">
                <Plus className="mr-2 h-4 w-4" />
                Create a Program
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Triage Service Tab */}
        <TabsContent value="triage" className="space-y-6">
          <div className="text-center py-8">
            <Shield className="h-16 w-16 text-matrix mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Managed Vulnerability Triage Service</h2>
            <p className="text-dim-gray mb-6 max-w-2xl mx-auto">
              Professional vulnerability assessment and triage services for companies without dedicated security teams. 
              Our experts will review, validate, and prioritize vulnerability reports on your behalf.
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                onClick={() => setLocation("/triage-dashboard")}
                className="glow-button"
              >
                <Shield className="mr-2 h-4 w-4" />
                Access Triage Dashboard
              </Button>
              <Button 
                variant="outline"
                className="border-matrix/30 hover:bg-matrix/20 hover:text-matrix"
              >
                Learn More
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-4xl mx-auto">
              <Card className="bg-black border border-matrix/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <h3 className="font-medium mb-2">Expert Validation</h3>
                    <p className="text-sm text-dim-gray">
                      Professional security analysts validate and assess every vulnerability report
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-black border border-matrix/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <h3 className="font-medium mb-2">24-Hour Response</h3>
                    <p className="text-sm text-dim-gray">
                      Get initial triage assessments within 24 hours of submission
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-black border border-matrix/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <DollarSign className="h-8 w-8 text-matrix mx-auto mb-2" />
                    <h3 className="font-medium mb-2">Flexible Pricing</h3>
                    <p className="text-sm text-dim-gray">
                      Pay per report or choose monthly/annual subscription plans
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-black border border-matrix/20">
            <CardHeader>
              <CardTitle className="text-matrix">Company Settings</CardTitle>
              <CardDescription>Manage your company profile and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Company Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input
                        defaultValue={user?.companyName}
                        className="terminal-input"
                        placeholder="Enter company name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Company Website</Label>
                      <Input
                        defaultValue={user?.companyWebsite}
                        className="terminal-input"
                        placeholder="https://example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Industry</Label>
                      <Input
                        defaultValue={user?.industry}
                        className="terminal-input"
                        placeholder="Enter industry"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Company Size</Label>
                      <Select defaultValue={user?.companySize}>
                        <SelectTrigger className="terminal-input">
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-500">201-500 employees</SelectItem>
                          <SelectItem value="501+">501+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Email</Label>
                      <Input
                        defaultValue={user?.email}
                        className="terminal-input"
                        placeholder="contact@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input
                        defaultValue={user?.phone}
                        className="terminal-input"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Security Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-dark-terminal rounded">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-dim-gray">Add an extra layer of security to your account</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-dark-terminal rounded">
                      <div>
                        <p className="font-medium">Login Notifications</p>
                        <p className="text-sm text-dim-gray">Get notified of new login attempts</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Notification Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-dark-terminal rounded">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-dim-gray">Receive program and submission updates via email</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-dark-terminal rounded">
                      <div>
                        <p className="font-medium">Weekly Reports</p>
                        <p className="text-sm text-dim-gray">Receive weekly summary of program activities</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full mt-6 glow-button"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/user', {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                          companyName: user?.companyName,
                          companyWebsite: user?.companyWebsite,
                          companySize: user?.companySize,
                          industry: user?.industry,
                          email: user?.email,
                          phone: user?.phone,
                        }),
                      });

                      if (response.ok) {
                        const data = await response.json();
                        toast({
                          title: "Success",
                          description: "Settings updated successfully",
                        });
                      } else {
                        const errorData = await response.json();
                        toast({
                          title: "Error",
                          description: errorData.message || "Failed to update settings",
                          variant: "destructive",
                        });
                      }
                    } catch (error) {
                      console.error('Save error:', error);
                      toast({
                        title: "Error",
                        description: "Failed to update settings. Please try again.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>

                <div className="mt-8 border-t border-matrix/20 pt-6">
                  <h3 className="text-lg font-medium mb-4 text-alert-red">Danger Zone</h3>
                  <Button 
                    variant="destructive"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="chat" className="space-y-6">
          <PublicChat />
        </TabsContent>
      </Tabs>
    </div>
  );
}