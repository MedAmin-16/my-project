
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Bug, Calendar, User, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import Navbar from "@/components/layout/navbar";
import MatrixBackground from "@/components/matrix-background";
import CommentSystem from "@/components/comment-system";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface SubmissionDetail {
  id: number;
  title: string;
  description: string;
  type: string;
  severity: string;
  status: string;
  reward?: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
    userType: string;
  };
  program: {
    id: number;
    name: string;
    company: string;
  };
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "accepted":
      return <CheckCircle className="w-4 h-4" />;
    case "rejected":
      return <XCircle className="w-4 h-4" />;
    case "pending":
      return <Clock className="w-4 h-4" />;
    default:
      return <AlertTriangle className="w-4 h-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "accepted":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "rejected":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "pending":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case "critical":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "high":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "medium":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "low":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
};

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const { data: submission, isLoading, error } = useQuery<SubmissionDetail>({
    queryKey: [`/api/submissions/${id}`],
    queryFn: async () => {
      // Mock submission data
      return {
        id: Number(id),
        title: "SQL Injection in User Authentication System",
        description: `## Vulnerability Description

I discovered a SQL injection vulnerability in the user authentication endpoint that allows an attacker to bypass authentication and gain unauthorized access to user accounts.

## Steps to Reproduce

1. Navigate to the login page at \`/auth/login\`
2. In the username field, enter: \`admin' OR '1'='1' --\`
3. Enter any password
4. Submit the form
5. Observe that authentication is bypassed

## Technical Details

The vulnerability exists in the \`AuthController.login()\` method where user input is directly concatenated into SQL queries without proper sanitization:

\`\`\`sql
SELECT * FROM users WHERE username = '${username}' AND password = '${password}'
\`\`\`

## Impact

This vulnerability allows:
- **Authentication bypass** for any user account
- **Unauthorized access** to sensitive user data
- **Potential data exfiltration** from the users table
- **Account takeover** of administrative accounts

## Recommendation

1. Use parameterized queries or prepared statements
2. Implement input validation and sanitization
3. Use an ORM with built-in SQL injection protection
4. Add rate limiting to authentication endpoints

## Proof of Concept

I can provide a detailed proof of concept demonstrating full account takeover if needed.`,
        type: "SQL Injection",
        severity: "High",
        status: "pending",
        reward: 2500,
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        updatedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        user: {
          id: 1,
          username: "researcher123",
          userType: "hacker"
        },
        program: {
          id: 1,
          name: "SecureBank Web Application",
          company: "SecureBank Corp"
        }
      };
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-deep-black relative">
        <MatrixBackground />
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-terminal rounded"></div>
            <div className="h-64 bg-terminal rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-deep-black relative">
        <MatrixBackground />
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="terminal-card p-8 rounded-lg text-center">
            <AlertTriangle className="w-12 h-12 text-alert-red mx-auto mb-4" />
            <h2 className="text-xl font-mono text-light-gray mb-2">Submission Not Found</h2>
            <p className="text-dim-gray font-mono mb-4">
              The submission you're looking for doesn't exist or you don't have access to it.
            </p>
            <Link href="/dashboard">
              <Button className="glow-button">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground />
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-dim-gray hover:text-light-gray font-mono mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Submission Header */}
            <div className="terminal-card p-6 rounded-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-mono text-light-gray mb-2">{submission.title}</h1>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-dim-gray font-mono">#{submission.id}</span>
                    <Badge className={getStatusColor(submission.status)}>
                      {getStatusIcon(submission.status)}
                      <span className="ml-1 capitalize">{submission.status}</span>
                    </Badge>
                    <Badge className={getSeverityColor(submission.severity)}>
                      {submission.severity}
                    </Badge>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {submission.type}
                    </Badge>
                  </div>
                </div>
                {submission.reward && (
                  <div className="text-right">
                    <div className="text-2xl font-mono text-matrix">${submission.reward}</div>
                    <div className="text-xs text-dim-gray font-mono">Reward</div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 text-sm text-dim-gray font-mono">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{submission.user.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Submitted {formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })}</span>
                </div>
                {submission.updatedAt !== submission.createdAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Updated {formatDistanceToNow(new Date(submission.updatedAt), { addSuffix: true })}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Submission Description */}
            <div className="terminal-card p-6 rounded-lg">
              <h2 className="text-lg font-mono text-light-gray mb-4 flex items-center gap-2">
                <Bug className="w-5 h-5" />
                Vulnerability Report
              </h2>
              <div 
                className="prose prose-invert max-w-none font-mono text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: submission.description
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-light-gray">$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em class="text-matrix">$1</em>')
                    .replace(/`(.*?)`/g, '<code class="bg-terminal/40 px-1 rounded text-matrix">$1</code>')
                    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-terminal/40 p-3 rounded mt-2 mb-2 overflow-x-auto"><code class="text-matrix">$2</code></pre>')
                    .replace(/^## (.*$)/gm, '<h3 class="text-lg font-bold text-light-gray mt-6 mb-3">$1</h3>')
                    .replace(/^### (.*$)/gm, '<h4 class="text-md font-bold text-light-gray mt-4 mb-2">$1</h4>')
                    .replace(/^\- (.*$)/gm, '<li class="ml-4">• $1</li>')
                    .replace(/\n/g, '<br>')
                }}
              />
            </div>

            {/* Comment System */}
            <div className="terminal-card p-6 rounded-lg">
              <CommentSystem 
                submissionId={submission.id} 
                currentUserId={user?.id} 
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Program Info */}
            <div className="terminal-card p-6 rounded-lg">
              <h3 className="text-lg font-mono text-light-gray mb-4">Program</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-dim-gray font-mono">Target Program</div>
                  <div className="text-light-gray font-mono">{submission.program.name}</div>
                </div>
                <div>
                  <div className="text-sm text-dim-gray font-mono">Company</div>
                  <div className="text-light-gray font-mono">{submission.program.company}</div>
                </div>
              </div>
            </div>

            {/* Submission Timeline */}
            <div className="terminal-card p-6 rounded-lg">
              <h3 className="text-lg font-mono text-light-gray mb-4">Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-matrix rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="text-sm text-light-gray font-mono">Submission Created</div>
                    <div className="text-xs text-dim-gray font-mono">
                      {formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                {submission.updatedAt !== submission.createdAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="text-sm text-light-gray font-mono">Last Updated</div>
                      <div className="text-xs text-dim-gray font-mono">
                        {formatDistanceToNow(new Date(submission.updatedAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {user?.id === submission.user.id && (
              <div className="terminal-card p-6 rounded-lg">
                <h3 className="text-lg font-mono text-light-gray mb-4">Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full font-mono">
                    Edit Submission
                  </Button>
                  <Button variant="outline" className="w-full font-mono text-alert-red border-alert-red hover:bg-alert-red/20">
                    Withdraw Submission
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
