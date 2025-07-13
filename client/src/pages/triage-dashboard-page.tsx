import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  Shield, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  MessageSquare, 
  DollarSign,
  Settings,
  Plus,
  Eye
} from "lucide-react";

const triageServiceSchema = z.object({
  serviceName: z.string().min(1, "Service name is required"),
  serviceType: z.enum(["managed_triage", "consultation", "remediation"]),
  pricingModel: z.enum(["per_report", "monthly", "annual"]),
  pricePerReport: z.number().min(0),
  monthlyPrice: z.number().min(0),
  annualPrice: z.number().min(0),
  triageLevel: z.enum(["basic", "standard", "premium"]),
  maxReportsPerMonth: z.number().min(1),
  responseTimeHours: z.number().min(1),
  autoAssignTriage: z.boolean(),
  includedServices: z.array(z.string()).optional()
});

type TriageServiceFormData = z.infer<typeof triageServiceSchema>;

function TriageDashboardPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isCreateServiceOpen, setIsCreateServiceOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  // Redirect if not a company user
  if (!user || user.userType !== 'company') {
    return (
      <div className="min-h-screen bg-terminal text-matrix flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-matrix/80">Only company users can access the triage dashboard.</p>
        </div>
      </div>
    );
  }

  const form = useForm<TriageServiceFormData>({
    resolver: zodResolver(triageServiceSchema),
    defaultValues: {
      serviceName: "Managed Vulnerability Triage",
      serviceType: "managed_triage",
      pricingModel: "per_report",
      pricePerReport: 50,
      monthlyPrice: 500,
      annualPrice: 5000,
      triageLevel: "standard",
      maxReportsPerMonth: 50,
      responseTimeHours: 24,
      autoAssignTriage: true,
      includedServices: [
        "Vulnerability validation",
        "Severity assessment",
        "Technical analysis",
        "Remediation recommendations",
        "Progress tracking"
      ]
    }
  });

  // Fetch triage services
  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/triage-services"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/triage-services");
      return res.json();
    }
  });

  // Fetch triage reports
  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ["/api/triage-reports"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/triage-reports");
      return res.json();
    }
  });

  // Fetch triage subscriptions
  const { data: subscriptions = [], isLoading: subscriptionsLoading } = useQuery({
    queryKey: ["/api/triage-subscriptions"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/triage-subscriptions");
      return res.json();
    }
  });

  // Create triage service mutation
  const createServiceMutation = useMutation({
    mutationFn: async (data: TriageServiceFormData) => {
      const res = await apiRequest("POST", "/api/triage-services", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Service created",
        description: "Triage service has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/triage-services"] });
      setIsCreateServiceOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create service",
        variant: "destructive"
      });
    }
  });

  // Request triage for submission
  const requestTriageMutation = useMutation({
    mutationFn: async ({ submissionId, triageServiceId }: { submissionId: number; triageServiceId: number }) => {
      const res = await apiRequest("POST", "/api/triage-reports", {
        submissionId,
        triageServiceId
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Triage requested",
        description: "Vulnerability triage has been requested and assigned to an analyst",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/triage-reports"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to request triage",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: TriageServiceFormData) => {
    // Convert prices from dollars to cents
    const serviceData = {
      ...data,
      pricePerReport: Math.round(data.pricePerReport * 100),
      monthlyPrice: Math.round(data.monthlyPrice * 100),
      annualPrice: Math.round(data.annualPrice * 100)
    };
    createServiceMutation.mutate(serviceData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-500";
      case "in_progress": return "bg-blue-500/20 text-blue-500";
      case "completed": return "bg-green-500/20 text-green-500";
      case "escalated": return "bg-red-500/20 text-red-500";
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

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-terminal text-matrix">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Managed Vulnerability Triage</h1>
          <p className="text-matrix/80">
            Professional vulnerability assessment and triage services for your security programs
          </p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="terminal-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Services</CardTitle>
                  <Shield className="h-4 w-4 text-matrix" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{services.filter((s: any) => s.isActive).length}</div>
                  <p className="text-xs text-muted-foreground">
                    {services.length} total services
                  </p>
                </CardContent>
              </Card>

              <Card className="terminal-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
                  <Clock className="h-4 w-4 text-matrix" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reports.filter((r: any) => r.status === 'pending').length}</div>
                  <p className="text-xs text-muted-foreground">
                    {reports.length} total reports
                  </p>
                </CardContent>
              </Card>

              <Card className="terminal-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-matrix" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reports.filter((r: any) => r.priority === 'critical').length}</div>
                  <p className="text-xs text-muted-foreground">
                    Require immediate attention
                  </p>
                </CardContent>
              </Card>

              <Card className="terminal-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-matrix" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reports.filter((r: any) => r.status === 'completed').length}</div>
                  <p className="text-xs text-muted-foreground">
                    This month
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="terminal-card">
                <CardHeader>
                  <CardTitle>Recent Triage Reports</CardTitle>
                  <CardDescription>Latest vulnerability assessments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reports.slice(0, 5).map((report: any) => (
                      <div key={report.id} className="flex items-center justify-between p-3 rounded-lg bg-terminal/50 border border-matrix/20">
                        <div className="flex-1">
                          <p className="font-medium">{report.submissionTitle}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`text-xs ${getStatusColor(report.status)}`}>
                              {report.status}
                            </Badge>
                            <Badge className={`text-xs ${getPriorityColor(report.priority)}`}>
                              {report.priority}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedReport(report)}
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
                  <CardTitle>Service Performance</CardTitle>
                  <CardDescription>Triage service metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average Response Time</span>
                      <span className="text-sm font-medium text-matrix">18 hours</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Completion Rate</span>
                      <span className="text-sm font-medium text-matrix">96%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Customer Satisfaction</span>
                      <span className="text-sm font-medium text-matrix">4.8/5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Analysts</span>
                      <span className="text-sm font-medium text-matrix">8</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Triage Services</h2>
              <Dialog open={isCreateServiceOpen} onOpenChange={setIsCreateServiceOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-matrix/20 border-matrix/30 hover:bg-matrix/30">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Service
                  </Button>
                </DialogTrigger>
                <DialogContent className="terminal-card max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Triage Service</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="serviceName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="serviceType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select service type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="managed_triage">Managed Triage</SelectItem>
                                  <SelectItem value="consultation">Consultation</SelectItem>
                                  <SelectItem value="remediation">Remediation</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="triageLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Triage Level</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select triage level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="basic">Basic</SelectItem>
                                  <SelectItem value="standard">Standard</SelectItem>
                                  <SelectItem value="premium">Premium</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="pricingModel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pricing Model</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select pricing model" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="per_report">Per Report</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="annual">Annual</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="pricePerReport"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price per Report ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="monthlyPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Monthly Price ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="annualPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Annual Price ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="maxReportsPerMonth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Reports per Month</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="responseTimeHours"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Response Time (hours)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="autoAssignTriage"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Auto-assign Triage</FormLabel>
                              <FormDescription>
                                Automatically assign triage to new submissions
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsCreateServiceOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-matrix/20 border-matrix/30 hover:bg-matrix/30"
                          disabled={createServiceMutation.isPending}
                        >
                          {createServiceMutation.isPending ? "Creating..." : "Create Service"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicesLoading ? (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-matrix mx-auto"></div>
                  <p className="mt-2 text-matrix/80">Loading services...</p>
                </div>
              ) : services.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <Shield className="h-12 w-12 text-matrix/50 mx-auto mb-4" />
                  <p className="text-matrix/80">No triage services configured</p>
                  <p className="text-sm text-matrix/60 mt-1">Create your first triage service to get started</p>
                </div>
              ) : (
                services.map((service: any) => (
                  <Card key={service.id} className="terminal-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{service.serviceName}</CardTitle>
                        <Badge className={service.isActive ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}>
                          {service.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <CardDescription>{service.serviceType.replace('_', ' ')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Triage Level:</span>
                          <span className="font-medium text-matrix">{service.triageLevel}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Pricing:</span>
                          <span className="font-medium text-matrix">
                            {service.pricingModel === 'per_report' && formatPrice(service.pricePerReport)}
                            {service.pricingModel === 'monthly' && `${formatPrice(service.monthlyPrice)}/month`}
                            {service.pricingModel === 'annual' && `${formatPrice(service.annualPrice)}/year`}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Response Time:</span>
                          <span className="font-medium text-matrix">{service.responseTimeHours}h</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Max Reports:</span>
                          <span className="font-medium text-matrix">{service.maxReportsPerMonth}/month</span>
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
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Triage Reports</h2>
              <div className="flex gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reports</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="escalated">Escalated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {reportsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-matrix mx-auto"></div>
                  <p className="mt-2 text-matrix/80">Loading reports...</p>
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-matrix/50 mx-auto mb-4" />
                  <p className="text-matrix/80">No triage reports found</p>
                  <p className="text-sm text-matrix/60 mt-1">Reports will appear here when vulnerability triage is requested</p>
                </div>
              ) : (
                reports.map((report: any) => (
                  <Card key={report.id} className="terminal-card">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{report.submissionTitle}</h3>
                          <p className="text-sm text-matrix/80 mt-1">{report.submissionDescription}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={`${getStatusColor(report.status)}`}>
                            {report.status}
                          </Badge>
                          <Badge className={`${getPriorityColor(report.priority)}`}>
                            {report.priority}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-matrix/60">Analyst:</span>
                          <p className="font-medium">{report.analystUsername || "Unassigned"}</p>
                        </div>
                        <div>
                          <span className="text-matrix/60">Severity:</span>
                          <p className="font-medium">{report.severity || "Unknown"}</p>
                        </div>
                        <div>
                          <span className="text-matrix/60">Due Date:</span>
                          <p className="font-medium">
                            {report.dueDate ? new Date(report.dueDate).toLocaleDateString() : "No due date"}
                          </p>
                        </div>
                        <div>
                          <span className="text-matrix/60">Created:</span>
                          <p className="font-medium">{new Date(report.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedReport(report)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Messages
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Triage Subscriptions</h2>
              <Button className="bg-matrix/20 border-matrix/30 hover:bg-matrix/30">
                <Plus className="h-4 w-4 mr-2" />
                New Subscription
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subscriptionsLoading ? (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-matrix mx-auto"></div>
                  <p className="mt-2 text-matrix/80">Loading subscriptions...</p>
                </div>
              ) : subscriptions.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <DollarSign className="h-12 w-12 text-matrix/50 mx-auto mb-4" />
                  <p className="text-matrix/80">No active subscriptions</p>
                  <p className="text-sm text-matrix/60 mt-1">Subscribe to triage services for ongoing support</p>
                </div>
              ) : (
                subscriptions.map((subscription: any) => (
                  <Card key={subscription.id} className="terminal-card">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{subscription.serviceName}</span>
                        <Badge className={subscription.status === 'active' ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}>
                          {subscription.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {subscription.serviceType} • {subscription.triageLevel} tier
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Billing:</span>
                          <span className="font-medium text-matrix">{subscription.subscriptionType}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Reports Processed:</span>
                          <span className="font-medium text-matrix">{subscription.reportsProcessed}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Total Cost:</span>
                          <span className="font-medium text-matrix">{formatPrice(subscription.totalCost)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Next Billing:</span>
                          <span className="font-medium text-matrix">
                            {subscription.nextBillingDate ? new Date(subscription.nextBillingDate).toLocaleDateString() : "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          Manage
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          Billing
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Report Details Dialog */}
      {selectedReport && (
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="terminal-card max-w-4xl">
            <DialogHeader>
              <DialogTitle>Triage Report Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-matrix/80">Submission</label>
                  <p className="text-sm">{selectedReport.submissionTitle}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-matrix/80">Status</label>
                  <Badge className={`${getStatusColor(selectedReport.status)} ml-2`}>
                    {selectedReport.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-matrix/80">Priority</label>
                  <Badge className={`${getPriorityColor(selectedReport.priority)} ml-2`}>
                    {selectedReport.priority}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-matrix/80">Analyst</label>
                  <p className="text-sm">{selectedReport.analystUsername || "Unassigned"}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-matrix/80">Description</label>
                <p className="text-sm mt-1">{selectedReport.submissionDescription}</p>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setSelectedReport(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default TriageDashboardPage;