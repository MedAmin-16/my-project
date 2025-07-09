
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  FileText, Shield, AlertTriangle, Clock, User, Download,
  CheckCircle, XCircle, AlertCircle, Info, ChevronDown,
  ChevronUp, Calendar, Tag, Target, Zap
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";

interface TriageReport {
  id: number;
  triageRequestId: number;
  severityAssessment: string;
  riskLevel: string;
  validationStatus: string;
  exploitability: string;
  businessImpact: string;
  technicalAnalysis: string;
  reproductionSteps: string;
  recommendedActions: string;
  timelineRecommendation: string;
  additionalNotes: string;
  attachments: Array<{
    name: string;
    type: string;
  }>;
  createdAt: string;
  updatedAt: string;
  triageRequest: {
    id: number;
    status: string;
    priority: string;
    submission: {
      id: number;
      title: string;
      type: string;
      severity: string;
    };
    assignedTriager: {
      id: number;
      username: string;
    };
  };
}

interface TriageReportProps {
  requestId: number;
}

export default function TriageReport({ requestId }: TriageReportProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary']));

  // Fetch triage report
  const {
    data: report,
    isLoading,
    error
  } = useQuery<TriageReport>({
    queryKey: [`/api/triage/reports/${requestId}`],
  });

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getRiskLevelColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "critical": return "bg-alert-red/20 text-alert-red border-alert-red/50";
      case "high": return "bg-warning-yellow/20 text-warning-yellow border-warning-yellow/50";
      case "medium": return "bg-electric-blue/20 text-electric-blue border-electric-blue/50";
      case "low": return "bg-matrix/20 text-matrix border-matrix/50";
      default: return "bg-dim-gray/20 text-dim-gray border-dim-gray/50";
    }
  };

  const getValidationStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "valid": return <CheckCircle className="h-5 w-5 text-matrix" />;
      case "invalid": return <XCircle className="h-5 w-5 text-alert-red" />;
      case "duplicate": return <AlertCircle className="h-5 w-5 text-warning-yellow" />;
      case "informational": return <Info className="h-5 w-5 text-electric-blue" />;
      default: return <AlertTriangle className="h-5 w-5 text-dim-gray" />;
    }
  };

  const getExploitabilityScore = (exploitability: string) => {
    switch (exploitability.toLowerCase()) {
      case "high": return 90;
      case "medium": return 60;
      case "low": return 30;
      default: return 0;
    }
  };

  if (isLoading) {
    return (
      <div className="terminal-card p-6 rounded-lg">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-matrix" />
          <span className="ml-3 text-matrix font-mono">Loading triage report...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="terminal-card p-6 rounded-lg text-center">
        <AlertTriangle className="h-12 w-12 text-alert-red mx-auto mb-4" />
        <p className="text-alert-red font-mono text-lg mb-2">Error Loading Report</p>
        <p className="text-dim-gray font-mono text-sm">Unable to load the triage report. Please try again later.</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="terminal-card p-6 rounded-lg text-center">
        <FileText className="h-12 w-12 text-dim-gray mx-auto mb-4" />
        <p className="text-dim-gray font-mono">No triage report available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="terminal-card p-6 rounded-lg border border-matrix/30">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1">
            <div className="flex items-center mb-3">
              <FileText className="h-6 w-6 text-matrix mr-3" />
              <h1 className="text-xl font-mono font-bold text-light-gray">
                Triage Report #{report.id}
              </h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-dim-gray font-mono mb-1">Vulnerability</p>
                <p className="text-light-gray font-mono text-sm">{report.triageRequest.submission.title}</p>
              </div>
              
              <div>
                <p className="text-xs text-dim-gray font-mono mb-1">Type</p>
                <p className="text-light-gray font-mono text-sm">{report.triageRequest.submission.type}</p>
              </div>
              
              <div>
                <p className="text-xs text-dim-gray font-mono mb-1">Triaged By</p>
                <p className="text-light-gray font-mono text-sm">{report.triageRequest.assignedTriager.username}</p>
              </div>
              
              <div>
                <p className="text-xs text-dim-gray font-mono mb-1">Completed</p>
                <p className="text-light-gray font-mono text-sm">
                  {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge className={`font-mono text-xs ${getRiskLevelColor(report.riskLevel)}`}>
                {report.riskLevel.toUpperCase()} RISK
              </Badge>
              
              <Badge className="font-mono text-xs bg-surface/50 text-light-gray border-matrix/30 flex items-center">
                {getValidationStatusIcon(report.validationStatus)}
                <span className="ml-1">{report.validationStatus.toUpperCase()}</span>
              </Badge>
              
              <Badge className="font-mono text-xs bg-surface/50 text-light-gray border-matrix/30">
                <Target className="h-3 w-3 mr-1" />
                {report.exploitability.toUpperCase()} EXPLOITABILITY
              </Badge>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button className="glow-button-secondary">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button className="glow-button">
              <FileText className="mr-2 h-4 w-4" />
              Share Report
            </Button>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <Collapsible 
        open={expandedSections.has('summary')} 
        onOpenChange={() => toggleSection('summary')}
      >
        <div className="terminal-card rounded-lg border border-matrix/30">
          <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-matrix/5 transition-colors">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-matrix mr-3" />
              <h3 className="text-lg font-mono font-bold text-light-gray">Executive Summary</h3>
            </div>
            {expandedSections.has('summary') ? 
              <ChevronUp className="h-5 w-5 text-matrix" /> : 
              <ChevronDown className="h-5 w-5 text-matrix" />
            }
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-6 pb-6 border-t border-matrix/20">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2">
                  <h4 className="text-matrix font-mono text-sm font-semibold mb-3">Risk Assessment</h4>
                  <div className="p-4 rounded bg-surface/30 border border-matrix/20">
                    <p className="text-light-gray font-mono text-sm leading-relaxed whitespace-pre-line">
                      {report.severityAssessment}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 rounded bg-surface/30 border border-matrix/20">
                    <h4 className="text-matrix font-mono text-sm font-semibold mb-3">Risk Metrics</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-dim-gray font-mono text-xs">Exploitability</span>
                          <span className="text-light-gray font-mono text-xs">{report.exploitability}</span>
                        </div>
                        <Progress 
                          value={getExploitabilityScore(report.exploitability)} 
                          className="h-2 bg-dim-gray/20" 
                          indicatorClassName={
                            report.exploitability === "high" ? "bg-alert-red" :
                            report.exploitability === "medium" ? "bg-warning-yellow" : "bg-matrix"
                          }
                        />
                      </div>
                      
                      <div>
                        <p className="text-dim-gray font-mono text-xs mb-1">Overall Risk</p>
                        <Badge className={`font-mono text-xs ${getRiskLevelColor(report.riskLevel)}`}>
                          {report.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="text-dim-gray font-mono text-xs mb-1">Status</p>
                        <div className="flex items-center">
                          {getValidationStatusIcon(report.validationStatus)}
                          <span className="ml-2 text-light-gray font-mono text-xs">
                            {report.validationStatus.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded bg-surface/30 border border-matrix/20">
                    <h4 className="text-matrix font-mono text-sm font-semibold mb-2">Timeline</h4>
                    <div className="flex items-center text-warning-yellow font-mono text-sm">
                      <Clock className="h-4 w-4 mr-2" />
                      {report.timelineRecommendation?.includes("24") ? "24 hours" : 
                       report.timelineRecommendation?.includes("week") ? "1 week" : "ASAP"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Business Impact */}
      <Collapsible 
        open={expandedSections.has('business')} 
        onOpenChange={() => toggleSection('business')}
      >
        <div className="terminal-card rounded-lg border border-matrix/30">
          <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-matrix/5 transition-colors">
            <div className="flex items-center">
              <Target className="h-5 w-5 text-electric-blue mr-3" />
              <h3 className="text-lg font-mono font-bold text-light-gray">Business Impact Analysis</h3>
            </div>
            {expandedSections.has('business') ? 
              <ChevronUp className="h-5 w-5 text-matrix" /> : 
              <ChevronDown className="h-5 w-5 text-matrix" />
            }
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-6 pb-6 border-t border-matrix/20">
              <div className="mt-6 p-4 rounded bg-surface/30 border border-matrix/20">
                <p className="text-light-gray font-mono text-sm leading-relaxed whitespace-pre-line">
                  {report.businessImpact}
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Technical Analysis */}
      <Collapsible 
        open={expandedSections.has('technical')} 
        onOpenChange={() => toggleSection('technical')}
      >
        <div className="terminal-card rounded-lg border border-matrix/30">
          <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-matrix/5 transition-colors">
            <div className="flex items-center">
              <Zap className="h-5 w-5 text-warning-yellow mr-3" />
              <h3 className="text-lg font-mono font-bold text-light-gray">Technical Analysis</h3>
            </div>
            {expandedSections.has('technical') ? 
              <ChevronUp className="h-5 w-5 text-matrix" /> : 
              <ChevronDown className="h-5 w-5 text-matrix" />
            }
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-6 pb-6 border-t border-matrix/20">
              <div className="mt-6 p-4 rounded bg-terminal/50 border border-matrix/20">
                <pre className="text-light-gray font-mono text-sm leading-relaxed whitespace-pre-wrap overflow-x-auto">
                  {report.technicalAnalysis}
                </pre>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Reproduction Steps */}
      <Collapsible 
        open={expandedSections.has('reproduction')} 
        onOpenChange={() => toggleSection('reproduction')}
      >
        <div className="terminal-card rounded-lg border border-matrix/30">
          <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-matrix/5 transition-colors">
            <div className="flex items-center">
              <Tag className="h-5 w-5 text-matrix mr-3" />
              <h3 className="text-lg font-mono font-bold text-light-gray">Reproduction Steps</h3>
            </div>
            {expandedSections.has('reproduction') ? 
              <ChevronUp className="h-5 w-5 text-matrix" /> : 
              <ChevronDown className="h-5 w-5 text-matrix" />
            }
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-6 pb-6 border-t border-matrix/20">
              <div className="mt-6 p-4 rounded bg-terminal/50 border border-matrix/20">
                <pre className="text-light-gray font-mono text-sm leading-relaxed whitespace-pre-wrap">
                  {report.reproductionSteps}
                </pre>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Recommended Actions */}
      <Collapsible 
        open={expandedSections.has('recommendations')} 
        onOpenChange={() => toggleSection('recommendations')}
      >
        <div className="terminal-card rounded-lg border border-matrix/30">
          <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-matrix/5 transition-colors">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-matrix mr-3" />
              <h3 className="text-lg font-mono font-bold text-light-gray">Recommended Actions</h3>
            </div>
            {expandedSections.has('recommendations') ? 
              <ChevronUp className="h-5 w-5 text-matrix" /> : 
              <ChevronDown className="h-5 w-5 text-matrix" />
            }
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-6 pb-6 border-t border-matrix/20">
              <div className="mt-6 p-4 rounded bg-surface/30 border border-matrix/20">
                <pre className="text-light-gray font-mono text-sm leading-relaxed whitespace-pre-wrap">
                  {report.recommendedActions}
                </pre>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Additional Notes */}
      {report.additionalNotes && (
        <Collapsible 
          open={expandedSections.has('notes')} 
          onOpenChange={() => toggleSection('notes')}
        >
          <div className="terminal-card rounded-lg border border-matrix/30">
            <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-matrix/5 transition-colors">
              <div className="flex items-center">
                <Info className="h-5 w-5 text-electric-blue mr-3" />
                <h3 className="text-lg font-mono font-bold text-light-gray">Additional Notes</h3>
              </div>
              {expandedSections.has('notes') ? 
                <ChevronUp className="h-5 w-5 text-matrix" /> : 
                <ChevronDown className="h-5 w-5 text-matrix" />
              }
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="px-6 pb-6 border-t border-matrix/20">
                <div className="mt-6 p-4 rounded bg-surface/30 border border-matrix/20">
                  <pre className="text-light-gray font-mono text-sm leading-relaxed whitespace-pre-wrap">
                    {report.additionalNotes}
                  </pre>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}

      {/* Attachments */}
      {report.attachments && report.attachments.length > 0 && (
        <div className="terminal-card p-6 rounded-lg border border-matrix/30">
          <h3 className="text-lg font-mono font-bold text-light-gray mb-4 flex items-center">
            <FileText className="h-5 w-5 text-matrix mr-3" />
            Attachments ({report.attachments.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {report.attachments.map((attachment, index) => (
              <div key={index} className="flex items-center p-3 rounded bg-surface/30 border border-matrix/20 hover:bg-matrix/5 transition-colors cursor-pointer">
                <FileText className="h-5 w-5 text-matrix mr-3 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-light-gray font-mono text-sm truncate">{attachment.name}</p>
                  <p className="text-dim-gray font-mono text-xs">{attachment.type}</p>
                </div>
                <Download className="h-4 w-4 text-matrix ml-2 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
