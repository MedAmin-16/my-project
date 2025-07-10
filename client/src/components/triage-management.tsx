
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Shield, Clock, CheckCircle, AlertTriangle, MessageSquare, 
  FileText, DollarSign, Users, TrendingUp, Filter, Search,
  Eye, Edit, Send, Plus, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface TriageReport {
  id: number;
  submissionId: number;
  status: string;
  priority: string;
  validationResult: string;
  businessImpact: string;
  technicalComplexity: string;
  fee: number;
  createdAt: string;
  updatedAt: string;
  submissionTitle: string;
  submissionType: string;
  submissionSeverity: string;
  hackerUsername: string;
  companyName: string;
  triageSpecialistName: string;
}

interface TriageCommunication {
  id: number;
  subject: string;
  message: string;
  messageType: string;
  isInternal: boolean;
  createdAt: string;
  fromUsername: string;
  fromUserType: string;
  recipientType: string;
}

export function TriageManagement() {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState<TriageReport | null>(null);
  const [communicationDialog, setCommunicationDialog] = useState(false);
  const [newCommunication, setNewCommunication] = useState({
    subject: '',
    message: '',
    recipientType: 'company',
    messageType: 'update'
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch triage reports
  const { data: reports, isLoading: reportsLoading } = useQuery<TriageReport[]>({
    queryKey: ['/api/triage-reports', selectedStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedStatus) params.append('status', selectedStatus);
      
      const response = await fetch(`/api/triage-reports?${params}`);
      if (!response.ok) throw new Error('Failed to fetch triage reports');
      return response.json();
    }
  });

  // Fetch communications for selected report
  const { data: communications } = useQuery<TriageCommunication[]>({
    queryKey: ['/api/triage-communications', selectedReport?.id],
    queryFn: async () => {
      if (!selectedReport) return [];
      const response = await fetch(`/api/triage-communications/${selectedReport.id}`);
      if (!response.ok) throw new Error('Failed to fetch communications');
      return response.json();
    },
    enabled: !!selectedReport
  });

  // Update triage report mutation
  const updateReportMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const response = await fetch(`/api/triage-reports/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update report');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/triage-reports'] });
      toast({ title: 'Report updated successfully' });
    }
  });

  // Create communication mutation
  const createCommunicationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/triage-communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create communication');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/triage-communications'] });
      setCommunicationDialog(false);
      setNewCommunication({ subject: '', message: '', recipientType: 'company', messageType: 'update' });
      toast({ title: 'Communication sent successfully' });
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-900/20 text-red-400 border-red-400/30';
      case 'high': return 'bg-orange-900/20 text-orange-400 border-orange-400/30';
      case 'medium': return 'bg-yellow-900/20 text-yellow-400 border-yellow-400/30';
      case 'low': return 'bg-blue-900/20 text-blue-400 border-blue-400/30';
      default: return 'bg-gray-900/20 text-gray-400 border-gray-400/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-900/20 text-green-400 border-green-400/30';
      case 'in_review': return 'bg-blue-900/20 text-blue-400 border-blue-400/30';
      case 'validated': return 'bg-matrix/20 text-matrix border-matrix/30';
      case 'rejected': return 'bg-red-900/20 text-red-400 border-red-400/30';
      case 'pending': return 'bg-yellow-900/20 text-yellow-400 border-yellow-400/30';
      default: return 'bg-gray-900/20 text-gray-400 border-gray-400/30';
    }
  };

  const handleSendCommunication = () => {
    if (!selectedReport || !newCommunication.message.trim()) return;

    createCommunicationMutation.mutate({
      triageReportId: selectedReport.id,
      ...newCommunication
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="terminal-card p-6 rounded-lg border border-matrix/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-mono font-bold text-light-gray mb-2">
              Triage Management
            </h1>
            <p className="text-dim-gray font-mono text-sm">
              Manage vulnerability reports and communicate with companies
            </p>
          </div>
          <div className="flex gap-3">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="terminal-input w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-terminal border border-primary/30">
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="validated">Validated</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-terminal/50 p-3 rounded border border-matrix/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-dim-gray font-mono">Pending Reviews</p>
                <p className="text-lg text-light-gray font-mono">
                  {reports?.filter(r => r.status === 'pending').length || 0}
                </p>
              </div>
              <Clock className="h-5 w-5 text-warning-yellow" />
            </div>
          </div>
          <div className="bg-terminal/50 p-3 rounded border border-matrix/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-dim-gray font-mono">In Review</p>
                <p className="text-lg text-light-gray font-mono">
                  {reports?.filter(r => r.status === 'in_review').length || 0}
                </p>
              </div>
              <Eye className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          <div className="bg-terminal/50 p-3 rounded border border-matrix/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-dim-gray font-mono">Validated</p>
                <p className="text-lg text-light-gray font-mono">
                  {reports?.filter(r => r.status === 'validated').length || 0}
                </p>
              </div>
              <CheckCircle className="h-5 w-5 text-matrix" />
            </div>
          </div>
          <div className="bg-terminal/50 p-3 rounded border border-matrix/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-dim-gray font-mono">Total Revenue</p>
                <p className="text-lg text-light-gray font-mono">
                  ${(reports?.reduce((sum, r) => sum + (r.fee || 0), 0) / 100).toFixed(0) || '0'}
                </p>
              </div>
              <DollarSign className="h-5 w-5 text-electric-blue" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-mono font-bold text-light-gray">Triage Reports</h2>
          
          {reportsLoading ? (
            <div className="terminal-card p-6 rounded-lg text-center">
              <p className="text-dim-gray font-mono">Loading reports...</p>
            </div>
          ) : !reports || reports.length === 0 ? (
            <div className="terminal-card p-6 rounded-lg text-center">
              <Shield className="h-8 w-8 text-dim-gray mx-auto mb-2" />
              <p className="text-dim-gray font-mono">No triage reports found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <Card 
                  key={report.id} 
                  className={`terminal-card border cursor-pointer transition-all hover:border-matrix/50 ${
                    selectedReport?.id === report.id ? 'border-matrix/50 bg-matrix/5' : 'border-matrix/30'
                  }`}
                  onClick={() => setSelectedReport(report)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-light-gray font-mono text-sm mb-1">
                          {report.submissionTitle}
                        </h3>
                        <p className="text-dim-gray font-mono text-xs">
                          by {report.hackerUsername} • {report.companyName}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(report.priority)}>
                          {report.priority}
                        </Badge>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-dim-gray">Type:</span>
                        <span className="text-light-gray ml-1">{report.submissionType}</span>
                      </div>
                      <div>
                        <span className="text-dim-gray">Severity:</span>
                        <span className="text-light-gray ml-1">{report.submissionSeverity}</span>
                      </div>
                      <div>
                        <span className="text-dim-gray">Business Impact:</span>
                        <span className="text-light-gray ml-1">{report.businessImpact || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-dim-gray">Fee:</span>
                        <span className="text-matrix ml-1">${(report.fee || 0) / 100}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Report Details */}
        <div className="space-y-4">
          {selectedReport ? (
            <>
              <Card className="terminal-card border border-matrix/30">
                <CardHeader>
                  <CardTitle className="text-light-gray font-mono text-lg flex items-center justify-between">
                    Report Details
                    <Dialog open={communicationDialog} onOpenChange={setCommunicationDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="glow-button">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Message
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="terminal-card border border-matrix/30">
                        <DialogHeader>
                          <DialogTitle className="text-light-gray font-mono">
                            Send Communication
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-mono text-dim-gray mb-1 block">
                              Recipient
                            </label>
                            <Select 
                              value={newCommunication.recipientType} 
                              onValueChange={(value) => setNewCommunication(prev => ({ ...prev, recipientType: value }))}
                            >
                              <SelectTrigger className="terminal-input">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-terminal border border-primary/30">
                                <SelectItem value="hacker">Hacker</SelectItem>
                                <SelectItem value="company">Company</SelectItem>
                                <SelectItem value="both">Both</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-mono text-dim-gray mb-1 block">
                              Subject
                            </label>
                            <Input
                              className="terminal-input"
                              value={newCommunication.subject}
                              onChange={(e) => setNewCommunication(prev => ({ ...prev, subject: e.target.value }))}
                              placeholder="Message subject"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-mono text-dim-gray mb-1 block">
                              Message
                            </label>
                            <Textarea
                              className="terminal-input min-h-[100px]"
                              value={newCommunication.message}
                              onChange={(e) => setNewCommunication(prev => ({ ...prev, message: e.target.value }))}
                              placeholder="Type your message..."
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={handleSendCommunication}
                              disabled={!newCommunication.message.trim()}
                              className="glow-button"
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Send
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setCommunicationDialog(false)}
                              className="border-matrix/30"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-mono text-dim-gray mb-1 block">Status</label>
                    <Select 
                      value={selectedReport.status} 
                      onValueChange={(value) => 
                        updateReportMutation.mutate({ 
                          id: selectedReport.id, 
                          updates: { status: value } 
                        })
                      }
                    >
                      <SelectTrigger className="terminal-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-terminal border border-primary/30">
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_review">In Review</SelectItem>
                        <SelectItem value="validated">Validated</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-mono text-dim-gray mb-1 block">Priority</label>
                    <Select 
                      value={selectedReport.priority} 
                      onValueChange={(value) => 
                        updateReportMutation.mutate({ 
                          id: selectedReport.id, 
                          updates: { priority: value } 
                        })
                      }
                    >
                      <SelectTrigger className="terminal-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-terminal border border-primary/30">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-mono text-dim-gray mb-1 block">Business Impact</label>
                    <Select 
                      value={selectedReport.businessImpact || "medium"} 
                      onValueChange={(value) => 
                        updateReportMutation.mutate({ 
                          id: selectedReport.id, 
                          updates: { businessImpact: value } 
                        })
                      }
                    >
                      <SelectTrigger className="terminal-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-terminal border border-primary/30">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4 border-t border-matrix/20">
                    <p className="text-xs text-dim-gray font-mono mb-2">Report Information</p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-dim-gray">Created:</span>
                        <span className="text-light-gray">
                          {new Date(selectedReport.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dim-gray">Specialist:</span>
                        <span className="text-light-gray">
                          {selectedReport.triageSpecialistName || 'Unassigned'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dim-gray">Fee:</span>
                        <span className="text-matrix">${(selectedReport.fee || 0) / 100}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Communications */}
              <Card className="terminal-card border border-matrix/30">
                <CardHeader>
                  <CardTitle className="text-light-gray font-mono text-lg">
                    Communications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {communications && communications.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {communications.map((comm) => (
                        <div key={comm.id} className="bg-terminal/50 p-3 rounded border border-matrix/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-light-gray font-mono text-sm">
                              {comm.fromUsername}
                            </span>
                            <span className="text-dim-gray font-mono text-xs">
                              {new Date(comm.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {comm.subject && (
                            <p className="text-matrix font-mono text-sm mb-1">{comm.subject}</p>
                          )}
                          <p className="text-dim-gray font-mono text-xs">{comm.message}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge className="bg-electric-blue/20 text-electric-blue border-electric-blue/30 text-xs">
                              {comm.recipientType}
                            </Badge>
                            <Badge className="bg-matrix/20 text-matrix border-matrix/30 text-xs">
                              {comm.messageType}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-dim-gray font-mono text-sm text-center py-4">
                      No communications yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="terminal-card border border-matrix/30">
              <CardContent className="p-6 text-center">
                <FileText className="h-8 w-8 text-dim-gray mx-auto mb-2" />
                <p className="text-dim-gray font-mono text-sm">
                  Select a report to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
