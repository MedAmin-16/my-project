
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Shield, Check, X, DollarSign, Clock, Users, Star,
  FileText, MessageSquare, Zap, Target, Award
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TriageService {
  id: number;
  name: string;
  description: string;
  pricingModel: string;
  pricePerReport: number | null;
  monthlyPrice: number | null;
  isActive: boolean;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

interface TriageSubscription {
  id: number;
  companyId: number;
  triageServiceId: number;
  status: string;
  billingModel: string;
  startDate: string;
  endDate: string | null;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
  triageService: {
    id: number;
    name: string;
    description: string;
    pricingModel: string;
    pricePerReport: number | null;
  };
}

export default function TriageServiceSubscription() {
  const { toast } = useToast();
  const [selectedService, setSelectedService] = useState<TriageService | null>(null);
  const [selectedBillingModel, setSelectedBillingModel] = useState<string>("");
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);

  // Fetch available triage services
  const {
    data: services,
    isLoading: servicesLoading,
    error: servicesError
  } = useQuery<TriageService[]>({
    queryKey: ["/api/triage/services"],
  });

  // Fetch current subscription
  const {
    data: subscription,
    isLoading: subscriptionLoading,
    error: subscriptionError
  } = useQuery<TriageSubscription>({
    queryKey: ["/api/triage/subscription"],
  });

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async (data: { triageServiceId: number; billingModel: string }) => {
      const res = await apiRequest("POST", "/api/triage/subscribe", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription successful",
        description: "You've successfully subscribed to the triage service.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/triage/subscription"] });
      setShowSubscribeDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = () => {
    if (!selectedService || !selectedBillingModel) {
      toast({
        title: "Missing information",
        description: "Please select a service and billing model.",
        variant: "destructive",
      });
      return;
    }

    subscribeMutation.mutate({
      triageServiceId: selectedService.id,
      billingModel: selectedBillingModel
    });
  };

  const getServiceIcon = (serviceName: string) => {
    if (serviceName.includes("Basic")) return <Shield className="h-6 w-6 text-matrix" />;
    if (serviceName.includes("Professional")) return <Target className="h-6 w-6 text-electric-blue" />;
    if (serviceName.includes("Enterprise")) return <Award className="h-6 w-6 text-warning-yellow" />;
    return <Shield className="h-6 w-6 text-matrix" />;
  };

  const getServiceBadgeColor = (serviceName: string) => {
    if (serviceName.includes("Basic")) return "bg-matrix/20 text-matrix border-matrix/50";
    if (serviceName.includes("Professional")) return "bg-electric-blue/20 text-electric-blue border-electric-blue/50";
    if (serviceName.includes("Enterprise")) return "bg-warning-yellow/20 text-warning-yellow border-warning-yellow/50";
    return "bg-matrix/20 text-matrix border-matrix/50";
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      {subscriptionLoading ? (
        <div className="terminal-card p-6 rounded-lg">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-matrix" />
          </div>
        </div>
      ) : subscription ? (
        <div className="terminal-card p-6 rounded-lg border border-matrix/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-mono font-bold text-light-gray">Current Subscription</h3>
            <Badge className="bg-matrix/20 text-matrix border-matrix/50 font-mono">
              {subscription.status.toUpperCase()}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded bg-surface/30 border border-matrix/20">
              <div className="flex items-center mb-2">
                {getServiceIcon(subscription.triageService.name)}
                <span className="ml-2 text-light-gray font-mono text-lg">{subscription.triageService.name}</span>
              </div>
              <p className="text-dim-gray font-mono text-sm">{subscription.triageService.description}</p>
            </div>
            
            <div className="p-4 rounded bg-surface/30 border border-matrix/20">
              <div className="flex items-center mb-2">
                <DollarSign className="h-5 w-5 text-electric-blue" />
                <span className="ml-2 text-light-gray font-mono text-sm">Billing</span>
              </div>
              <p className="text-electric-blue font-mono text-lg">
                {subscription.billingModel === "per_report" 
                  ? `$${(subscription.triageService.pricePerReport! / 100).toLocaleString()}/report`
                  : `$${(subscription.triageService.pricePerReport! / 100).toLocaleString()}/month`
                }
              </p>
            </div>
            
            <div className="p-4 rounded bg-surface/30 border border-matrix/20">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-matrix" />
                <span className="ml-2 text-light-gray font-mono text-sm">Active Since</span>
              </div>
              <p className="text-light-gray font-mono text-sm">
                {new Date(subscription.startDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="mt-4 flex space-x-3">
            <Button className="glow-button-secondary">
              <FileText className="mr-2 h-4 w-4" />
              Manage Subscription
            </Button>
            <Button variant="outline" className="border-alert-red/50 text-alert-red hover:bg-alert-red/10">
              <X className="mr-2 h-4 w-4" />
              Cancel Subscription
            </Button>
          </div>
        </div>
      ) : (
        <div className="terminal-card p-6 rounded-lg border border-matrix/30">
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-dim-gray mx-auto mb-4" />
            <p className="text-dim-gray font-mono mb-4">No active triage subscription</p>
            <p className="text-dim-gray font-mono text-sm mb-6">
              Subscribe to our managed triage service to get professional vulnerability assessment
            </p>
          </div>
        </div>
      )}

      {/* Available Services */}
      <div className="terminal-card p-6 rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-mono font-bold text-light-gray">Available Services</h3>
          {!subscription && (
            <Dialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
              <DialogTrigger asChild>
                <Button className="glow-button">
                  <Shield className="mr-2 h-4 w-4" />
                  Subscribe Now
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-terminal border border-matrix/30 max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-light-gray font-mono">Subscribe to Triage Service</DialogTitle>
                  <DialogDescription className="text-dim-gray font-mono">
                    Choose a service and billing model to get started.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-mono text-dim-gray mb-2">Service</label>
                    <Select onValueChange={(value) => {
                      const service = services?.find(s => s.id.toString() === value);
                      setSelectedService(service || null);
                    }}>
                      <SelectTrigger className="terminal-input">
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent className="bg-terminal border border-matrix/30">
                        {services?.map((service) => (
                          <SelectItem key={service.id} value={service.id.toString()}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedService && (
                    <div>
                      <label className="block text-sm font-mono text-dim-gray mb-2">Billing Model</label>
                      <Select onValueChange={setSelectedBillingModel}>
                        <SelectTrigger className="terminal-input">
                          <SelectValue placeholder="Select billing model" />
                        </SelectTrigger>
                        <SelectContent className="bg-terminal border border-matrix/30">
                          {selectedService.pricingModel === "per_report" && (
                            <SelectItem value="per_report">
                              Pay per report - ${(selectedService.pricePerReport! / 100).toLocaleString()}
                            </SelectItem>
                          )}
                          {selectedService.pricingModel === "monthly" && (
                            <SelectItem value="monthly">
                              Monthly - ${(selectedService.monthlyPrice! / 100).toLocaleString()}
                            </SelectItem>
                          )}
                          {selectedService.pricingModel === "per_report" && selectedService.monthlyPrice && (
                            <SelectItem value="monthly">
                              Monthly - ${(selectedService.monthlyPrice / 100).toLocaleString()}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="flex space-x-3 pt-4">
                    <Button 
                      onClick={handleSubscribe}
                      disabled={subscribeMutation.isPending || !selectedService || !selectedBillingModel}
                      className="glow-button flex-1"
                    >
                      {subscribeMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Subscribing...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Subscribe
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowSubscribeDialog(false)}
                      className="border-matrix/50 text-matrix hover:bg-matrix/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {servicesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-matrix" />
          </div>
        ) : servicesError ? (
          <div className="text-center py-8">
            <Shield className="h-8 w-8 text-alert-red mx-auto mb-2" />
            <p className="text-alert-red font-mono">Error loading services</p>
          </div>
        ) : services && services.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className="border border-matrix/20 rounded-lg p-6 hover:border-matrix/40 transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {getServiceIcon(service.name)}
                    <h4 className="ml-2 text-light-gray font-mono text-lg font-semibold">{service.name}</h4>
                  </div>
                  <Badge className={`font-mono text-xs ${getServiceBadgeColor(service.name)}`}>
                    {service.pricingModel.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                
                <p className="text-dim-gray font-mono text-sm mb-4">{service.description}</p>
                
                <div className="mb-6">
                  <div className="flex items-baseline mb-2">
                    <span className="text-2xl text-electric-blue font-mono">
                      ${service.pricePerReport ? (service.pricePerReport / 100).toLocaleString() : (service.monthlyPrice! / 100).toLocaleString()}
                    </span>
                    <span className="ml-1 text-dim-gray font-mono text-sm">
                      /{service.pricingModel === "per_report" ? "report" : "month"}
                    </span>
                  </div>
                  {service.monthlyPrice && service.pricingModel === "per_report" && (
                    <p className="text-dim-gray font-mono text-xs">
                      or ${(service.monthlyPrice / 100).toLocaleString()}/month
                    </p>
                  )}
                </div>
                
                <div className="space-y-2 mb-6">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <Check className="h-4 w-4 text-matrix mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-dim-gray font-mono text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {subscription && subscription.triageServiceId === service.id ? (
                  <Button disabled className="w-full bg-matrix/20 text-matrix border border-matrix/50">
                    <Check className="mr-2 h-4 w-4" />
                    Current Plan
                  </Button>
                ) : (
                  <Button 
                    className="w-full glow-button-secondary"
                    onClick={() => {
                      setSelectedService(service);
                      setSelectedBillingModel(service.pricingModel);
                      setShowSubscribeDialog(true);
                    }}
                    disabled={!!subscription}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Choose Plan
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-dim-gray mx-auto mb-4" />
            <p className="text-dim-gray font-mono">No services available</p>
          </div>
        )}
      </div>
    </div>
  );
}
