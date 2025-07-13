
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  Eye,
  Edit,
  UserCheck,
  Filter,
  Search,
  Bell,
  Activity,
  TrendingUp,
  FileText,
  Calendar,
  Tag,
  ChevronRight,
  AlertCircle,
  User,
  Settings
} from "lucide-react";

interface ModerationStats {
  total: number;
  pending: number;
  inReview: number;
  approved: number;
  rejected: number;
  criticalPriority: number;
  highPriority: number;
  avgReviewTime: number;
}

interface ModerationReview {
  id: number;
  submissionId: number;
  submissionTitle: string;
  submissionDescription: string;
  submissionType: string;
  submissionSeverity: string;
  submissionStatus: string;
  submissionUserUsername: string;
  reviewerId: number;
  reviewerUsername: string;
  assignedBy: number;
  assignedByUsername: string;
  status: string;
  priority: string;
  category: string;
  severity: string;
  decision: string;
  decisionReason: string;
  internalNotes: string;
  publicResponse: string;
  estimatedReward: number;
  actualReward: number;
  reviewStarted: string;
  reviewCompleted: string;
  dueDate: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface ModerationComment {
  id: number;
  reviewId: number;
  authorId: number;
  authorUsername: string;
  content: string;
  commentType: string;
  isResolved: boolean;
  resolvedBy: number;
  resolvedAt: string;
  mentions: number[];
  attachments: any[];
  createdAt: string;
  updatedAt: string;
}

interface TeamMember {
  id: number;
  userId: number;
  username: string;
  role: string;
  department: string;
  specializations: string[];
  maxAssignments: number;
  currentAssignments: number;
  isActive: boolean;
}

function ModerationDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedReview, setSelectedReview] = useState<ModerationReview | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    category: "",
    search: ""
  });
  const [newComment, setNewComment] = useState("");
  const [reviewUpdate, setReviewUpdate] = useState({
    status: "",
    priority: "",
    decision: "",
    decisionReason: "",
    internalNotes: "",
    publicResponse: "",
    estimatedReward: 0
  });

  // Fetch moderation stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/moderation/stats"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/moderation/stats");
      return res.json() as Promise<ModerationStats>;
    }
  });

  // Fetch moderation reviews
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["/api/moderation/reviews", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.category) params.append("category", filters.category);
      
      const res = await apiRequest("GET", `/api/moderation/reviews?${params}`);
      return res.json() as Promise<ModerationReview[]>;
    }
  });

  // Fetch team members
  const { data: teamMembers = [], isLoading: teamLoading } = useQuery({
    queryKey: ["/api/moderation/team"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/moderation/team");
      return res.json() as Promise<TeamMember[]>;
    }
  });

  // Fetch available reviewers
  const { data: availableReviewers = [] } = useQuery({
    queryKey: ["/api/moderation/reviewers"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/moderation/reviewers");
      return res.json() as Promise<TeamMember[]>;
    }
  });

  // Fetch comments for selected review
  const { data: comments = [] } = useQuery({
    queryKey: ["/api/moderation/reviews", selectedReview?.id, "comments"],
    queryFn: async () => {
      if (!selectedReview) return [];
      const res = await apiRequest("GET", `/api/moderation/reviews/${selectedReview.id}/comments`);
      return res.json() as Promise<ModerationComment[]>;
    },
    enabled: !!selectedReview
  });

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/moderation/notifications"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/moderation/notifications");
      return res.json();
    }
  });

  // Update review mutation
  const updateReviewMutation = useMutation({
    mutationFn: async (data: { id: number; updates: any }) => {
      const res = await apiRequest("PUT", `/api/moderation/reviews/${data.id}`, data.updates);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Review updated",
        description: "The review has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/moderation/reviews"] });
      setSelectedReview(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update review",
        variant: "destructive"
      });
    }
  });

  // Assign review mutation
  const assignReviewMutation = useMutation({
    mutationFn: async (data: { reviewId: number; reviewerId: number }) => {
      const res = await apiRequest("POST", `/api/moderation/reviews/${data.reviewId}/assign`, {
        reviewerId: data.reviewerId
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Review assigned",
        description: "The review has been assigned successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/moderation/reviews"] });
      setIsAssignDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign review",
        variant: "destructive"
      });
    }
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (data: { reviewId: number; content: string; commentType: string }) => {
      const res = await apiRequest("POST", `/api/moderation/reviews/${data.reviewId}/comments`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/moderation/reviews", selectedReview?.id, "comments"] });
      setNewComment("");
      setIsCommentDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive"
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-500";
      case "assigned": return "bg-blue-500/20 text-blue-500";
      case "in_review": return "bg-purple-500/20 text-purple-500";
      case "approved": return "bg-green-500/20 text-green-500";
      case "rejected": return "bg-red-500/20 text-red-500";
      case "needs_info": return "bg-orange-500/20 text-orange-500";
      default: return "bg-gray-500/20 text-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-green-500/20 text-green-500";
      case "medium": return "bg-yellow-500/20 text-yellow-500";
      case "high": return "bg-orange-500/20 text-orange-500";
      case "critical": return "bg-red-500/20 text-red-500";
      default: return "bg-gray-500/20 text-gray-500";
    }
  };

  const handleUpdateReview = () => {
    if (!selectedReview) return;
    
    updateReviewMutation.mutate({
      id: selectedReview.id,
      updates: reviewUpdate
    });
  };

  const handleAssignReview = (reviewerId: number) => {
    if (!selectedReview) return;
    
    assignReviewMutation.mutate({
      reviewId: selectedReview.id,
      reviewerId
    });
  };

  const handleAddComment = () => {
    if (!selectedReview || !newComment.trim()) return;
    
    addCommentMutation.mutate({
      reviewId: selectedReview.id,
      content: newComment,
      commentType: "internal"
    });
  };

  const filteredReviews = reviews.filter(review => {
    if (filters.search && !review.submissionTitle.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-terminal text-matrix">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Moderation Dashboard</h1>
          <p className="text-matrix/80">
            Review and manage vulnerability submissions
          </p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="terminal-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                  <FileText className="h-4 w-4 text-matrix" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    All time reviews
                  </p>
                </CardContent>
              </Card>

              <Card className="terminal-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-matrix" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.pending || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting review
                  </p>
                </CardContent>
              </Card>

              <Card className="terminal-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Review</CardTitle>
                  <Activity className="h-4 w-4 text-matrix" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.inReview || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently being reviewed
                  </p>
                </CardContent>
              </Card>

              <Card className="terminal-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Critical Priority</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-matrix" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.criticalPriority || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Need immediate attention
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="terminal-card">
                <CardHeader>
                  <CardTitle>Recent Reviews</CardTitle>
                  <CardDescription>Latest vulnerability reviews</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredReviews.slice(0, 5).map((review) => (
                      <div key={review.id} className="flex items-center justify-between p-3 rounded-lg bg-terminal/50 border border-matrix/20">
                        <div className="flex-1">
                          <p className="font-medium">{review.submissionTitle}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`text-xs ${getStatusColor(review.status)}`}>
                              {review.status}
                            </Badge>
                            <Badge className={`text-xs ${getPriorityColor(review.priority)}`}>
                              {review.priority}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedReview(review)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="terminal-card">
                <CardHeader>
                  <CardTitle>Team Performance</CardTitle>
                  <CardDescription>Current team workload</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamMembers.slice(0, 5).map((member) => (
                      <div key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-matrix" />
                          <span className="text-sm">{member.username}</span>
                          <Badge variant="outline" className="text-xs">
                            {member.role}
                          </Badge>
                        </div>
                        <div className="text-sm">
                          {member.currentAssignments}/{member.maxAssignments}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Vulnerability Reviews</h2>
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-matrix" />
                  <Input
                    placeholder="Search reviews..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-64"
                  />
                </div>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {reviewsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-matrix mx-auto"></div>
                  <p className="mt-2 text-matrix/80">Loading reviews...</p>
                </div>
              ) : filteredReviews.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-matrix/50 mx-auto mb-4" />
                  <p className="text-matrix/80">No reviews found</p>
                </div>
              ) : (
                filteredReviews.map((review) => (
                  <Card key={review.id} className="terminal-card">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{review.submissionTitle}</h3>
                          <p className="text-sm text-matrix/80 mt-1">{review.submissionDescription}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={`${getStatusColor(review.status)}`}>
                            {review.status}
                          </Badge>
                          <Badge className={`${getPriorityColor(review.priority)}`}>
                            {review.priority}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-matrix/60">Researcher:</span>
                          <p className="font-medium">{review.submissionUserUsername}</p>
                        </div>
                        <div>
                          <span className="text-matrix/60">Type:</span>
                          <p className="font-medium">{review.submissionType}</p>
                        </div>
                        <div>
                          <span className="text-matrix/60">Severity:</span>
                          <p className="font-medium">{review.submissionSeverity}</p>
                        </div>
                        <div>
                          <span className="text-matrix/60">Reviewer:</span>
                          <p className="font-medium">{review.reviewerUsername || "Unassigned"}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedReview(review)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedReview(review);
                            setIsAssignDialogOpen(true);
                          }}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Assign
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedReview(review);
                            setIsCommentDialogOpen(true);
                          }}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Comment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Moderation Team</h2>
              <Button className="bg-matrix/20 border-matrix/30 hover:bg-matrix/30">
                <Users className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                <Card key={member.id} className="terminal-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{member.username}</CardTitle>
                      <Badge className={member.isActive ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}>
                        {member.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardDescription>{member.role} • {member.department}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current Load:</span>
                        <span className="font-medium text-matrix">
                          {member.currentAssignments}/{member.maxAssignments}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Specializations:</span>
                        <div className="flex flex-wrap gap-1">
                          {member.specializations.map((spec) => (
                            <Badge key={spec} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Notifications</h2>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            </div>

            <div className="space-y-4">
              {notifications.map((notification: any) => (
                <Card key={notification.id} className="terminal-card">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{notification.title}</h3>
                        <p className="text-sm text-matrix/80 mt-1">{notification.message}</p>
                        <p className="text-xs text-matrix/60 mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={`${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </Badge>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-matrix rounded-full mt-2"></div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="terminal-card">
                <CardHeader>
                  <CardTitle>Review Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Average Review Time</span>
                      <span className="text-sm font-medium text-matrix">
                        {stats?.avgReviewTime ? `${stats.avgReviewTime.toFixed(1)}h` : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Approval Rate</span>
                      <span className="text-sm font-medium text-matrix">
                        {stats?.total ? `${((stats.approved / stats.total) * 100).toFixed(1)}%` : "0%"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Critical Issues</span>
                      <span className="text-sm font-medium text-matrix">{stats?.criticalPriority || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="terminal-card">
                <CardHeader>
                  <CardTitle>Team Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Active Reviewers</span>
                      <span className="text-sm font-medium text-matrix">
                        {teamMembers.filter(m => m.isActive).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Average Workload</span>
                      <span className="text-sm font-medium text-matrix">
                        {teamMembers.length > 0 ? 
                          (teamMembers.reduce((sum, m) => sum + m.currentAssignments, 0) / teamMembers.length).toFixed(1) : 
                          "0"
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Capacity</span>
                      <span className="text-sm font-medium text-matrix">
                        {teamMembers.reduce((sum, m) => sum + m.maxAssignments, 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Review Details Dialog */}
        {selectedReview && (
          <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
            <DialogContent className="terminal-card max-w-4xl">
              <DialogHeader>
                <DialogTitle>Review Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-matrix/80">Title</label>
                    <p className="text-sm">{selectedReview.submissionTitle}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-matrix/80">Status</label>
                    <Select 
                      value={reviewUpdate.status || selectedReview.status} 
                      onValueChange={(value) => setReviewUpdate({...reviewUpdate, status: value})}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="in_review">In Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="needs_info">Needs Info</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-matrix/80">Priority</label>
                    <Select 
                      value={reviewUpdate.priority || selectedReview.priority} 
                      onValueChange={(value) => setReviewUpdate({...reviewUpdate, priority: value})}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-matrix/80">Decision</label>
                    <Select 
                      value={reviewUpdate.decision || selectedReview.decision} 
                      onValueChange={(value) => setReviewUpdate({...reviewUpdate, decision: value})}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accept">Accept</SelectItem>
                        <SelectItem value="reject">Reject</SelectItem>
                        <SelectItem value="duplicate">Duplicate</SelectItem>
                        <SelectItem value="invalid">Invalid</SelectItem>
                        <SelectItem value="needs_clarification">Needs Clarification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-matrix/80">Description</label>
                  <p className="text-sm mt-1">{selectedReview.submissionDescription}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-matrix/80">Internal Notes</label>
                  <Textarea 
                    value={reviewUpdate.internalNotes || selectedReview.internalNotes || ""}
                    onChange={(e) => setReviewUpdate({...reviewUpdate, internalNotes: e.target.value})}
                    placeholder="Add internal notes..."
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-matrix/80">Public Response</label>
                  <Textarea 
                    value={reviewUpdate.publicResponse || selectedReview.publicResponse || ""}
                    onChange={(e) => setReviewUpdate({...reviewUpdate, publicResponse: e.target.value})}
                    placeholder="Public response to researcher..."
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedReview(null)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpdateReview}
                    disabled={updateReviewMutation.isPending}
                    className="bg-matrix/20 border-matrix/30 hover:bg-matrix/30"
                  >
                    {updateReviewMutation.isPending ? "Updating..." : "Update Review"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Assign Review Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="terminal-card">
            <DialogHeader>
              <DialogTitle>Assign Review</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-matrix/80">Select Reviewer</label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {availableReviewers.map((reviewer) => (
                    <Button
                      key={reviewer.id}
                      variant="outline"
                      className="justify-start"
                      onClick={() => handleAssignReview(reviewer.userId)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      {reviewer.username} ({reviewer.currentAssignments}/{reviewer.maxAssignments})
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Comment Dialog */}
        <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
          <DialogContent className="terminal-card">
            <DialogHeader>
              <DialogTitle>Add Comment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-matrix/80">Comment</label>
                <Textarea 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add your comment..."
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCommentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddComment}
                  disabled={addCommentMutation.isPending || !newComment.trim()}
                  className="bg-matrix/20 border-matrix/30 hover:bg-matrix/30"
                >
                  {addCommentMutation.isPending ? "Adding..." : "Add Comment"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default ModerationDashboard;
