import { useState } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { MatrixBackground } from "@/components/matrix-background";
import {
  Search,
  Book,
  Code,
  Terminal,
  FileText,
  Lock,
  ShieldCheck,
  CreditCard,
  Database,
  Globe,
  Activity,
  ChevronRight,
  ExternalLink,
  Copy,
  Laptop,
  Server,
  Zap
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Documentation categories
  const documentationSections = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: <Book className="h-5 w-5 text-matrix" />,
      pages: [
        "Introduction & Overview",
        "Account Setup",
        "Platform Navigation",
        "Understanding Bug Bounty Programs",
        "Researcher Guidelines",
        "Key Terminology"
      ]
    },
    {
      id: "researcher-guides",
      title: "Researcher Guides",
      icon: <Terminal className="h-5 w-5 text-electric-blue" />,
      pages: [
        "Submitting Reports",
        "Report Templates",
        "Severity Classification",
        "Avoiding Duplicate Reports",
        "Communicating with Program Owners",
        "Payment & Rewards"
      ]
    },
    {
      id: "program-owner-guides",
      title: "Program Owner Guides",
      icon: <Lock className="h-5 w-5 text-green-500" />,
      pages: [
        "Creating a Program",
        "Defining Scope",
        "Setting Reward Structures",
        "Triage Process",
        "Response Templates",
        "Program Analytics"
      ]
    },
    {
      id: "api-reference",
      title: "API Reference",
      icon: <Code className="h-5 w-5 text-yellow-400" />,
      pages: [
        "Authentication",
        "Programs API",
        "Reports API",
        "Users API",
        "Webhooks",
        "Rate Limits & Pagination"
      ]
    },
    {
      id: "integrations",
      title: "Integrations",
      icon: <Database className="h-5 w-5 text-purple-400" />,
      pages: [
        "GitHub Integration",
        "Jira Integration",
        "Slack Integration",
        "Microsoft Teams Integration",
        "Custom Webhooks",
        "CI/CD Integration"
      ]
    }
  ];

  // Popular articles
  const popularArticles = [
    "Setting Up Two-Factor Authentication",
    "Understanding Reputation Points",
    "Creating Effective Bug Reports",
    "Program Scope Best Practices",
    "Payment Methods Overview",
    "Using the API to Manage Reports"
  ];

  // Recent updates
  const recentUpdates = [
    {
      title: "API v2.0 Release",
      date: "March 25, 2025",
      description: "New endpoints for analytics, improved rate limits, and enhanced webhook functionality."
    },
    {
      title: "Report Template Updates",
      date: "March 18, 2025",
      description: "New templates for mobile application testing and cloud infrastructure."
    },
    {
      title: "Severity Classification Guide",
      date: "March 10, 2025",
      description: "Updated CVSS scoring guidelines and impact assessment criteria."
    }
  ];

  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground className="opacity-20" />
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-mono font-bold text-matrix mb-4">CyberHunt Documentation</h1>
          <p className="text-dim-gray mb-6 max-w-3xl mx-auto">
            Comprehensive guides, API references, and best practices for using the CyberHunt platform
            as a security researcher or program owner.
          </p>
          
          <div className="max-w-xl mx-auto relative">
            <Input
              type="text"
              placeholder="Search documentation..."
              className="bg-dark-terminal border-matrix/30 pl-10 h-12 font-mono"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-dim-gray pointer-events-none" />
          </div>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="terminal-card p-5 rounded-lg sticky top-24">
              {/* Navigation Menu */}
              <h2 className="text-xl font-mono font-bold text-matrix mb-4">Documentation</h2>
              
              <Accordion type="single" collapsible className="w-full mb-6">
                {documentationSections.map((section) => (
                  <AccordionItem key={section.id} value={section.id} className="border-b border-matrix/20 last:border-0">
                    <AccordionTrigger className="text-light-gray hover:text-matrix font-mono py-3">
                      <div className="flex items-center">
                        <div className="mr-3">{section.icon}</div>
                        <span>{section.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="pl-8 py-2 space-y-2">
                        {section.pages.map((page, index) => (
                          <li key={index}>
                            <a href="#" className="text-dim-gray hover:text-matrix text-sm flex items-center">
                              <ChevronRight className="h-3 w-3 mr-1" />
                              {page}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              {/* Popular Articles */}
              <div className="mb-6">
                <h3 className="font-mono text-light-gray text-lg mb-3">Popular Articles</h3>
                <ul className="space-y-2">
                  {popularArticles.map((article, index) => (
                    <li key={index}>
                      <a href="#" className="text-dim-gray hover:text-matrix text-sm flex items-center">
                        <Activity className="h-3.5 w-3.5 mr-2 text-matrix" />
                        {article}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Recent Updates */}
              <div>
                <h3 className="font-mono text-light-gray text-lg mb-3">Recent Updates</h3>
                <div className="space-y-3">
                  {recentUpdates.map((update, index) => (
                    <div key={index} className="border-b border-matrix/20 last:border-0 pb-3 last:pb-0">
                      <h4 className="text-light-gray text-sm font-mono">{update.title}</h4>
                      <p className="text-xs text-dim-gray mb-1">{update.date}</p>
                      <p className="text-xs text-dim-gray">{update.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Documentation Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="terminal-card p-6 rounded-lg mb-8">
              <h2 className="text-2xl font-mono font-bold text-matrix mb-6">Introduction to CyberHunt</h2>
              
              <div className="prose prose-sm prose-invert max-w-none">
                <p className="text-dim-gray">
                  CyberHunt is a modern bug bounty platform designed to connect security researchers with organizations 
                  seeking to improve their security posture. Our platform provides tools, resources, and infrastructure 
                  to facilitate the discovery, reporting, and remediation of security vulnerabilities.
                </p>
                
                <h3 className="text-xl font-mono text-light-gray mt-6 mb-3">Key Features</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="border border-matrix/30 rounded-lg p-4 bg-terminal/50">
                    <div className="flex items-center mb-2">
                      <ShieldCheck className="h-5 w-5 text-matrix mr-2" />
                      <h4 className="text-light-gray font-mono">Vulnerability Reporting</h4>
                    </div>
                    <p className="text-dim-gray text-sm">
                      Structured templates and workflows for submitting, triaging, and managing security vulnerabilities.
                    </p>
                  </div>
                  
                  <div className="border border-matrix/30 rounded-lg p-4 bg-terminal/50">
                    <div className="flex items-center mb-2">
                      <CreditCard className="h-5 w-5 text-electric-blue mr-2" />
                      <h4 className="text-light-gray font-mono">Rewards & Payments</h4>
                    </div>
                    <p className="text-dim-gray text-sm">
                      Flexible bounty structures and secure payment processing for vulnerability discoveries.
                    </p>
                  </div>
                  
                  <div className="border border-matrix/30 rounded-lg p-4 bg-terminal/50">
                    <div className="flex items-center mb-2">
                      <Globe className="h-5 w-5 text-green-500 mr-2" />
                      <h4 className="text-light-gray font-mono">Program Management</h4>
                    </div>
                    <p className="text-dim-gray text-sm">
                      Tools for organizations to define scope, set rules, and manage security testing programs.
                    </p>
                  </div>
                  
                  <div className="border border-matrix/30 rounded-lg p-4 bg-terminal/50">
                    <div className="flex items-center mb-2">
                      <Terminal className="h-5 w-5 text-yellow-400 mr-2" />
                      <h4 className="text-light-gray font-mono">Researcher Tools</h4>
                    </div>
                    <p className="text-dim-gray text-sm">
                      Resources, guides, and assistance for security researchers at all experience levels.
                    </p>
                  </div>
                </div>
                
                <h3 className="text-xl font-mono text-light-gray mt-6 mb-3">Getting Started</h3>
                
                <p className="text-dim-gray mb-4">
                  Whether you're a security researcher looking to find and report vulnerabilities or an organization 
                  wanting to establish a bug bounty program, this documentation will help you get started with CyberHunt.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a href="#" className="border border-matrix/30 rounded-lg p-4 bg-terminal/50 hover:bg-matrix/5 transition duration-200">
                    <div className="flex items-center mb-2">
                      <Laptop className="h-5 w-5 text-matrix mr-2" />
                      <h4 className="text-light-gray font-mono">Researcher Guide</h4>
                    </div>
                    <p className="text-dim-gray text-sm">
                      Learn how to find vulnerabilities, submit reports, and earn bounties as a security researcher.
                    </p>
                  </a>
                  
                  <a href="#" className="border border-matrix/30 rounded-lg p-4 bg-terminal/50 hover:bg-matrix/5 transition duration-200">
                    <div className="flex items-center mb-2">
                      <Server className="h-5 w-5 text-electric-blue mr-2" />
                      <h4 className="text-light-gray font-mono">Program Owner Guide</h4>
                    </div>
                    <p className="text-dim-gray text-sm">
                      Set up and manage an effective bug bounty program for your organization.
                    </p>
                  </a>
                </div>
              </div>
            </div>
            
            {/* API Quick Reference */}
            <div className="terminal-card p-6 rounded-lg mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-mono font-bold text-matrix">API Quick Reference</h2>
                <a href="#" className="text-matrix hover:text-matrix-dark text-sm font-mono flex items-center">
                  Full API Docs <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </div>
              
              <Tabs defaultValue="authentication">
                <TabsList className="bg-transparent h-auto p-0 border-b border-matrix/20 w-full justify-start space-x-6 mb-4">
                  <TabsTrigger 
                    value="authentication" 
                    className="px-0 py-3 bg-transparent text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-matrix data-[state=active]:text-matrix text-dim-gray h-auto"
                  >
                    Authentication
                  </TabsTrigger>
                  <TabsTrigger 
                    value="programs" 
                    className="px-0 py-3 bg-transparent text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-matrix data-[state=active]:text-matrix text-dim-gray h-auto"
                  >
                    Programs
                  </TabsTrigger>
                  <TabsTrigger 
                    value="reports" 
                    className="px-0 py-3 bg-transparent text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-matrix data-[state=active]:text-matrix text-dim-gray h-auto"
                  >
                    Reports
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="authentication" className="p-0 mt-0">
                  <div className="bg-terminal rounded-lg border border-matrix/20 p-4 mb-4 relative">
                    <button className="absolute top-2 right-2 text-dim-gray hover:text-matrix">
                      <Copy className="h-4 w-4" />
                    </button>
                    <pre className="text-xs text-light-gray font-mono whitespace-pre overflow-x-auto">
{`curl -X POST https://api.cyberhunt.com/v1/auth/token \\
  -H "Content-Type: application/json" \\
  -d '{"api_key": "YOUR_API_KEY", "api_secret": "YOUR_API_SECRET"}'`}
                    </pre>
                  </div>
                  
                  <p className="text-dim-gray text-sm mb-4">
                    All API requests must include an authorization token. You can generate an API key and secret from your 
                    account settings page. The token returned from this endpoint should be included in the Authorization 
                    header of all subsequent requests.
                  </p>
                  
                  <div className="bg-terminal rounded-lg border border-matrix/20 p-4 relative">
                    <button className="absolute top-2 right-2 text-dim-gray hover:text-matrix">
                      <Copy className="h-4 w-4" />
                    </button>
                    <pre className="text-xs text-light-gray font-mono whitespace-pre overflow-x-auto">
{`// Example Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2025-04-29T00:00:00Z"
}`}
                    </pre>
                  </div>
                </TabsContent>
                
                <TabsContent value="programs" className="p-0 mt-0">
                  <div className="bg-terminal rounded-lg border border-matrix/20 p-4 mb-4 relative">
                    <button className="absolute top-2 right-2 text-dim-gray hover:text-matrix">
                      <Copy className="h-4 w-4" />
                    </button>
                    <pre className="text-xs text-light-gray font-mono whitespace-pre overflow-x-auto">
{`# List all public programs
curl -X GET https://api.cyberhunt.com/v1/programs \\
  -H "Authorization: Bearer YOUR_TOKEN"

# Get a specific program
curl -X GET https://api.cyberhunt.com/v1/programs/123 \\
  -H "Authorization: Bearer YOUR_TOKEN"`}
                    </pre>
                  </div>
                  
                  <p className="text-dim-gray text-sm mb-4">
                    The Programs API allows you to list and retrieve details about bug bounty programs. For 
                    organization accounts, additional endpoints are available for creating and managing programs.
                  </p>
                  
                  <div className="bg-terminal rounded-lg border border-matrix/20 p-4 relative">
                    <button className="absolute top-2 right-2 text-dim-gray hover:text-matrix">
                      <Copy className="h-4 w-4" />
                    </button>
                    <pre className="text-xs text-light-gray font-mono whitespace-pre overflow-x-auto">
{`// Example Program Object
{
  "id": 123,
  "name": "SecureCorp Bug Bounty",
  "description": "Find vulnerabilities in our web application.",
  "scope": ["https://securecorp.com"],
  "rewards": {
    "low": "100-200",
    "medium": "200-500",
    "high": "500-1000",
    "critical": "1000-5000"
  },
  "status": "active",
  "created_at": "2025-01-15T00:00:00Z"
}`}
                    </pre>
                  </div>
                </TabsContent>
                
                <TabsContent value="reports" className="p-0 mt-0">
                  <div className="bg-terminal rounded-lg border border-matrix/20 p-4 mb-4 relative">
                    <button className="absolute top-2 right-2 text-dim-gray hover:text-matrix">
                      <Copy className="h-4 w-4" />
                    </button>
                    <pre className="text-xs text-light-gray font-mono whitespace-pre overflow-x-auto">
{`# Submit a new report
curl -X POST https://api.cyberhunt.com/v1/reports \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "program_id": 123,
    "title": "XSS in Search Function",
    "description": "...",
    "severity": "high",
    "steps_to_reproduce": "..."
  }'`}
                    </pre>
                  </div>
                  
                  <p className="text-dim-gray text-sm mb-4">
                    The Reports API allows researchers to submit and manage vulnerability reports. Program owners 
                    can use this API to retrieve, update, and triage reports for their programs.
                  </p>
                  
                  <div className="bg-terminal rounded-lg border border-matrix/20 p-4 relative">
                    <button className="absolute top-2 right-2 text-dim-gray hover:text-matrix">
                      <Copy className="h-4 w-4" />
                    </button>
                    <pre className="text-xs text-light-gray font-mono whitespace-pre overflow-x-auto">
{`// Example Report Object
{
  "id": 456,
  "program_id": 123,
  "title": "XSS in Search Function",
  "description": "...",
  "severity": "high",
  "status": "pending",
  "submitted_at": "2025-03-28T12:34:56Z",
  "last_updated_at": "2025-03-28T12:34:56Z"
}`}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Learning Paths */}
            <div className="terminal-card p-6 rounded-lg mb-8">
              <h2 className="text-2xl font-mono font-bold text-matrix mb-6">Documentation Learning Paths</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-matrix/30 rounded-lg p-5 hover:bg-matrix/5 transition duration-200">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-md bg-terminal p-2 mr-4 border border-matrix/30 flex items-center justify-center">
                      <Terminal className="h-5 w-5 text-matrix" />
                    </div>
                    <h3 className="text-lg font-mono text-light-gray">Beginner Researcher</h3>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center">
                      <div className="h-5 w-5 rounded-full border border-matrix/50 flex items-center justify-center mr-2">
                        <div className="h-2.5 w-2.5 bg-matrix rounded-full"></div>
                      </div>
                      <p className="text-sm text-dim-gray">Account Setup & Verification</p>
                    </div>
                    <div className="flex items-center">
                      <div className="h-5 w-5 rounded-full border border-matrix/50 flex items-center justify-center mr-2">
                        <div className="h-2.5 w-2.5 bg-matrix rounded-full"></div>
                      </div>
                      <p className="text-sm text-dim-gray">Understanding Vulnerability Types</p>
                    </div>
                    <div className="flex items-center">
                      <div className="h-5 w-5 rounded-full border border-matrix/50 flex items-center justify-center mr-2">
                        <div className="h-2.5 w-2.5 bg-matrix rounded-full"></div>
                      </div>
                      <p className="text-sm text-dim-gray">Creating Your First Report</p>
                    </div>
                    <div className="flex items-center">
                      <div className="h-5 w-5 rounded-full border border-matrix/50 flex items-center justify-center mr-2">
                        <div className="h-2.5 w-2.5 bg-matrix rounded-full"></div>
                      </div>
                      <p className="text-sm text-dim-gray">Navigating the Payment System</p>
                    </div>
                  </div>
                  
                  <a href="#" className="text-matrix hover:text-matrix-dark text-sm font-mono flex items-center">
                    Start This Path <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </div>
                
                <div className="border border-matrix/30 rounded-lg p-5 hover:bg-matrix/5 transition duration-200">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-md bg-terminal p-2 mr-4 border border-matrix/30 flex items-center justify-center">
                      <Server className="h-5 w-5 text-electric-blue" />
                    </div>
                    <h3 className="text-lg font-mono text-light-gray">Program Owner</h3>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center">
                      <div className="h-5 w-5 rounded-full border border-matrix/50 flex items-center justify-center mr-2">
                        <div className="h-2.5 w-2.5 bg-electric-blue rounded-full"></div>
                      </div>
                      <p className="text-sm text-dim-gray">Creating Your Organization</p>
                    </div>
                    <div className="flex items-center">
                      <div className="h-5 w-5 rounded-full border border-matrix/50 flex items-center justify-center mr-2">
                        <div className="h-2.5 w-2.5 bg-electric-blue rounded-full"></div>
                      </div>
                      <p className="text-sm text-dim-gray">Setting Up Your First Program</p>
                    </div>
                    <div className="flex items-center">
                      <div className="h-5 w-5 rounded-full border border-matrix/50 flex items-center justify-center mr-2">
                        <div className="h-2.5 w-2.5 bg-electric-blue rounded-full"></div>
                      </div>
                      <p className="text-sm text-dim-gray">Triaging & Responding to Reports</p>
                    </div>
                    <div className="flex items-center">
                      <div className="h-5 w-5 rounded-full border border-matrix/50 flex items-center justify-center mr-2">
                        <div className="h-2.5 w-2.5 bg-electric-blue rounded-full"></div>
                      </div>
                      <p className="text-sm text-dim-gray">Managing Bounty Payments</p>
                    </div>
                  </div>
                  
                  <a href="#" className="text-electric-blue hover:text-blue-400 text-sm font-mono flex items-center">
                    Start This Path <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </div>
                
                <div className="border border-matrix/30 rounded-lg p-5 hover:bg-matrix/5 transition duration-200">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-md bg-terminal p-2 mr-4 border border-matrix/30 flex items-center justify-center">
                      <Code className="h-5 w-5 text-green-500" />
                    </div>
                    <h3 className="text-lg font-mono text-light-gray">API Integration</h3>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center">
                      <div className="h-5 w-5 rounded-full border border-matrix/50 flex items-center justify-center mr-2">
                        <div className="h-2.5 w-2.5 bg-green-500 rounded-full"></div>
                      </div>
                      <p className="text-sm text-dim-gray">Authentication & Access Keys</p>
                    </div>
                    <div className="flex items-center">
                      <div className="h-5 w-5 rounded-full border border-matrix/50 flex items-center justify-center mr-2">
                        <div className="h-2.5 w-2.5 bg-green-500 rounded-full"></div>
                      </div>
                      <p className="text-sm text-dim-gray">Core API Endpoints</p>
                    </div>
                    <div className="flex items-center">
                      <div className="h-5 w-5 rounded-full border border-matrix/50 flex items-center justify-center mr-2">
                        <div className="h-2.5 w-2.5 bg-green-500 rounded-full"></div>
                      </div>
                      <p className="text-sm text-dim-gray">Webhook Implementation</p>
                    </div>
                    <div className="flex items-center">
                      <div className="h-5 w-5 rounded-full border border-matrix/50 flex items-center justify-center mr-2">
                        <div className="h-2.5 w-2.5 bg-green-500 rounded-full"></div>
                      </div>
                      <p className="text-sm text-dim-gray">Custom Integration Examples</p>
                    </div>
                  </div>
                  
                  <a href="#" className="text-green-500 hover:text-green-400 text-sm font-mono flex items-center">
                    Start This Path <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </div>
                
                <div className="border border-matrix/30 rounded-lg p-5 hover:bg-matrix/5 transition duration-200">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-md bg-terminal p-2 mr-4 border border-matrix/30 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-yellow-400" />
                    </div>
                    <h3 className="text-lg font-mono text-light-gray">Advanced Features</h3>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center">
                      <div className="h-5 w-5 rounded-full border border-matrix/50 flex items-center justify-center mr-2">
                        <div className="h-2.5 w-2.5 bg-yellow-400 rounded-full"></div>
                      </div>
                      <p className="text-sm text-dim-gray">Custom Workflows</p>
                    </div>
                    <div className="flex items-center">
                      <div className="h-5 w-5 rounded-full border border-matrix/50 flex items-center justify-center mr-2">
                        <div className="h-2.5 w-2.5 bg-yellow-400 rounded-full"></div>
                      </div>
                      <p className="text-sm text-dim-gray">Advanced Analytics</p>
                    </div>
                    <div className="flex items-center">
                      <div className="h-5 w-5 rounded-full border border-matrix/50 flex items-center justify-center mr-2">
                        <div className="h-2.5 w-2.5 bg-yellow-400 rounded-full"></div>
                      </div>
                      <p className="text-sm text-dim-gray">Team Collaboration</p>
                    </div>
                    <div className="flex items-center">
                      <div className="h-5 w-5 rounded-full border border-matrix/50 flex items-center justify-center mr-2">
                        <div className="h-2.5 w-2.5 bg-yellow-400 rounded-full"></div>
                      </div>
                      <p className="text-sm text-dim-gray">Custom Reward Rules</p>
                    </div>
                  </div>
                  
                  <a href="#" className="text-yellow-400 hover:text-yellow-300 text-sm font-mono flex items-center">
                    Start This Path <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
            
            {/* Documentation Feedback */}
            <div className="terminal-card p-6 rounded-lg text-center">
              <h2 className="text-xl font-mono font-bold text-matrix mb-3">Documentation Feedback</h2>
              <p className="text-dim-gray mb-6 max-w-xl mx-auto">
                Was this documentation helpful? Let us know if you have suggestions for improvements or find any issues.
              </p>
              
              <div className="flex justify-center space-x-4">
                <Button variant="outline" className="border-matrix text-matrix hover:bg-matrix/10">
                  <FileText className="mr-2 h-4 w-4" />
                  Report Issue
                </Button>
                <Button variant="outline" className="border-matrix text-matrix hover:bg-matrix/10">
                  <Book className="mr-2 h-4 w-4" />
                  Suggest Edit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}