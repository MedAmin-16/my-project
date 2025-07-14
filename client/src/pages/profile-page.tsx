import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  User as UserIcon, Award, Calendar,
  Star, CheckCircle, Terminal, Shield,
  BarChart, Activity as ActivityIcon, Loader2, AlertTriangle, 
  Settings as SettingsIcon, Camera
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { User, Submission, Activity as UserActivity } from '@shared/schema';
import { Navbar } from '@/components/layout/navbar';
import { MatrixBackground } from '@/components/matrix-background';

export default function ProfilePage() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const userId = params.id ? parseInt(params.id) : currentUser?.id;

  // Determine if this is the current user's profile
  const isCurrentUser = currentUser && currentUser.id === userId;

  // Fetch user profile
  const {
    data: user,
    isLoading: isUserLoading,
    error: userError
  } = useQuery<User>({
    queryKey: ['/api/user', userId],
    queryFn: () => fetch(isCurrentUser ? '/api/user' : `/api/user/${userId}`).then(res => {
      if (!res.ok) throw new Error('Failed to load user');
      return res.json();
    }),
    enabled: !!userId
  });

  // Fetch user submissions
  const {
    data: submissions,
    isLoading: isSubmissionsLoading,
    error: submissionsError
  } = useQuery<Submission[]>({
    queryKey: ['/api/submissions/user', userId],
    queryFn: () => fetch(`/api/submissions/user/${userId}`).then(res => {
      if (!res.ok) throw new Error('Failed to load submissions');
      return res.json();
    }),
    enabled: !!userId && isCurrentUser
  });

  // Fetch user activities
  const {
    data: activities,
    isLoading: isActivitiesLoading,
    error: activitiesError
  } = useQuery<UserActivity[]>({
    queryKey: ['/api/activities', userId],
    queryFn: () => fetch(`/api/activities?userId=${userId}`).then(res => {
      if (!res.ok) throw new Error('Failed to load activities');
      return res.json();
    }),
    enabled: !!userId && isCurrentUser
  });

  // Calculate statistics
  const getUserStats = () => {
    if (!submissions) return { 
      totalSubmissions: 0, 
      acceptedSubmissions: 0,
      pendingSubmissions: 0,
      rejectedSubmissions: 0,
      totalRewards: 0
    };

    const acceptedSubmissions = submissions.filter(s => s.status === 'accepted' || s.status === 'fixed');
    const pendingSubmissions = submissions.filter(s => s.status === 'pending');
    const rejectedSubmissions = submissions.filter(s => s.status === 'rejected');
    const totalRewards = submissions.reduce((sum, s) => sum + (s.reward || 0), 0);

    return {
      totalSubmissions: submissions.length,
      acceptedSubmissions: acceptedSubmissions.length,
      pendingSubmissions: pendingSubmissions.length,
      rejectedSubmissions: rejectedSubmissions.length,
      totalRewards
    };
  };

  // Get severity distribution
  const getSeverityDistribution = () => {
    if (!submissions || submissions.length === 0) return [];

    const severities: Record<string, number> = {};
    submissions.forEach(s => {
      if (s.severity) {
        severities[s.severity] = (severities[s.severity] || 0) + 1;
      }
    });

    return Object.entries(severities).map(([severity, count]) => ({
      severity,
      count,
      percentage: Math.round((count / submissions.length) * 100)
    })).sort((a, b) => b.count - a.count);
  };

  // Format date
  const formatDate = (dateString: Date | string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get rank color class
  const getRankColor = (rank: string) => {
    switch (rank?.toLowerCase()) {
      case 'elite': return 'text-yellow-400';
      case 'expert': return 'text-green-500';
      case 'advanced': return 'text-blue-400';
      case 'intermediate': return 'text-purple-400';
      case 'novice': return 'text-pink-400';
      default: return 'text-matrix';
    }
  };

  // Loading state
  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-matrix" />
      </div>
    );
  }

  // Error state
  if (userError || !user) {
    return (
      <div className="min-h-screen bg-deep-black flex flex-col items-center justify-center p-4">
        <AlertTriangle className="h-16 w-16 text-alert-red mb-4" />
        <h2 className="text-xl text-alert-red mb-2 text-center">User not found</h2>
        <p className="text-dim-gray text-center mb-6">The requested user profile could not be loaded.</p>
        <Button 
          variant="default" 
          onClick={() => navigate('/dashboard')}
          className="bg-matrix text-black hover:bg-matrix/80"
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const stats = getUserStats();
  const severityDistribution = getSeverityDistribution();

  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground className="opacity-20" />
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        {/* Profile Header */}
        <div className="terminal-card p-6 rounded-lg mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="relative w-24 h-24">
              {user.photoUrl ? (
                <img 
                  src={user.photoUrl} 
                  alt={user.username}
                  className="w-24 h-24 rounded-full object-cover border-2 border-matrix/30"
                />
              ) : (
                <div className="w-24 h-24 bg-dark-terminal rounded-full flex items-center justify-center text-matrix border-2 border-matrix/30">
                  <UserIcon size={40} />
                </div>
              )}
              {isCurrentUser && (
                <label 
                  htmlFor="photo-upload" 
                  className="absolute bottom-0 right-0 bg-matrix text-black p-2 rounded-full cursor-pointer hover:bg-matrix/80"
                >
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const formData = new FormData();
                        formData.append('photo', file);

                        try {
                          const response = await fetch('/api/user/photo', {
                            method: 'POST',
                            credentials: 'include',
                            body: formData
                          });

                          if (response.ok) {
                            const data = await response.json();
                            // Trigger a refetch of user data to get the new photo URL
                            queryClient.invalidateQueries(['/api/user']);
                          }
                        } catch (error) {
                          console.error('Failed to upload photo:', error);
                        }
                      }
                    }}
                  />
                  <Camera className="h-4 w-4" />
                </label>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-mono text-matrix mb-1">
                    {user.username}
                    {user.isEmailVerified && (
                      <CheckCircle className="inline-block ml-2 h-5 w-5 text-green-500" />
                    )}
                  </h1>
                  <p className={`text-lg ${getRankColor(user.rank || 'Newbie')}`}>
                    {user.rank || 'Newbie'} Hacker
                  </p>
                </div>

                {isCurrentUser && (
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/settings')}
                    className="border-dark-terminal text-dim-gray hover:text-matrix hover:bg-dark-terminal"
                  >
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                <div className="inline-flex items-center text-dim-gray text-sm">
                  <Award className="h-4 w-4 mr-2 text-electric-blue" />
                  <span>Reputation: <span className="text-green-500">{user.reputation || 0}</span></span>
                </div>

                <div className="inline-flex items-center text-dim-gray text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-electric-blue" />
                  <span>Joined: {formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full border-b border-dark-terminal mb-6 bg-transparent h-auto p-0 justify-start">
            <TabsTrigger 
              value="overview" 
              className={`px-4 py-2 ${activeTab === 'overview' ? 'border-b-2 border-matrix text-matrix' : 'text-dim-gray'}`}
            >
              Overview
            </TabsTrigger>

            {isCurrentUser && (
              <>
                <TabsTrigger 
                  value="submissions" 
                  className={`px-4 py-2 ${activeTab === 'submissions' ? 'border-b-2 border-matrix text-matrix' : 'text-dim-gray'}`}
                >
                  Submissions
                </TabsTrigger>

                <TabsTrigger 
                  value="activity" 
                  className={`px-4 py-2 ${activeTab === 'activity' ? 'border-b-2 border-matrix text-matrix' : 'text-dim-gray'}`}
                >
                  Activity
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="p-0 mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stats Card */}
              <Card className="terminal-card border-dark-terminal">
                <CardHeader className="pb-2">
                  <CardTitle className="text-matrix flex items-center">
                    <BarChart className="mr-2 h-5 w-5" />
                    Hacker Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-dark-terminal rounded-lg">
                      <p className="text-dim-gray text-sm mb-1">Submissions</p>
                      <p className="text-matrix text-xl">{stats.totalSubmissions}</p>
                    </div>

                    <div className="p-3 bg-dark-terminal rounded-lg">
                      <p className="text-dim-gray text-sm mb-1">Accepted</p>
                      <p className="text-green-500 text-xl">{stats.acceptedSubmissions}</p>
                    </div>

                    <div className="p-3 bg-dark-terminal rounded-lg">
                      <p className="text-dim-gray text-sm mb-1">Pending</p>
                      <p className="text-yellow-500 text-xl">{stats.pendingSubmissions}</p>
                    </div>

                    <div className="p-3 bg-dark-terminal rounded-lg">
                      <p className="text-dim-gray text-sm mb-1">Rejected</p>
                      <p className="text-red-500 text-xl">{stats.rejectedSubmissions}</p>
                    </div>
                  </div>

                  {isCurrentUser && (
                    <div className="mt-4 p-3 bg-dark-terminal rounded-lg">
                      <p className="text-dim-gray text-sm mb-1">Total Rewards</p>
                      <p className="text-yellow-400 text-xl">${stats.totalRewards}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Skills Card */}
              <Card className="terminal-card border-dark-terminal">
                <CardHeader className="pb-2">
                  <CardTitle className="text-matrix flex items-center">
                    <Terminal className="mr-2 h-5 w-5" />
                    Vulnerability Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {severityDistribution.length > 0 ? (
                    <div className="space-y-4">
                      {severityDistribution.map(({ severity, count, percentage }) => (
                        <div key={severity} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-dim-gray text-sm">{severity}</span>
                            <span className="text-dim-gray text-sm">{count} ({percentage}%)</span>
                          </div>
                          <div className="h-2 w-full bg-dark-terminal rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${severity.toLowerCase() === 'critical' ? 'bg-red-500' : 
                                severity.toLowerCase() === 'high' ? 'bg-orange-500' : 
                                severity.toLowerCase() === 'medium' ? 'bg-yellow-500' : 
                                severity.toLowerCase() === 'low' ? 'bg-blue-500' : 'bg-green-500'}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                      <Shield className="h-10 w-10 text-dim-gray mb-3" />
                      <p className="text-dim-gray mb-1">No vulnerability data available</p>
                      {isCurrentUser && (
                        <p className="text-dim-gray text-sm">
                          Start submitting bug reports to build your profile
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Achievements Card */}
              <Card className="terminal-card border-dark-terminal md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-matrix flex items-center">
                    <Star className="mr-2 h-5 w-5" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="terminal-card p-4 rounded-lg flex items-center">
                      <div className="h-10 w-10 bg-dark-terminal rounded-full flex items-center justify-center mr-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-matrix text-sm font-medium">Account Verified</p>
                        <p className="text-dim-gray text-xs">Email verification completed</p>
                      </div>
                    </div>

                    {user.reputation >= 10 && (
                      <div className="terminal-card p-4 rounded-lg flex items-center">
                        <div className="h-10 w-10 bg-dark-terminal rounded-full flex items-center justify-center mr-3">
                          <Terminal className="h-5 w-5 text-electric-blue" />
                        </div>
                        <div>
                          <p className="text-matrix text-sm font-medium">Code Explorer</p>
                          <p className="text-dim-gray text-xs">Reached 10+ reputation points</p>
                        </div>
                      </div>
                    )}

                    {stats.totalSubmissions >= 1 && (
                      <div className="terminal-card p-4 rounded-lg flex items-center">
                        <div className="h-10 w-10 bg-dark-terminal rounded-full flex items-center justify-center mr-3">
                          <Shield className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-matrix text-sm font-medium">Bug Hunter</p>
                          <p className="text-dim-gray text-xs">Submitted first vulnerability</p>
                        </div>
                      </div>
                    )}

                    {stats.acceptedSubmissions >= 1 && (
                      <div className="terminal-card p-4 rounded-lg flex items-center">
                        <div className="h-10 w-10 bg-dark-terminal rounded-full flex items-center justify-center mr-3">
                          <Award className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-matrix text-sm font-medium">First Blood</p>
                          <p className="text-dim-gray text-xs">First accepted vulnerability</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="p-0 mt-0">
            {isSubmissionsLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-matrix" />
              </div>
            ) : submissionsError ? (
              <div className="terminal-card p-8 rounded-lg text-center">
                <AlertTriangle className="h-12 w-12 text-alert-red mx-auto mb-4" />
                <p className="text-alert-red text-lg mb-2">Failed to load submissions</p>
                <p className="text-dim-gray">An error occurred while fetching your submissions.</p>
              </div>
            ) : submissions && submissions.length > 0 ? (
              <div className="space-y-4">
                {submissions.map(submission => (
                  <div key={submission.id} className="terminal-card p-5 rounded-lg">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="mb-4 md:mb-0">
                        <h3 className="text-matrix font-mono text-lg mb-1">
                          {submission.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span 
                            className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                              submission.status === 'accepted' || submission.status === 'fixed' ? 'bg-green-900/20 text-green-500' : 
                              submission.status === 'pending' ? 'bg-yellow-900/20 text-yellow-500' :
                              'bg-red-900/20 text-red-500'
                            }`}
                          >
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                          </span>

                          <span className="inline-flex items-center px-2 py-1 bg-dark-terminal rounded text-xs text-blue-400">
                            {submission.type}
                          </span>

                          <span className="inline-flex items-center px-2 py-1 bg-dark-terminal rounded text-xs text-purple-400">
                            {submission.severity}
                          </span>
                        </div>
                        <p className="text-dim-gray text-sm line-clamp-2">{submission.description}</p>
                      </div>

                      <div className="flex flex-col items-start md:items-end justify-between">
                        <span className="text-dim-gray text-sm">
                          Submitted on {formatDate(submission.createdAt)}
                        </span>

                        {submission.reward && (
                          <span className="inline-flex items-center mt-2 text-yellow-400">
                            <Award className="h-4 w-4 mr-1" />
                            ${submission.reward}
                          </span>
                        )}

                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigate(`/submissions/${submission.id}`)}
                          className="mt-2 border-dark-terminal hover:bg-dark-terminal"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="terminal-card p-8 rounded-lg text-center">
                <Shield className="h-12 w-12 text-dim-gray mx-auto mb-4" />
                <p className="text-matrix text-lg mb-2">No submissions yet</p>
                <p className="text-dim-gray mb-4">You haven't submitted any bug reports yet.</p>
                <Button 
                  variant="default" 
                  onClick={() => navigate('/programs')}
                  className="bg-matrix text-black hover:bg-matrix/80"
                >
                  Browse Programs
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="p-0 mt-0">
            {isActivitiesLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-matrix" />
              </div>
            ) : activitiesError ? (
              <div className="terminal-card p-8 rounded-lg text-center">
                <AlertTriangle className="h-12 w-12 text-alert-red mx-auto mb-4" />
                <p className="text-alert-red text-lg mb-2">Failed to load activities</p>
                <p className="text-dim-gray">An error occurred while fetching your activity history.</p>
              </div>
            ) : activities && activities.length > 0 ? (
              <div className="relative border-l-2 border-dark-terminal ml-4 pl-6 py-2 space-y-8">
                {activities.map(activity => (
                  <div key={activity.id} className="relative">
                    <div className="absolute -left-10 mt-1 h-4 w-4 rounded-full bg-matrix"></div>
                    <div className="terminal-card p-4 rounded-lg">
                      <div className="flex items-start">
                        <div className="h-8 w-8 bg-dark-terminal rounded-full flex items-center justify-center mr-3">
                          <ActivityIcon className="h-4 w-4 text-electric-blue" />
                        </div>
                        <div className="flex-1">
                          <p className="text-matrix">{activity.message}</p>
                          <p className="text-dim-gray text-xs mt-1">
                            {formatDate(activity.createdAt)}
                          </p>
                        </div>
                      </div>
                      {activity.details && (
                        <p className="text-dim-gray text-sm mt-2 pl-11">{activity.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="terminal-card p-8 rounded-lg text-center">
                <ActivityIcon className="h-12 w-12 text-dim-gray mx-auto mb-4" />
                <p className="text-matrix text-lg mb-2">No activity yet</p>
                <p className="text-dim-gray">Start interacting with the platform to see your activity here.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}