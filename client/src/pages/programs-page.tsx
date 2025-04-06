import { useState, useEffect } from "react";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import MatrixBackground from "@/components/matrix-background";
import {
  Search,
  Filter,
  Check,
  Globe,
  Lock,
  AlertTriangle,
  DollarSign,
  ChevronRight,
  Terminal,
  Database,
  Server,
  Shield,
  Laptop,
  Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Program } from "@shared/schema";

// Mock program data for display
const mockPrograms: Program[] = [
  {
    id: 1,
    name: "SecureTech Web Platform",
    description: "Find vulnerabilities in our web application platform serving millions of users. Focus on authentication, authorization, and data protection aspects.",
    type: "web",
    status: "active",
    isPublic: true,
    createdAt: new Date("2025-01-15"),
    rewardRange: "$100 - $10,000",
    logo: "/securetech-logo.png",
    scope: "All web applications under *.securetech.com, excluding marketing subdomains",
    outOfScope: "DOS attacks, physical security, social engineering",
    ownerName: "SecureTech Inc.",
    ownerId: 101,
    minReputation: 0,
    avgResponseTime: "24 hours",
    avgBounty: 750,
    totalBountyPaid: 125000,
    lastUpdated: new Date("2025-03-18"),
    vrt: ["authentication", "authorization", "xss", "injection"],
    updatedAt: new Date("2025-03-18")
  },
  {
    id: 2,
    name: "PaySecure Payment Gateway",
    description: "Our payment processing system handles millions of transactions daily. We're looking for vulnerabilities in our API endpoints, authentication mechanisms, and transaction flows.",
    type: "api",
    status: "active",
    isPublic: true,
    createdAt: new Date("2025-02-01"),
    rewardRange: "$250 - $25,000",
    logo: "/paysecure-logo.png",
    scope: "All API endpoints under api.paysecure.com/v1 and api.paysecure.com/v2",
    outOfScope: "Rate limiting, documentation issues, third-party services",
    ownerName: "PaySecure Financial",
    ownerId: 102,
    minReputation: 500,
    avgResponseTime: "12 hours",
    avgBounty: 1750,
    totalBountyPaid: 250000,
    lastUpdated: new Date("2025-03-10"),
    vrt: ["injection", "authentication", "ratelimit", "businesslogic"],
    updatedAt: new Date("2025-03-10")
  },
  {
    id: 3,
    name: "CloudStack Infrastructure",
    description: "Security assessment of our cloud infrastructure platform. Looking for vulnerabilities in our management console, API endpoints, and service configurations.",
    type: "cloud",
    status: "active",
    isPublic: false,
    createdAt: new Date("2025-02-15"),
    rewardRange: "$500 - $30,000",
    logo: "/cloudstack-logo.png",
    scope: "Management console, API endpoints, terraform providers, container orchestration",
    outOfScope: "Third-party integrations, documentation, client-side applications",
    ownerName: "CloudStack Technologies",
    ownerId: 103,
    minReputation: 1000,
    avgResponseTime: "36 hours",
    avgBounty: 3500,
    totalBountyPaid: 350000,
    lastUpdated: new Date("2025-03-05"),
    vrt: ["configuration", "authentication", "authorization", "ssrf"],
    updatedAt: new Date("2025-03-05")
  },
  {
    id: 4,
    name: "HealthTrack Mobile App",
    description: "Our health tracking mobile application handles sensitive user data. We're interested in discovering security issues in our Android and iOS applications.",
    type: "mobile",
    status: "active",
    isPublic: true,
    createdAt: new Date("2025-03-01"),
    rewardRange: "$150 - $15,000",
    logo: "/healthtrack-logo.png",
    scope: "Android and iOS applications, API communication, local data storage",
    outOfScope: "Server infrastructure, brute force attacks, third-party libraries",
    ownerName: "HealthTrack Solutions",
    ownerId: 104,
    minReputation: 250,
    avgResponseTime: "48 hours",
    avgBounty: 1250,
    totalBountyPaid: 75000,
    lastUpdated: new Date("2025-03-20"),
    vrt: ["storage", "authentication", "sessionmanagement", "datavalidation"],
    updatedAt: new Date("2025-03-20")
  },
  {
    id: 5,
    name: "NetSecure IoT Platform",
    description: "Security testing of our IoT device management platform, including the web dashboard, device APIs, and communication protocols.",
    type: "iot",
    status: "active",
    isPublic: true,
    createdAt: new Date("2025-01-05"),
    rewardRange: "$200 - $20,000",
    logo: "/netsecure-logo.png",
    scope: "Web dashboard, API endpoints, MQTT/CoAP implementations, device communication",
    outOfScope: "Hardware testing, physical device vulnerabilities, third-party cloud services",
    ownerName: "NetSecure Systems",
    ownerId: 105,
    minReputation: 750,
    avgResponseTime: "24 hours",
    avgBounty: 2000,
    totalBountyPaid: 180000,
    lastUpdated: new Date("2025-03-15"),
    vrt: ["authentication", "authorization", "injection", "configuration"],
    updatedAt: new Date("2025-03-15")
  },
  {
    id: 6,
    name: "DataVault Encryption Service",
    description: "Cryptographic assessment of our encryption service that protects sensitive data for enterprises. Focus on key management, encryption algorithms, and secure API communications.",
    type: "crypto",
    status: "active",
    isPublic: false,
    createdAt: new Date("2025-02-20"),
    rewardRange: "$1,000 - $50,000",
    logo: "/datavault-logo.png",
    scope: "Encryption implementation, key management, API endpoints, client SDKs",
    outOfScope: "Documentation, UI/UX issues, performance testing",
    ownerName: "DataVault Security",
    ownerId: 106,
    minReputation: 2000,
    avgResponseTime: "12 hours",
    avgBounty: 5000,
    totalBountyPaid: 400000,
    lastUpdated: new Date("2025-03-25"),
    vrt: ["cryptography", "authentication", "sidechannel", "datavalidation"],
    updatedAt: new Date("2025-03-25")
  }
];

// Program type to icon mapping
const programTypeIcons: Record<string, React.ReactNode> = {
  web: <Globe className="h-6 w-6 text-blue-400" />,
  api: <Terminal className="h-6 w-6 text-green-500" />,
  mobile: <Smartphone className="h-6 w-6 text-purple-400" />,
  cloud: <Database className="h-6 w-6 text-orange-400" />,
  iot: <Server className="h-6 w-6 text-red-400" />,
  crypto: <Shield className="h-6 w-6 text-yellow-400" />,
  network: <Laptop className="h-6 w-6 text-cyan-400" />
};

// Example active company program template
const exampleProgram = {
  id: 1,
  name: "SecureWeb Enterprise Bug Bounty",
  company: "SecureWeb Technologies",
  description: "Help us identify security vulnerabilities in our enterprise web platform. We're particularly interested in authentication bypasses, authorization flaws, and API vulnerabilities.",
  logo: "https://example.com/logo.png",
  status: "active",
  rewardsRange: "$500 - $10,000",
  avgBounty: 2500,
  totalPaid: 150000,
  minReputation: 100,
  scope: {
    domains: [
      "*.secureweb.com",
      "api.secureweb.com",
      "dashboard.secureweb.com"
    ],
    assets: [
      "Web Application",
      "REST APIs",
      "Admin Dashboard",
      "Mobile API Endpoints"
    ],
    exclusions: [
      "*.test.secureweb.com",
      "beta.secureweb.com"
    ]
  },
  vrt: [
    "Authentication",
    "Authorization",
    "Information Disclosure",
    "Code Injection",
    "XSS"
  ],
  rules: [
    "No automated scanning",
    "No DoS testing",
    "Responsible disclosure required",
    "24-hour response time guaranteed"
  ],
  requirements: {
    mustHaveReputation: true,
    requiresInvitation: false,
    requiresKYC: true
  }
};

export default function ProgramsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [rewardRange, setRewardRange] = useState([0, 50000]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("newest");
  
  // Fetch programs data
  const { data: programs = [], isLoading } = useQuery<Program[]>({
    queryKey: ["/api/programs"],
    queryFn: async () => {
      // In a real implementation, this would fetch from the API
      // For now, return the mock data after a small delay to simulate network
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockPrograms;
    }
  });
  
  // Filter and sort programs based on user selections
  const filteredPrograms = programs.filter(program => {
    // Filter by search query
    const matchesSearch = searchQuery === "" || 
      program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by program type
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(program.type);
    
    // Filter by program status
    const matchesStatus = !selectedStatus || program.status === selectedStatus;
    
    // Filter by reward range
    const avgBounty = program.avgBounty;
    const matchesReward = avgBounty >= rewardRange[0] && avgBounty <= rewardRange[50000];
    
    return matchesSearch && matchesType && matchesStatus && matchesReward;
  }).sort((a, b) => {
    // Sort based on selected sort option
    switch(sortBy) {
      case "newest":
        return (new Date(b.createdAt)).getTime() - (new Date(a.createdAt)).getTime();
      case "oldest":
        return (new Date(a.createdAt)).getTime() - (new Date(b.createdAt)).getTime();
      case "highest_bounty":
        return b.avgBounty - a.avgBounty;
      case "most_active":
        return (new Date(b.lastUpdated)).getTime() - (new Date(a.lastUpdated)).getTime();
      default:
        return 0;
    }
  });
  
  const toggleTypeFilter = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };
  
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTypes([]);
    setRewardRange([0, 50000]);
    setSelectedStatus(null);
    setSortBy("newest");
    
    toast({
      title: "Filters cleared",
      description: "All program filters have been reset.",
    });
  };
  
  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground className="opacity-20" />
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-mono font-bold text-matrix mb-4">Bug Bounty Programs</h1>
          <p className="text-dim-gray max-w-3xl">
            Discover security programs from organizations seeking vulnerability reports. 
            Filter by program type, reward range, and more to find the perfect match for your skills.
          </p>
        </div>
        
        {/* Search and Filters */}
        <div className="terminal-card p-6 rounded-lg mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder="Search programs by name, description, or company..."
                className="bg-dark-terminal border-matrix/30 pl-10 h-12 font-mono"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-dim-gray pointer-events-none" />
            </div>
            
            <div className="flex gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-matrix/30 text-light-gray">
                    <Filter className="mr-2 h-4 w-4" />
                    Sort By
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-terminal border-matrix/30">
                  <DropdownMenuItem 
                    className={`text-light-gray hover:text-matrix ${sortBy === 'newest' ? 'bg-matrix/10 text-matrix' : ''}`}
                    onClick={() => setSortBy('newest')}
                  >
                    {sortBy === 'newest' && <Check className="mr-2 h-4 w-4" />}
                    Newest Programs
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={`text-light-gray hover:text-matrix ${sortBy === 'oldest' ? 'bg-matrix/10 text-matrix' : ''}`}
                    onClick={() => setSortBy('oldest')}
                  >
                    {sortBy === 'oldest' && <Check className="mr-2 h-4 w-4" />}
                    Oldest Programs
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={`text-light-gray hover:text-matrix ${sortBy === 'highest_bounty' ? 'bg-matrix/10 text-matrix' : ''}`}
                    onClick={() => setSortBy('highest_bounty')}
                  >
                    {sortBy === 'highest_bounty' && <Check className="mr-2 h-4 w-4" />}
                    Highest Bounties
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={`text-light-gray hover:text-matrix ${sortBy === 'most_active' ? 'bg-matrix/10 text-matrix' : ''}`}
                    onClick={() => setSortBy('most_active')}
                  >
                    {sortBy === 'most_active' && <Check className="mr-2 h-4 w-4" />}
                    Most Recently Updated
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button 
                variant="outline" 
                className="border-matrix/30 text-light-gray"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Program Types */}
            <div>
              <h3 className="text-light-gray font-mono text-sm mb-3">Program Types</h3>
              <div className="flex flex-wrap gap-2">
                {["web", "api", "mobile", "cloud", "iot", "crypto", "network"].map((type) => (
                  <div 
                    key={type}
                    onClick={() => toggleTypeFilter(type)}
                    className={`cursor-pointer px-3 py-2 rounded-md text-xs font-mono flex items-center ${
                      selectedTypes.includes(type) 
                        ? 'bg-matrix/20 text-matrix border border-matrix' 
                        : 'bg-terminal border border-matrix/30 text-dim-gray hover:border-matrix/50'
                    }`}
                  >
                    {selectedTypes.includes(type) && <Check className="mr-1 h-3 w-3" />}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Program Status */}
            <div>
              <h3 className="text-light-gray font-mono text-sm mb-3">Program Status</h3>
              <Select value={selectedStatus || ''} onValueChange={(value) => setSelectedStatus(value || null)}>
                <SelectTrigger className="w-full bg-terminal border-matrix/30 text-light-gray">
                  <SelectValue placeholder="Any Status" />
                </SelectTrigger>
                <SelectContent className="bg-terminal border-matrix/30">
                  <SelectItem value="">Any Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="invited">Invitation Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Program Visibility */}
            <div>
              <h3 className="text-light-gray font-mono text-sm mb-3">Program Visibility</h3>
              <div className="flex gap-2">
                <div className={`cursor-pointer flex-1 px-3 py-2 rounded-md text-xs font-mono flex items-center justify-center ${
                  !selectedStatus || selectedStatus === 'public'
                    ? 'bg-matrix/20 text-matrix border border-matrix' 
                    : 'bg-terminal border border-matrix/30 text-dim-gray hover:border-matrix/50'
                }`}
                  onClick={() => setSelectedStatus('public')}
                >
                  <Globe className="mr-2 h-3 w-3" />
                  Public
                </div>
                <div className={`cursor-pointer flex-1 px-3 py-2 rounded-md text-xs font-mono flex items-center justify-center ${
                  selectedStatus === 'private'
                    ? 'bg-matrix/20 text-matrix border border-matrix' 
                    : 'bg-terminal border border-matrix/30 text-dim-gray hover:border-matrix/50'
                }`}
                  onClick={() => setSelectedStatus('private')}
                >
                  <Lock className="mr-2 h-3 w-3" />
                  Private
                </div>
              </div>
            </div>
            
            {/* Reward Range */}
            <div>
              <div className="flex justify-between mb-2">
                <h3 className="text-light-gray font-mono text-sm">Average Bounty Range</h3>
                <span className="text-dim-gray text-xs">${rewardRange[0]} - ${rewardRange[1]}</span>
              </div>
              <Slider
                defaultValue={[0, 50000]}
                max={50000}
                step={1000}
                value={rewardRange}
                onValueChange={setRewardRange}
                className="my-6"
              />
              <div className="flex justify-between text-xs text-dim-gray">
                <span>$0</span>
                <span>$50,000+</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Programs Listing */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-mono font-bold text-matrix">Available Programs</h2>
          <span className="text-dim-gray text-sm">
            Showing {filteredPrograms.length} of {programs.length} programs
          </span>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="terminal-card rounded-lg h-40 animate-pulse bg-terminal/50"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredPrograms.length > 0 ? (
              filteredPrograms.map((program) => (
                <Card key={program.id} className="bg-terminal border-matrix/30 hover:bg-matrix/5 transition duration-200">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Program Icon/Logo */}
                      <div className="w-full md:w-64 p-6 flex items-center justify-center">
                        <div className="h-20 w-20 rounded-full bg-dark-terminal border border-matrix/30 flex items-center justify-center">
                          {programTypeIcons[program.type] || <Globe className="h-8 w-8 text-matrix" />}
                        </div>
                      </div>
                      
                      {/* Program Details */}
                      <div className="flex-grow p-6 border-t md:border-t-0 md:border-l border-matrix/20">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center">
                              <h3 className="text-xl font-mono font-bold text-light-gray hover:text-matrix">
                                <Link href={`/program/${program.id}`}>
                                  <a>{program.name}</a>
                                </Link>
                              </h3>
                              {!program.isPublic && (
                                <Badge variant="outline" className="ml-2 border-matrix/50 text-matrix">
                                  <Lock className="h-3 w-3 mr-1" />
                                  Private
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-dim-gray">by {program.ownerName}</p>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="flex items-center mb-1">
                              <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                              <span className="text-sm font-mono text-light-gray">{program.rewardRange}</span>
                            </div>
                            {program.minReputation > 0 && (
                              <div className="flex items-center">
                                <AlertTriangle className="h-4 w-4 text-yellow-400 mr-1" />
                                <span className="text-xs text-dim-gray">Min Reputation: {program.minReputation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-dim-gray mb-4 line-clamp-2">
                          {program.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {program.vrt.map((tag, index) => (
                            <Badge key={index} variant="outline" className="bg-matrix/5 text-matrix border-matrix/30">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex flex-wrap justify-between">
                          <div className="flex flex-col text-xs mr-4 mb-2">
                            <span className="text-dim-gray">Average Bounty</span>
                            <span className="text-light-gray font-mono">${program.avgBounty}</span>
                          </div>
                          <div className="flex flex-col text-xs mr-4 mb-2">
                            <span className="text-dim-gray">Total Paid</span>
                            <span className="text-light-gray font-mono">${program.totalBountyPaid.toLocaleString()}</span>
                          </div>
                          <div className="flex flex-col text-xs mr-4 mb-2">
                            <span className="text-dim-gray">Response Time</span>
                            <span className="text-light-gray font-mono">{program.avgResponseTime}</span>
                          </div>
                          <div className="flex flex-col text-xs mb-2">
                            <span className="text-dim-gray">Last Updated</span>
                            <span className="text-light-gray font-mono">
                              {new Date(program.lastUpdated).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <div className="w-full md:w-48 p-6 flex flex-col justify-center items-center border-t md:border-t-0 md:border-l border-matrix/20">
                        <Button className="w-full bg-matrix text-black hover:bg-matrix/80 mb-2">
                          View Program
                        </Button>
                        <div className="text-xs text-dim-gray text-center mt-3">
                          <span className="block">Program Type:</span>
                          <span className="text-light-gray font-mono capitalize">{program.type}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="terminal-card p-8 rounded-lg text-center">
                <h3 className="text-xl font-mono text-light-gray mb-3">No Matching Programs</h3>
                <p className="text-dim-gray mb-6">
                  We couldn't find any programs that match your search criteria. 
                  Try adjusting your filters or search term.
                </p>
                <Button variant="outline" className="border-matrix text-matrix" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Featured Section */}
        <div className="terminal-card p-8 rounded-lg mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-mono font-bold text-matrix mb-4">Want to Launch Your Own Program?</h2>
              <p className="text-dim-gray mb-6">
                Organizations of all sizes can benefit from the power of the security community. 
                Launch your bug bounty program on CyberHunt to identify vulnerabilities before 
                they can be exploited.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  "Access to thousands of skilled security researchers",
                  "Flexible program structures and reward models",
                  "Detailed reporting and vulnerability management",
                  "Expert triage and validation services"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-matrix mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-dim-gray">{item}</span>
                  </li>
                ))}
              </ul>
              <Button className="bg-matrix text-black hover:bg-matrix/80">
                Start a Program
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="bg-terminal/50 rounded-lg p-6 flex items-center justify-center border border-matrix/20">
              <div className="text-center">
                <Shield className="h-16 w-16 text-matrix mx-auto mb-4" />
                <h3 className="text-xl font-mono text-light-gray mb-2">Trusted by Industry Leaders</h3>
                <p className="text-dim-gray mb-4 max-w-xs mx-auto">
                  Join hundreds of organizations that trust CyberHunt for their security needs.
                </p>
                <div className="flex justify-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-dark-terminal flex items-center justify-center border border-matrix/30">
                    <span className="text-matrix font-mono text-lg">S</span>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-dark-terminal flex items-center justify-center border border-matrix/30">
                    <span className="text-electric-blue font-mono text-lg">P</span>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-dark-terminal flex items-center justify-center border border-matrix/30">
                    <span className="text-green-500 font-mono text-lg">C</span>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-dark-terminal flex items-center justify-center border border-matrix/30">
                    <span className="text-yellow-400 font-mono text-lg">D</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}