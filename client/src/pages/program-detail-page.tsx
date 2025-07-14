import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, Shield, ExternalLink, CalendarDays, 
  Award, Tag, Info, Download, FileText, AlertTriangle,
  Loader2, CheckCircle, BadgeCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Program, Submission } from '@shared/schema';
import { Navbar } from '@/components/layout/navbar';
import { MatrixBackground } from '@/components/matrix-background';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export default function ProgramDetailPage() {
  const { id } = useParams();
  const programId = parseInt(id);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch program details
  const { 
    data: program,
    isLoading: isProgramLoading,
    error: programError
  } = useQuery<Program>({ 
    queryKey: ['/api/programs', programId],
    queryFn: () => fetch(`/api/programs/${programId}`).then(res => {
      if (!res.ok) throw new Error('Failed to load program');
      return res.json();
    }),
    enabled: !isNaN(programId)
  });

  // Fetch submissions for this program
  const {
    data: submissions,
    isLoading: isSubmissionsLoading,
  } = useQuery<Submission[]>({
    queryKey: ['/api/submissions/program', programId],
    queryFn: () => fetch(`/api/submissions/program/${programId}`).then(res => {
      if (!res.ok) throw new Error('Failed to load submissions');
      return res.json();
    }),
    enabled: !isNaN(programId) && user !== null
  });

  // Handle submission status badge color
  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'accepted': return 'text-green-500 bg-green-900/20';
      case 'pending': return 'text-yellow-500 bg-yellow-900/20';
      case 'rejected': return 'text-red-500 bg-red-900/20';
      case 'fixed': return 'text-blue-500 bg-blue-900/20';
      default: return 'text-gray-400 bg-gray-800/20';
    }
  };

  // Handle submit button click
  const handleSubmitClick = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit a bug report",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    navigate(`/submit-bug?programId=${programId}`);
  };

  if (isProgramLoading) {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-matrix" />
      </div>
    );
  }

  if (programError || !program) {
    return (
      <div className="min-h-screen bg-deep-black flex flex-col items-center justify-center p-4">
        <AlertTriangle className="h-16 w-16 text-alert-red mb-4" />
        <h2 className="text-xl text-alert-red mb-2 text-center">Program not found</h2>
        <p className="text-dim-gray text-center mb-6">The requested program does not exist or could not be loaded.</p>
        <Button variant="matrix" onClick={() => navigate('/programs')}>
          Back to Programs
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground className="opacity-20" />
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-10 relative z-10">
        {/* Back button */}
        <button 
          onClick={() => navigate('/programs')} 
          className="inline-flex items-center text-dim-gray hover:text-matrix transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Programs
        </button>
        
        {/* Program header */}
        <div className="terminal-card p-6 rounded-lg mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0 h-20 w-20 flex items-center justify-center bg-matrix/10 rounded-xl">
              {program.logo ? (
                <img src={program.logo} alt={`${program.name} logo`} className="h-16 w-16 object-contain" />
              ) : (
                <Shield className="h-10 w-10 text-matrix" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-mono text-matrix mb-1">{program.name}</h1>
                  <p className="text-dim-gray text-lg">{program.company}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded text-sm ${program.status === 'active' ? 'bg-green-900/20 text-green-500' : 'bg-gray-800/20 text-gray-400'}`}>
                    {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
                  </span>
                  
                  <Button variant="matrix" onClick={handleSubmitClick}>
                    Submit a Bug
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="inline-flex items-center text-dim-gray text-sm">
                  <Award className="h-4 w-4 mr-2 text-electric-blue" />
                  <span>Rewards: {program.rewardsRange}</span>
                </div>
                
                <div className="inline-flex items-center text-dim-gray text-sm">
                  <CalendarDays className="h-4 w-4 mr-2 text-electric-blue" />
                  <span>Created: {new Date(program.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Program content tabs */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
          <TabsList className="w-full border-b border-dark-terminal mb-6 bg-transparent h-auto p-0 justify-start">
            <TabsTrigger 
              value="overview" 
              className={`px-4 py-2 ${activeTab === 'overview' ? 'border-b-2 border-matrix text-matrix' : 'text-dim-gray'}`}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="scope" 
              className={`px-4 py-2 ${activeTab === 'scope' ? 'border-b-2 border-matrix text-matrix' : 'text-dim-gray'}`}
            >
              Scope
            </TabsTrigger>
            <TabsTrigger 
              value="submissions" 
              className={`px-4 py-2 ${activeTab === 'submissions' ? 'border-b-2 border-matrix text-matrix' : 'text-dim-gray'}`}
            >
              Your Submissions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="p-0 mt-0">
            <div className="space-y-8">
              <div className="terminal-card p-6 rounded-lg">
                <h2 className="text-xl font-mono text-matrix mb-4">Program Description</h2>
                <p className="text-dim-gray whitespace-pre-line">{program.description}</p>
              </div>
              
              <div className="terminal-card p-6 rounded-lg">
                <h2 className="text-xl font-mono text-matrix mb-4">Rewards</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-matrix mb-2 font-mono">Reward Range</h3>
                    <p className="text-dim-gray mb-1">{program.rewardsRange}</p>
                    <p className="text-dim-gray text-sm">Rewards are determined based on the severity and impact of the vulnerability.</p>
                  </div>
                  <div>
                    <h3 className="text-matrix mb-2 font-mono">Eligibility</h3>
                    <p className="text-dim-gray mb-1">All verified security researchers</p>
                    <p className="text-dim-gray text-sm">Make sure to follow the submission guidelines for proper evaluation.</p>
                  </div>
                </div>
              </div>
              
              <div className="terminal-card p-6 rounded-lg">
                <h2 className="text-xl font-mono text-matrix mb-4">Rules</h2>
                <ul className="space-y-3 text-dim-gray list-disc pl-5">
                  <li>Do not perform testing that could harm the integrity or availability of the systems</li>
                  <li>Do not access, modify, or delete data that doesn't belong to your test account</li>
                  <li>Do not perform social engineering or phishing attacks on employees</li>
                  <li>Report vulnerabilities as soon as they are discovered</li>
                  <li>Allow adequate time for remediation before public disclosure</li>
                  <li>Follow responsible disclosure practices</li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="scope" className="p-0 mt-0">
            <div className="terminal-card p-6 rounded-lg">
              <h2 className="text-xl font-mono text-matrix mb-6">In-Scope Assets</h2>
              
              <div className="space-y-6">
                {program.scope && Array.isArray(program.scope) && (program.scope as string[]).map((scope, index) => (
                  <div key={index} className="p-4 border border-dark-terminal rounded-lg">
                    <div className="flex items-center mb-3">
                      <Tag className="h-5 w-5 text-electric-blue mr-2" />
                      <h3 className="text-lg text-matrix">{scope}</h3>
                    </div>
                    <p className="text-dim-gray text-sm">
                      All security vulnerabilities related to {scope.toLowerCase()} are eligible for bounty rewards.
                    </p>
                  </div>
                ))}
                
                {(!program.scope || !Array.isArray(program.scope) || (program.scope as string[]).length === 0) && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Info className="h-10 w-10 text-dim-gray mb-4" />
                    <p className="text-dim-gray text-center">No specific scope information available for this program.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="submissions" className="p-0 mt-0">
            {!user ? (
              <div className="terminal-card p-8 rounded-lg text-center">
                <Shield className="h-12 w-12 text-dim-gray mx-auto mb-4" />
                <h3 className="text-lg text-matrix mb-2">Authentication Required</h3>
                <p className="text-dim-gray mb-4">Please log in to view your submissions for this program.</p>
                <Button variant="matrix" onClick={() => navigate('/auth')}>
                  Log In
                </Button>
              </div>
            ) : isSubmissionsLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-matrix" />
              </div>
            ) : submissions && submissions.length > 0 ? (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div key={submission.id} className="terminal-card p-4 rounded-lg">
                    <div className="flex flex-col md:flex-row justify-between gap-3">
                      <div>
                        <div className="flex items-center mb-2">
                          <FileText className="h-5 w-5 text-electric-blue mr-2" />
                          <h3 className="text-lg text-matrix">{submission.title}</h3>
                        </div>
                        <p className="text-dim-gray text-sm line-clamp-2">{submission.description}</p>
                      </div>
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded text-sm ${getStatusColor(submission.status)}`}>
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </span>
                        <Button 
                          variant="matrix" 
                          size="sm"
                          onClick={() => navigate(`/submissions/${submission.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-3">
                      <span className="inline-flex items-center px-2 py-1 bg-dark-terminal rounded text-xs text-yellow-400">
                        {submission.severity}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 bg-dark-terminal rounded text-xs text-purple-400">
                        {submission.type}
                      </span>
                      {submission.reward && (
                        <span className="inline-flex items-center px-2 py-1 bg-dark-terminal rounded text-xs text-green-400">
                          <Award className="h-3 w-3 mr-1" />
                          ${submission.reward}
                        </span>
                      )}
                      <span className="inline-flex items-center px-2 py-1 bg-dark-terminal rounded text-xs text-dim-gray">
                        <CalendarDays className="h-3 w-3 mr-1" />
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="terminal-card p-8 rounded-lg text-center">
                <Info className="h-12 w-12 text-dim-gray mx-auto mb-4" />
                <h3 className="text-lg text-matrix mb-2">No Submissions Yet</h3>
                <p className="text-dim-gray mb-4">You haven't submitted any bug reports for this program.</p>
                <Button variant="matrix" onClick={handleSubmitClick}>
                  Submit a Bug
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}