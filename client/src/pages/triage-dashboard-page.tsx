
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { 
  Shield, Users, Clock, CheckCircle, TrendingUp, AlertTriangle,
  MessageSquare, FileText, DollarSign, Star, Activity, Calendar,
  Filter, Search, Download, Settings, Bell, UserCheck
} from "lucide-react";
import { Loader2 } from "lucide-react";
import MatrixBackground from "@/components/matrix-background";
import Navbar from "@/components/layout/navbar";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TriageStats {
  totalRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  completedRequests: number;
  averageCompletionTime: string;
  customerSatisfactionRating: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  topTriager: {
    name: string;
    completedRequests: number;
    avgRating: number;
  };
  recentActivity: Array<{
    id: number;
    type: string;
    message: string;
    timestamp: string;
  }>;
}

interface TriageRequest {
  id: number;
  submissionId: number;
  companyId: number;
  status: string;
  priority: string;
  assignedTriagerId?: number;
  estimatedCompletionDate: string;
  actualCompletionDate?: string;
  cost: number;
  createdAt: string;
  submission: {
    id: number;
    title: string;
    type: string;
    severity: string;
  };
  company: {
    id: number;
    username: string;
    companyName: string;
  };
  assignedTriager?: {
    id: number;
    username: string;
  };
  report?: {
    id: number;
    validationStatus: string;
    riskLevel: string;
    severityAssessment: string;
  };
}

export default function TriageDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch triage dashboard stats
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError
  } = useQuery<TriageStats>({
    queryKey: ["/api/triage/dashboard/stats"],
  });

  // Fetch triage requests
  const {
    data: triageRequests,
    isLoading: requestsLoading,
    error: requestsError
  } = useQuery<TriageRequest[]>({
    queryKey: ["/api/triage/requests"],
  });

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-warning-yellow/20 text-warning-yellow border-warning-yellow/50";
      case "in_progress": return "bg-electric-blue/20 text-electric-blue border-electric-blue/50";
      case "completed": return "bg-matrix/20 text-matrix border-matrix/50";
      case "cancelled": return "bg-alert-red/20 text-alert-red border-alert-red/50";
      default: return "bg-dim-gray/20 text-dim-gray border-dim-gray/50";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-alert-red/20 text-alert-red border-alert-red/50";
      case "high": return "bg-warning-yellow/20 text-warning-yellow border-warning-yellow/50";
      case "medium": return "bg-electric-blue/20 text-electric-blue border-electric-blue/50";
      case "low": return "bg-matrix/20 text-matrix border-matrix/50";
      default: return "bg-dim-gray/20 text-dim-gray border-dim-gray/50";
    }
  };

  // Filter triage requests
  const filteredRequests = triageRequests?.filter(request => {
    const matchesStatus = filterStatus === "all" || request.status === filterStatus;
    const matchesPriority = filterPriority === "all" || request.priority === filterPriority;
    const matchesSearch = searchTerm === "" || 
      request.submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.company.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  }) || [];

  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="terminal-card p-6 rounded-lg mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-mono font-bold text-light-gray mb-2 flex items-center">
                <Shield className="mr-3 h-6 w-6 text-matrix" />
                Managed Triage Dashboard
              </h1>
              <p className="text-dim-gray font-mono">
                Professional vulnerability triage and management services
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Button className="glow-button-secondary">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button className="glow-button">
                <FileText className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {statsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-matrix" />
          </div>
        ) : statsError ? (
          <div className="terminal-card p-6 rounded-lg text-center mb-8">
            <AlertTriangle className="h-8 w-8 text-alert-red mx-auto mb-2" />
            <p className="text-alert-red font-mono">Error loading stats</p>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="terminal-card p-4 rounded-lg border border-matrix/30">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-dim-gray font-mono mb-1">Total Requests</p>
                  <p className="text-2xl text-light-gray font-mono mb-1">{stats.totalRequests}</p>
                  <p className="text-xs text-matrix font-mono">Active pipeline</p>
                </div>
                <div className="bg-matrix/10 p-2 rounded-md border border-matrix/20">
                  <FileText className="h-5 w-5 text-matrix" />
                </div>
              </div>
            </div>

            <div className="terminal-card p-4 rounded-lg border border-matrix/30">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-dim-gray font-mono mb-1">Pending</p>
                  <p className="text-2xl text-warning-yellow font-mono mb-1">{stats.pendingRequests}</p>
                  <p className="text-xs text-dim-gray font-mono">Awaiting assignment</p>
                </div>
                <div className="bg-warning-yellow/10 p-2 rounded-md border border-warning-yellow/20">
                  <Clock className="h-5 w-5 text-warning-yellow" />
                </div>
              </div>
            </div>

            <div className="terminal-card p-4 rounded-lg border border-matrix/30">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-dim-gray font-mono mb-1">In Progress</p>
                  <p className="text-2xl text-electric-blue font-mono mb-1">{stats.inProgressRequests}</p>
                  <p className="text-xs text-dim-gray font-mono">Being analyzed</p>
                </div>
                <div className="bg-electric-blue/10 p-2 rounded-md border border-electric-blue/20">
                  <Activity className="h-5 w-5 text-electric-blue" />
                </div>
              </div>
            </div>

            <div className="terminal-card p-4 rounded-lg border border-matrix/30">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-dim-gray font-mono mb-1">Completed</p>
                  <p className="text-2xl text-matrix font-mono mb-1">{stats.completedRequests}</p>
                  <p className="text-xs text-matrix font-mono flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% this month
                  </p>
                </div>
                <div className="bg-matrix/10 p-2 rounded-md border border-matrix/20">
                  <CheckCircle className="h-5 w-5 text-matrix" />
                </div>
              </div>
            </div>

            <div className="terminal-card p-4 rounded-lg border border-matrix/30">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-dim-gray font-mono mb-1">Avg Completion</p>
                  <p className="text-2xl text-light-gray font-mono mb-1">{stats.averageCompletionTime}</p>
                  <p className="text-xs text-matrix font-mono">Target: 24h</p>
                </div>
                <div className="bg-surface/50 p-2 rounded-md border border-matrix/20">
                  <Calendar className="h-5 w-5 text-matrix" />
                </div>
              </div>
            </div>

            <div className="terminal-card p-4 rounded-lg border border-matrix/30">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-dim-gray font-mono mb-1">Satisfaction</p>
                  <p className="text-2xl text-light-gray font-mono mb-1 flex items-center">
                    {stats.customerSatisfactionRating}
                    <Star className="h-4 w-4 text-warning-yellow ml-1" />
                  </p>
                  <p className="text-xs text-matrix font-mono">98% positive</p>
                </div>
                <div className="bg-warning-yellow/10 p-2 rounded-md border border-warning-yellow/20">
                  <UserCheck className="h-5 w-5 text-warning-yellow" />
                </div>
              </div>
            </div>

            <div className="terminal-card p-4 rounded-lg border border-matrix/30">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-dim-gray font-mono mb-1">Monthly Revenue</p>
                  <p className="text-2xl text-electric-blue font-mono mb-1">${(stats.monthlyRevenue / 100).toLocaleString()}</p>
                  <p className="text-xs text-matrix font-mono">+23% MoM</p>
                </div>
                <div className="bg-electric-blue/10 p-2 rounded-md border border-electric-blue/20">
                  <DollarSign className="h-5 w-5 text-electric-blue" />
                </div>
              </div>
            </div>

            <div className="terminal-card p-4 rounded-lg border border-matrix/30">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-dim-gray font-mono mb-1">Subscriptions</p>
                  <p className="text-2xl text-light-gray font-mono mb-1">{stats.activeSubscriptions}</p>
                  <p className="text-xs text-matrix font-mono">Enterprise: 8</p>
                </div>
                <div className="bg-surface/50 p-2 rounded-md border border-matrix/20">
                  <Users className="h-5 w-5 text-matrix" />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="mb-8" onValueChange={setActiveTab}>
          <TabsList className="bg-terminal border-b border-matrix/30 w-full justify-start rounded-b-none h-12 p-0">
            <TabsTrigger 
              value="overview" 
              className="font-mono data-[state=active]:text-matrix data-[state=active]:border-matrix data-[state=active]:border-b-2 rounded-none h-full px-4"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="requests" 
              className="font-mono data-[state=active]:text-matrix data-[state=active]:border-matrix data-[state=active]:border-b-2 rounded-none h-full px-4"
            >
              Active Requests
            </TabsTrigger>
            <TabsTrigger 
              value="team" 
              className="font-mono data-[state=active]:text-matrix data-[state=active]:border-matrix data-[state=active]:border-b-2 rounded-none h-full px-4"
            >
              Team Management
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="font-mono data-[state=active]:text-matrix data-[state=active]:border-matrix data-[state=active]:border-b-2 rounded-none h-full px-4"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Recent Activity */}
                <div className="terminal-card p-6 rounded-lg">
                  <h3 className="text-lg font-mono font-bold text-light-gray mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {stats?.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 rounded bg-surface/30 border border-matrix/20">
                        <div className="bg-matrix/10 p-1.5 rounded border border-matrix/30">
                          <Activity className="h-4 w-4 text-matrix" />
                        </div>
                        <div className="flex-1">
                          <p className="text-light-gray font-mono text-sm">{activity.message}</p>
                          <p className="text-dim-gray font-mono text-xs mt-1">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Performer */}
                <div className="terminal-card p-6 rounded-lg">
                  <h3 className="text-lg font-mono font-bold text-light-gray mb-4">Top Performer</h3>
                  <div className="flex items-center space-x-4 p-4 rounded bg-matrix/5 border border-matrix/30">
                    <div className="bg-matrix/20 p-3 rounded-full border border-matrix/50">
                      <UserCheck className="h-6 w-6 text-matrix" />
                    </div>
                    <div className="flex-1">
                      <p className="text-light-gray font-mono text-lg">{stats?.topTriager.name}</p>
                      <p className="text-dim-gray font-mono text-sm">
                        {stats?.topTriager.completedRequests} completed requests
                      </p>
                      <div className="flex items-center mt-2">
                        <Star className="h-4 w-4 text-warning-yellow mr-1" />
                        <span className="text-warning-yellow font-mono text-sm">
                          {stats?.topTriager.avgRating}/5.0 average rating
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="terminal-card p-6 rounded-lg">
                  <h3 className="text-lg font-mono font-bold text-light-gray mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link href="/triage/requests/assign">
                      <a className="flex items-center p-3 rounded bg-matrix/10 hover:bg-matrix/20 transition-all duration-200 border border-matrix/40 group w-full">
                        <UserCheck className="text-matrix mr-3 h-5 w-5 group-hover:animate-pulse" />
                        <span className="text-light-gray font-mono text-sm">Assign Requests</span>
                      </a>
                    </Link>
                    <Link href="/triage/reports/pending">
                      <a className="flex items-center p-3 rounded bg-surface hover:bg-matrix/10 transition-all duration-200 border border-matrix/20 w-full">
                        <FileText className="text-matrix mr-3 h-5 w-5" />
                        <span className="text-light-gray font-mono text-sm">Pending Reports</span>
                      </a>
                    </Link>
                    <Link href="/triage/communications">
                      <a className="flex items-center p-3 rounded bg-surface hover:bg-matrix/10 transition-all duration-200 border border-matrix/20 w-full">
                        <MessageSquare className="text-matrix mr-3 h-5 w-5" />
                        <span className="text-light-gray font-mono text-sm">Messages</span>
                      </a>
                    </Link>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="terminal-card p-6 rounded-lg">
                  <h3 className="text-lg font-mono font-bold text-light-gray mb-4">Performance</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-dim-gray font-mono text-sm">On-time Delivery</span>
                        <span className="text-matrix font-mono text-sm">94%</span>
                      </div>
                      <Progress value={94} className="h-2 bg-surface" indicatorClassName="bg-matrix" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-dim-gray font-mono text-sm">Quality Score</span>
                        <span className="text-matrix font-mono text-sm">96%</span>
                      </div>
                      <Progress value={96} className="h-2 bg-surface" indicatorClassName="bg-matrix" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-dim-gray font-mono text-sm">Team Utilization</span>
                        <span className="text-electric-blue font-mono text-sm">87%</span>
                      </div>
                      <Progress value={87} className="h-2 bg-surface" indicatorClassName="bg-electric-blue" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="pt-6">
            <div className="space-y-6">
              {/* Filters */}
              <div className="terminal-card p-4 rounded-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-matrix" />
                      <span className="text-dim-gray font-mono text-sm">Filters:</span>
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="terminal-input w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-terminal border border-primary/30">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                      <SelectTrigger className="terminal-input w-40">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent className="bg-terminal border border-primary/30">
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-matrix" />
                    <Input
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="terminal-input w-64"
                    />
                  </div>
                </div>
              </div>

              {/* Requests List */}
              <div className="terminal-card p-6 rounded-lg">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-mono font-bold text-light-gray">
                    Triage Requests ({filteredRequests.length})
                  </h3>
                  <Button className="glow-button-secondary">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>

                {requestsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-matrix" />
                  </div>
                ) : requestsError ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-8 w-8 text-alert-red mx-auto mb-2" />
                    <p className="text-alert-red font-mono">Error loading requests</p>
                  </div>
                ) : filteredRequests.length > 0 ? (
                  <div className="space-y-4">
                    {filteredRequests.map((request) => (
                      <div key={request.id} className="border border-matrix/20 rounded-lg p-4 hover:border-matrix/40 transition-all duration-200">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                          <div className="flex-1">
                            <div className="flex items-start space-x-3">
                              <div className="bg-matrix/10 p-2 rounded border border-matrix/30">
                                <Shield className="h-5 w-5 text-matrix" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="text-light-gray font-mono text-sm font-semibold">
                                    #{request.id} - {request.submission.title}
                                  </h4>
                                  <Badge className={`font-mono text-xs ${getStatusColor(request.status)}`}>
                                    {request.status.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                  <Badge className={`font-mono text-xs ${getPriorityColor(request.priority)}`}>
                                    {request.priority.toUpperCase()}
                                  </Badge>
                                </div>
                                <p className="text-dim-gray font-mono text-xs mb-2">
                                  {request.submission.type} • {request.company.companyName}
                                </p>
                                <div className="flex items-center space-x-4 text-dim-gray font-mono text-xs">
                                  <span>Created: {new Date(request.createdAt).toLocaleDateString()}</span>
                                  <span>Due: {new Date(request.estimatedCompletionDate).toLocaleDateString()}</span>
                                  {request.assignedTriager && (
                                    <span>Assigned: {request.assignedTriager.username}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-electric-blue font-mono text-sm">
                              ${(request.cost / 100).toLocaleString()}
                            </span>
                            <div className="flex space-x-2">
                              <Link href={`/triage/requests/${request.id}`}>
                                <Button size="sm" className="glow-button-secondary">
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/triage/communications/${request.id}`}>
                                <Button size="sm" className="glow-button-secondary">
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-dim-gray mx-auto mb-4" />
                    <p className="text-dim-gray font-mono">No triage requests found</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Team Management Tab */}
          <TabsContent value="team" className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="terminal-card p-6 rounded-lg">
                  <h3 className="text-lg font-mono font-bold text-light-gray mb-4">Team Members</h3>
                  <div className="space-y-4">
                    {/* Mock team members */}
                    {[
                      { id: 1, name: "lead_triager", role: "Lead Triager", workload: 8, capacity: 10, rating: 4.9 },
                      { id: 2, name: "senior_triager", role: "Senior Triager", workload: 6, capacity: 8, rating: 4.8 },
                      { id: 3, name: "triager_alice", role: "Triager", workload: 5, capacity: 8, rating: 4.7 },
                      { id: 4, name: "analyst_bob", role: "Security Analyst", workload: 3, capacity: 6, rating: 4.6 }
                    ].map((member) => (
                      <div key={member.id} className="border border-matrix/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-matrix/10 p-2 rounded border border-matrix/30">
                              <UserCheck className="h-5 w-5 text-matrix" />
                            </div>
                            <div>
                              <h4 className="text-light-gray font-mono text-sm font-semibold">{member.name}</h4>
                              <p className="text-dim-gray font-mono text-xs">{member.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-dim-gray font-mono text-xs">Workload</p>
                              <p className="text-light-gray font-mono text-sm">{member.workload}/{member.capacity}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-dim-gray font-mono text-xs">Rating</p>
                              <p className="text-warning-yellow font-mono text-sm flex items-center">
                                <Star className="h-3 w-3 mr-1" />
                                {member.rating}
                              </p>
                            </div>
                            <Progress 
                              value={(member.workload / member.capacity) * 100} 
                              className="w-20 h-2" 
                              indicatorClassName={
                                member.workload / member.capacity > 0.8 ? "bg-alert-red" : 
                                member.workload / member.capacity > 0.6 ? "bg-warning-yellow" : "bg-matrix"
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="terminal-card p-6 rounded-lg">
                  <h3 className="text-lg font-mono font-bold text-light-gray mb-4">Team Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-dim-gray font-mono text-sm">Total Members</span>
                      <span className="text-light-gray font-mono text-sm">4</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dim-gray font-mono text-sm">Available</span>
                      <span className="text-matrix font-mono text-sm">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dim-gray font-mono text-sm">Avg Workload</span>
                      <span className="text-electric-blue font-mono text-sm">68%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dim-gray font-mono text-sm">Team Rating</span>
                      <span className="text-warning-yellow font-mono text-sm flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        4.8
                      </span>
                    </div>
                  </div>
                </div>

                <div className="terminal-card p-6 rounded-lg">
                  <h3 className="text-lg font-mono font-bold text-light-gray mb-4">Actions</h3>
                  <div className="space-y-3">
                    <Button className="w-full glow-button">
                      <Users className="mr-2 h-4 w-4" />
                      Add Team Member
                    </Button>
                    <Button className="w-full glow-button-secondary">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Review
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="terminal-card p-6 rounded-lg">
                <h3 className="text-lg font-mono font-bold text-light-gray mb-4">Request Volume</h3>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart2 className="h-16 w-16 text-matrix mx-auto mb-4" />
                    <p className="text-dim-gray font-mono">Chart visualization would go here</p>
                    <p className="text-dim-gray font-mono text-sm mt-2">Integration with charting library needed</p>
                  </div>
                </div>
              </div>

              <div className="terminal-card p-6 rounded-lg">
                <h3 className="text-lg font-mono font-bold text-light-gray mb-4">Performance Trends</h3>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 text-matrix mx-auto mb-4" />
                    <p className="text-dim-gray font-mono">Performance metrics visualization</p>
                    <p className="text-dim-gray font-mono text-sm mt-2">Real-time analytics dashboard</p>
                  </div>
                </div>
              </div>

              <div className="terminal-card p-6 rounded-lg">
                <h3 className="text-lg font-mono font-bold text-light-gray mb-4">Revenue Analytics</h3>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <DollarSign className="h-16 w-16 text-electric-blue mx-auto mb-4" />
                    <p className="text-dim-gray font-mono">Revenue breakdown and projections</p>
                    <p className="text-dim-gray font-mono text-sm mt-2">Monthly and quarterly analysis</p>
                  </div>
                </div>
              </div>

              <div className="terminal-card p-6 rounded-lg">
                <h3 className="text-lg font-mono font-bold text-light-gray mb-4">Customer Satisfaction</h3>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <Star className="h-16 w-16 text-warning-yellow mx-auto mb-4" />
                    <p className="text-dim-gray font-mono">Satisfaction scores and feedback</p>
                    <p className="text-dim-gray font-mono text-sm mt-2">Customer rating analysis</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
