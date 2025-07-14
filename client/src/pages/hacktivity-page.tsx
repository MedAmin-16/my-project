
import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/navbar";
import { MatrixBackground } from "@/components/matrix-background";
import { Search, Filter, Bug, Shield, Eye, Calendar, User, Building2, Award } from "lucide-react";

// Mock data for bug disclosures
const mockDisclosures = [
  {
    id: 1,
    title: "SQL Injection in User Authentication",
    bugType: "SQLi",
    status: "Resolved",
    researcher: "alexhacker",
    program: "TechCorp",
    disclosureDate: "2024-01-15",
    reward: 2500,
    severity: "High",
    description: "A SQL injection vulnerability was found in the user authentication endpoint allowing unauthorized access to user data.",
    cvss: 8.2
  },
  {
    id: 2,
    title: "Cross-Site Scripting in Comment System",
    bugType: "XSS",
    status: "Accepted",
    researcher: "sarah_sec",
    program: "SocialApp",
    disclosureDate: "2024-01-12",
    reward: 800,
    severity: "Medium",
    description: "Stored XSS vulnerability in the comment system allowing execution of malicious scripts.",
    cvss: 6.1
  },
  {
    id: 3,
    title: "Insecure Direct Object Reference in File Access",
    bugType: "IDOR",
    status: "Resolved",
    researcher: "cyberdev",
    program: "FileShare Pro",
    disclosureDate: "2024-01-10",
    reward: 1200,
    severity: "High",
    description: "IDOR vulnerability allowing unauthorized access to other users' private files.",
    cvss: 7.5
  },
  {
    id: 4,
    title: "Remote Code Execution via File Upload",
    bugType: "RCE",
    status: "Resolved",
    researcher: "pentester99",
    program: "WebBuilder",
    disclosureDate: "2024-01-08",
    reward: 5000,
    severity: "Critical",
    description: "RCE vulnerability through unrestricted file upload allowing server compromise.",
    cvss: 9.8
  },
  {
    id: 5,
    title: "Authentication Bypass in Admin Panel",
    bugType: "Auth Bypass",
    status: "Accepted",
    researcher: "whitehat_joe",
    program: "AdminSuite",
    disclosureDate: "2024-01-05",
    reward: 3000,
    severity: "Critical",
    description: "Authentication bypass vulnerability allowing unauthorized access to admin functionality.",
    cvss: 9.1
  },
  {
    id: 6,
    title: "Information Disclosure in API Response",
    bugType: "Info Disclosure",
    status: "Resolved",
    researcher: "bugfinder",
    program: "APIGateway",
    disclosureDate: "2024-01-03",
    reward: 600,
    severity: "Low",
    description: "Sensitive information exposed in API responses including internal system details.",
    cvss: 4.3
  }
];

const bugTypeIcons = {
  "SQLi": "💉",
  "XSS": "🔗",
  "IDOR": "🔐",
  "RCE": "💀",
  "Auth Bypass": "🚪",
  "Info Disclosure": "📄",
  "CSRF": "🔄",
  "XXE": "📋"
};

const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case "critical": return "text-red-400 bg-red-400/10 border-red-400/30";
    case "high": return "text-orange-400 bg-orange-400/10 border-orange-400/30";
    case "medium": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
    case "low": return "text-blue-400 bg-blue-400/10 border-blue-400/30";
    default: return "text-matrix bg-matrix/10 border-matrix/30";
  }
};

export default function HacktivityPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBugType, setSelectedBugType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDisclosure, setSelectedDisclosure] = useState<any>(null);

  const filteredDisclosures = useMemo(() => {
    return mockDisclosures.filter(disclosure => {
      const matchesSearch = disclosure.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          disclosure.researcher.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          disclosure.program.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBugType = selectedBugType === "" || disclosure.bugType === selectedBugType;
      const matchesStatus = selectedStatus === "" || disclosure.status === selectedStatus;
      
      return matchesSearch && matchesBugType && matchesStatus;
    });
  }, [searchTerm, selectedBugType, selectedStatus]);

  const uniqueBugTypes = Array.from(new Set(mockDisclosures.map(d => d.bugType)));
  const uniqueStatuses = Array.from(new Set(mockDisclosures.map(d => d.status)));

  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold text-matrix mb-2">Hacktivity</h1>
          <p className="text-dim-gray font-mono">Public bug bounty disclosures from the community</p>
        </div>

        {/* Filters */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-matrix h-4 w-4" />
            <input
              type="text"
              placeholder="Search disclosures..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-terminal border border-matrix/30 rounded-lg text-light-gray font-mono text-sm focus:outline-none focus:border-matrix focus:ring-1 focus:ring-matrix"
            />
          </div>

          {/* Bug Type Filter */}
          <select
            value={selectedBugType}
            onChange={(e) => setSelectedBugType(e.target.value)}
            className="px-4 py-2 bg-terminal border border-matrix/30 rounded-lg text-light-gray font-mono text-sm focus:outline-none focus:border-matrix focus:ring-1 focus:ring-matrix"
          >
            <option value="">All Bug Types</option>
            {uniqueBugTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-terminal border border-matrix/30 rounded-lg text-light-gray font-mono text-sm focus:outline-none focus:border-matrix focus:ring-1 focus:ring-matrix"
          >
            <option value="">All Statuses</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedBugType("");
              setSelectedStatus("");
            }}
            className="px-4 py-2 bg-matrix/10 border border-matrix/30 rounded-lg text-matrix font-mono text-sm hover:bg-matrix/20 transition-all duration-200"
          >
            Clear Filters
          </button>
        </div>

        {/* Disclosure Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDisclosures.map((disclosure) => (
            <div
              key={disclosure.id}
              className="terminal-card p-6 rounded-lg border border-matrix/30 hover:border-matrix/50 hover:shadow-glow-sm transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedDisclosure(disclosure)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{bugTypeIcons[disclosure.bugType] || "🐛"}</div>
                  <div>
                    <h3 className="text-light-gray font-mono text-lg font-semibold mb-1">
                      {disclosure.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-mono border ${getSeverityColor(disclosure.severity)}`}>
                        {disclosure.severity}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-mono bg-matrix/10 text-matrix border border-matrix/30">
                        {disclosure.bugType}
                      </span>
                    </div>
                  </div>
                </div>
                
                {disclosure.reward && (
                  <div className="flex items-center space-x-1 text-warning-yellow">
                    <Award className="h-4 w-4" />
                    <span className="font-mono text-sm">${disclosure.reward}</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <p className="text-dim-gray text-sm mb-4 line-clamp-2">
                {disclosure.description}
              </p>

              {/* Meta Information */}
              <div className="flex items-center justify-between text-xs text-dim-gray font-mono">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>{disclosure.researcher}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Building2 className="h-3 w-3" />
                    <span>{disclosure.program}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{disclosure.disclosureDate}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 text-matrix hover:text-matrix-dark">
                  <Eye className="h-3 w-3" />
                  <span>View Details</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex justify-end mt-3">
                <span className={`px-2 py-1 rounded-full text-xs font-mono ${
                  disclosure.status === "Resolved" 
                    ? "bg-matrix/10 text-matrix border border-matrix/30" 
                    : "bg-warning-yellow/10 text-warning-yellow border border-warning-yellow/30"
                }`}>
                  {disclosure.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredDisclosures.length === 0 && (
          <div className="text-center py-12">
            <Bug className="h-16 w-16 text-dim-gray mx-auto mb-4" />
            <h3 className="text-xl font-mono text-light-gray mb-2">No disclosures found</h3>
            <p className="text-dim-gray">Try adjusting your filters or search terms.</p>
          </div>
        )}

        {/* Detailed View Modal */}
        {selectedDisclosure && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-terminal border border-matrix/30 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="p-6 border-b border-matrix/30">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{bugTypeIcons[selectedDisclosure.bugType] || "🐛"}</div>
                    <div>
                      <h2 className="text-2xl font-mono text-light-gray font-bold mb-2">
                        {selectedDisclosure.title}
                      </h2>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-mono border ${getSeverityColor(selectedDisclosure.severity)}`}>
                          {selectedDisclosure.severity} • CVSS {selectedDisclosure.cvss}
                        </span>
                        <span className="px-3 py-1 rounded-full text-sm font-mono bg-matrix/10 text-matrix border border-matrix/30">
                          {selectedDisclosure.bugType}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedDisclosure(null)}
                    className="text-dim-gray hover:text-light-gray text-2xl font-mono"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h3 className="text-lg font-mono text-matrix mb-3">Vulnerability Description</h3>
                      <p className="text-dim-gray leading-relaxed">
                        {selectedDisclosure.description}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-mono text-matrix mb-3">Technical Details</h3>
                      <div className="bg-deep-black p-4 rounded-lg border border-matrix/20">
                        <p className="text-dim-gray font-mono text-sm">
                          This vulnerability was discovered through security testing and has been responsibly disclosed to the program owner. 
                          The issue has been {selectedDisclosure.status.toLowerCase()} and appropriate security measures have been implemented.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    <div className="bg-deep-black p-4 rounded-lg border border-matrix/20">
                      <h3 className="text-lg font-mono text-matrix mb-4">Disclosure Info</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-dim-gray text-sm">Researcher</span>
                          <span className="text-light-gray font-mono text-sm">{selectedDisclosure.researcher}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-dim-gray text-sm">Program</span>
                          <span className="text-light-gray font-mono text-sm">{selectedDisclosure.program}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-dim-gray text-sm">Date</span>
                          <span className="text-light-gray font-mono text-sm">{selectedDisclosure.disclosureDate}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-dim-gray text-sm">Status</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-mono ${
                            selectedDisclosure.status === "Resolved" 
                              ? "bg-matrix/10 text-matrix border border-matrix/30" 
                              : "bg-warning-yellow/10 text-warning-yellow border border-warning-yellow/30"
                          }`}>
                            {selectedDisclosure.status}
                          </span>
                        </div>
                        {selectedDisclosure.reward && (
                          <div className="flex items-center justify-between">
                            <span className="text-dim-gray text-sm">Reward</span>
                            <span className="text-warning-yellow font-mono text-sm">${selectedDisclosure.reward}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-deep-black p-4 rounded-lg border border-matrix/20">
                      <h3 className="text-lg font-mono text-matrix mb-4">Security Rating</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-dim-gray text-sm">CVSS Score</span>
                          <span className="text-light-gray font-mono text-sm">{selectedDisclosure.cvss}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-dim-gray text-sm">Severity</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-mono border ${getSeverityColor(selectedDisclosure.severity)}`}>
                            {selectedDisclosure.severity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
