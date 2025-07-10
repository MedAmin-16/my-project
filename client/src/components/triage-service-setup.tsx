
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Shield, Settings, DollarSign, Clock, CheckCircle, 
  AlertTriangle, FileText, TrendingUp, Users, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface TriageService {
  id: number;
  companyId: number;
  servicePlan: string;
  pricePerReport: number;
  monthlyFee: number;
  isActive: boolean;
  createdAt: string;
}

export function TriageServiceSetup() {
  const [newService, setNewService] = useState({
    servicePlan: 'per_report',
    pricePerReport: 15000, // $150 default
    monthlyFee: 299900, // $2999 default
    settings: {}
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing triage service
  const { data: triageService, isLoading } = useQuery<TriageService>({
    queryKey: ['/api/triage-service'],
    queryFn: async () => {
      const response = await fetch('/api/triage-service');
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch triage service');
      }
      return response.json();
    }
  });

  // Create triage service mutation
  const createServiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/triage-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create triage service');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/triage-service'] });
      toast({ 
        title: 'Triage Service Activated',
        description: 'Your managed vulnerability triage service is now active.'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Setup Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleCreateService = () => {
    createServiceMutation.mutate(newService);
  };

  const pricingPlans = [
    {
      id: 'per_report',
      name: 'Per Report',
      description: 'Pay for each vulnerability report we triage',
      price: '$150',
      unit: 'per report',
      features: [
        'Professional triage within 24 hours',
        'Detailed validation and assessment',
        'Direct communication with researchers',
        'Remediation recommendations',
        'Priority assignment'
      ],
      recommended: false
    },
    {
      id: 'monthly',
      name: 'Monthly Plan',
      description: 'Fixed monthly fee for unlimited triage services',
      price: '$2,999',
      unit: 'per month',
      features: [
        'Unlimited report triage',
        'Dedicated triage specialist',
        'Real-time collaboration tools',
        'Custom workflow integration',
        'Monthly security reports',
        'Priority support'
      ],
      recommended: true
    },
    {
      id: 'annual',
      name: 'Annual Plan',
      description: 'Best value with annual commitment',
      price: '$29,990',
      unit: 'per year',
      features: [
        'All monthly plan features',
        'Senior security consultant access',
        'Quarterly security assessments',
        'Custom reporting dashboard',
        'On-site consultation (2 days/year)',
        'Strategic security planning'
      ],
      recommended: false
    }
  ];

  if (isLoading) {
    return (
      <div className="terminal-card p-6 rounded-lg text-center">
        <p className="text-dim-gray font-mono">Loading triage service...</p>
      </div>
    );
  }

  if (triageService) {
    return (
      <div className="space-y-6">
        {/* Active Service Overview */}
        <Card className="terminal-card border border-matrix/30">
          <CardHeader>
            <CardTitle className="text-light-gray font-mono text-xl flex items-center">
              <Shield className="h-6 w-6 text-matrix mr-3" />
              Managed Triage Service
              <Badge className="ml-3 bg-matrix/20 text-matrix border-matrix/30">
                Active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-terminal/50 p-4 rounded border border-matrix/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-dim-gray font-mono text-sm">Service Plan</span>
                  <Settings className="h-4 w-4 text-matrix" />
                </div>
                <p className="text-light-gray font-mono text-lg capitalize">
                  {triageService.servicePlan.replace('_', ' ')}
                </p>
              </div>
              <div className="bg-terminal/50 p-4 rounded border border-matrix/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-dim-gray font-mono text-sm">Pricing</span>
                  <DollarSign className="h-4 w-4 text-electric-blue" />
                </div>
                <p className="text-light-gray font-mono text-lg">
                  {triageService.servicePlan === 'per_report' 
                    ? `$${(triageService.pricePerReport / 100).toFixed(0)}/report`
                    : `$${(triageService.monthlyFee / 100).toFixed(0)}/month`
                  }
                </p>
              </div>
              <div className="bg-terminal/50 p-4 rounded border border-matrix/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-dim-gray font-mono text-sm">Status</span>
                  <CheckCircle className="h-4 w-4 text-matrix" />
                </div>
                <p className="text-matrix font-mono text-lg">
                  {triageService.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-matrix/20">
              <h3 className="text-lg font-mono font-bold text-light-gray mb-4">
                Service Benefits
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-matrix font-mono text-sm mb-3">What We Handle</h4>
                  <ul className="space-y-2 text-sm text-dim-gray">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-matrix mr-2" />
                      Initial vulnerability validation
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-matrix mr-2" />
                      Severity and impact assessment
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-matrix mr-2" />
                      Communication with researchers
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-matrix mr-2" />
                      Detailed triage reports
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-matrix mr-2" />
                      Remediation recommendations
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-matrix font-mono text-sm mb-3">Your Benefits</h4>
                  <ul className="space-y-2 text-sm text-dim-gray">
                    <li className="flex items-center">
                      <Star className="h-4 w-4 text-warning-yellow mr-2" />
                      Save 80% of triage time
                    </li>
                    <li className="flex items-center">
                      <Star className="h-4 w-4 text-warning-yellow mr-2" />
                      Expert security validation
                    </li>
                    <li className="flex items-center">
                      <Star className="h-4 w-4 text-warning-yellow mr-2" />
                      Reduced false positives
                    </li>
                    <li className="flex items-center">
                      <Star className="h-4 w-4 text-warning-yellow mr-2" />
                      Faster response times
                    </li>
                    <li className="flex items-center">
                      <Star className="h-4 w-4 text-warning-yellow mr-2" />
                      Professional communication
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="terminal-card border border-matrix/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-dim-gray font-mono">Reports Triaged</p>
                  <p className="text-2xl text-light-gray font-mono">0</p>
                  <p className="text-xs text-matrix font-mono">This month</p>
                </div>
                <TrendingUp className="h-8 w-8 text-matrix" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="terminal-card border border-matrix/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-dim-gray font-mono">Avg. Triage Time</p>
                  <p className="text-2xl text-light-gray font-mono">4.2h</p>
                  <p className="text-xs text-matrix font-mono">Industry leading</p>
                </div>
                <Clock className="h-8 w-8 text-warning-yellow" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="terminal-card border border-matrix/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-dim-gray font-mono">Accuracy Rate</p>
                  <p className="text-2xl text-light-gray font-mono">98.5%</p>
                  <p className="text-xs text-matrix font-mono">Validation accuracy</p>
                </div>
                <CheckCircle className="h-8 w-8 text-matrix" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="terminal-card border border-matrix/30">
        <CardHeader>
          <CardTitle className="text-light-gray font-mono text-xl flex items-center">
            <Shield className="h-6 w-6 text-matrix mr-3" />
            Managed Vulnerability Triage Service
          </CardTitle>
          <p className="text-dim-gray font-mono text-sm">
            Let our security experts handle vulnerability validation and communication for you.
          </p>
        </CardHeader>
      </Card>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pricingPlans.map((plan) => (
          <Card 
            key={plan.id}
            className={`terminal-card border cursor-pointer transition-all hover:border-matrix/50 ${
              newService.servicePlan === plan.id 
                ? 'border-matrix/50 bg-matrix/5' 
                : 'border-matrix/30'
            } ${plan.recommended ? 'ring-1 ring-matrix/30' : ''}`}
            onClick={() => setNewService(prev => ({ 
              ...prev, 
              servicePlan: plan.id,
              pricePerReport: plan.id === 'per_report' ? 15000 : 0,
              monthlyFee: plan.id === 'monthly' ? 299900 : plan.id === 'annual' ? 2999000 : 0
            }))}
          >
            <CardHeader>
              <CardTitle className="text-light-gray font-mono text-lg flex items-center justify-between">
                {plan.name}
                {plan.recommended && (
                  <Badge className="bg-matrix/20 text-matrix border-matrix/30">
                    Recommended
                  </Badge>
                )}
              </CardTitle>
              <div className="space-y-1">
                <p className="text-2xl font-mono font-bold text-matrix">
                  {plan.price}
                </p>
                <p className="text-dim-gray font-mono text-sm">{plan.unit}</p>
                <p className="text-dim-gray text-sm">{plan.description}</p>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <CheckCircle className="h-4 w-4 text-matrix mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-dim-gray">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Setup Form */}
      <Card className="terminal-card border border-matrix/30">
        <CardHeader>
          <CardTitle className="text-light-gray font-mono text-lg">
            Service Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-mono text-dim-gray mb-2 block">
              Selected Plan
            </label>
            <div className="bg-terminal/50 p-3 rounded border border-matrix/20">
              <p className="text-light-gray font-mono">
                {pricingPlans.find(p => p.id === newService.servicePlan)?.name} - {' '}
                {pricingPlans.find(p => p.id === newService.servicePlan)?.price} {' '}
                {pricingPlans.find(p => p.id === newService.servicePlan)?.unit}
              </p>
            </div>
          </div>

          {newService.servicePlan === 'per_report' && (
            <div>
              <label className="text-sm font-mono text-dim-gray mb-2 block">
                Price per Report (USD)
              </label>
              <Input
                type="number"
                className="terminal-input"
                value={newService.pricePerReport / 100}
                onChange={(e) => setNewService(prev => ({ 
                  ...prev, 
                  pricePerReport: parseInt(e.target.value) * 100 || 0 
                }))}
                min={50}
                max={500}
              />
              <p className="text-xs text-dim-gray mt-1">
                Recommended: $150 per report
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-matrix/20">
            <h3 className="text-matrix font-mono text-sm mb-3">What happens next?</h3>
            <ol className="space-y-2 text-sm text-dim-gray">
              <li className="flex items-start">
                <span className="bg-matrix/20 text-matrix rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                Your triage service will be activated immediately
              </li>
              <li className="flex items-start">
                <span className="bg-matrix/20 text-matrix rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                A dedicated triage specialist will be assigned to your account
              </li>
              <li className="flex items-start">
                <span className="bg-matrix/20 text-matrix rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                All incoming vulnerability reports will be automatically triaged
              </li>
              <li className="flex items-start">
                <span className="bg-matrix/20 text-matrix rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">4</span>
                You'll receive detailed triage reports and recommendations
              </li>
            </ol>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleCreateService}
              disabled={createServiceMutation.isPending}
              className="glow-button"
            >
              {createServiceMutation.isPending ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Activating...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Activate Triage Service
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className="terminal-card border border-matrix/30">
        <CardHeader>
          <CardTitle className="text-light-gray font-mono text-lg">
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-matrix font-mono text-sm mb-1">
              What does the triage service include?
            </h4>
            <p className="text-dim-gray text-sm">
              Our experts validate each vulnerability report, assess its impact, categorize it by priority, 
              communicate with researchers for clarification, and provide you with detailed recommendations.
            </p>
          </div>
          <div>
            <h4 className="text-matrix font-mono text-sm mb-1">
              How quickly are reports triaged?
            </h4>
            <p className="text-dim-gray text-sm">
              Most reports are triaged within 24 hours. Critical vulnerabilities are prioritized and 
              reviewed within 4 hours.
            </p>
          </div>
          <div>
            <h4 className="text-matrix font-mono text-sm mb-1">
              Can I still communicate directly with researchers?
            </h4>
            <p className="text-dim-gray text-sm">
              Absolutely! Our service facilitates communication but you maintain full control. 
              You can participate in all conversations or let us handle them entirely.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
