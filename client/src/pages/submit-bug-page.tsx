import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { insertSubmissionSchema, Program } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { BugPriceEstimator } from "@/components/bug-price-estimator";
import { z } from "zod";
import { Redirect } from "wouter";
import { Loader2, Send, AlertTriangle, Bug } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MatrixBackground } from "@/components/matrix-background";
import { Navbar } from "@/components/layout/navbar";
import { useToast } from "@/hooks/use-toast";
import { BugReportTemplates } from "@/components/bug-report-templates";
import { AIReportEnhancer } from "@/components/ai-report-enhancer";
import { VulnerabilityGradingForm } from "@/components/vulnerability-grading-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Extended submission schema with validation
const submitBugSchema = insertSubmissionSchema.extend({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  type: z.string().min(1, "Please select a bug type"),
  severity: z.string().min(1, "Please select a severity level"),
  programId: z.number().min(1, "Please select a program"),
});

type SubmitBugFormValues = z.infer<typeof submitBugSchema>;

export default function SubmitBugPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fetch available programs
  const {
    data: programs,
    isLoading: programsLoading,
    error: programsError
  } = useQuery<Program[]>({
    queryKey: ["/api/programs"],
  });

  // Bug submission form
  const form = useForm<SubmitBugFormValues>({
    resolver: zodResolver(submitBugSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "",
      severity: "",
      programId: undefined,
    },
  });

  // Submission mutation
  const submitMutation = useMutation({
    mutationFn: async (data: SubmitBugFormValues) => {
      const res = await apiRequest("POST", "/api/submissions", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Bug report submitted",
        description: "Your bug has been successfully submitted for review.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      setIsSubmitted(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle applying a template to the description field
  const handleTemplateSelect = (template: string) => {
    form.setValue("description", template);
  };

  // Handle form submission
  const onSubmit = (data: SubmitBugFormValues) => {
    submitMutation.mutate(data);
  };

  // If a bug was just submitted, redirect to dashboard
  if (isSubmitted) {
    return <Redirect to="/" />;
  }

  // Bug type options
  const bugTypes = [
    "Cross-Site Scripting (XSS)",
    "SQL Injection",
    "Cross-Site Request Forgery (CSRF)",
    "Remote Code Execution (RCE)",
    "Authentication Bypass",
    "Authorization Bypass",
    "Information Disclosure",
    "Server-Side Request Forgery (SSRF)",
    "XML External Entity (XXE)",
    "Open Redirect",
    "Business Logic Vulnerability",
    "Other"
  ];

  // Severity levels
  const severityLevels = [
    "Critical",
    "High",
    "Medium",
    "Low",
    "Info"
  ];

  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground />

      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-2xl font-mono font-bold text-light-gray mb-2">Submit Bug Report</h1>
          <p className="text-dim-gray font-mono">
            Report a security vulnerability you've discovered and get rewarded.
          </p>
        </div>

        {/* Vulnerability Grading Tool */}
        <div className="mb-8">
          <VulnerabilityGradingForm />
        </div>

        <div className="terminal-card p-6 rounded-lg">
          {programsLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-matrix" />
            </div>
          ) : programsError ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-alert-red mx-auto mb-4" />
              <p className="text-alert-red font-mono">Failed to load programs</p>
              <p className="text-dim-gray font-mono mt-2">Please try again later</p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="programId"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="block text-sm font-mono text-dim-gray">Target Program</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value?.toString() || ""}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <SelectTrigger className="terminal-input">
                            <SelectValue placeholder="Select a program" />
                          </SelectTrigger>
                          <SelectContent className="bg-terminal border border-primary/30">
                            {programs?.map((program) => (
                              <SelectItem key={program.id} value={program.id.toString()}>
                                {program.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="text-alert-red text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="block text-sm font-mono text-dim-gray">Bug Title</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="terminal-input w-full"
                          placeholder="e.g. XSS in search functionality"
                        />
                      </FormControl>
                      <FormMessage className="text-alert-red text-xs" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="block text-sm font-mono text-dim-gray">Bug Type</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="terminal-input">
                              <SelectValue placeholder="Select bug type" />
                            </SelectTrigger>
                            <SelectContent className="bg-terminal border border-primary/30">
                              {bugTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage className="text-alert-red text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="severity"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="block text-sm font-mono text-dim-gray">Severity</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="terminal-input">
                              <SelectValue placeholder="Select severity" />
                            </SelectTrigger>
                            <SelectContent className="bg-terminal border border-primary/30">
                              {severityLevels.map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage className="text-alert-red text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4 mb-4">
                  <BugReportTemplates onSelectTemplate={handleTemplateSelect} />
                  <BugPriceEstimator 
                    bugType={form.getValues("type")}
                    severity={form.getValues("severity")}
                    programId={parseInt(form.getValues("programId"))}
                  />
                  <AIReportEnhancer
                    currentReport={{
                      title: form.getValues("title"),
                      type: form.getValues("type"),
                      severity: form.getValues("severity"),
                      description: form.getValues("description")
                    }}
                    onEnhancedReport={(enhanced) => {
                      form.setValue("title", enhanced.title);
                      form.setValue("type", enhanced.type);
                      form.setValue("severity", enhanced.severity);
                      form.setValue("description", enhanced.description);
                    }}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="block text-sm font-mono text-dim-gray">Detailed Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="terminal-input w-full min-h-[200px]"
                          placeholder="Describe the vulnerability in detail. Include steps to reproduce, affected components, and potential impact."
                        />
                      </FormControl>
                      <FormMessage className="text-alert-red text-xs" />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="glow-button flex items-center"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        SUBMITTING...
                      </>
                    ) : (
                      <>
                        <Bug className="mr-2 h-4 w-4" />
                        SUBMIT BUG REPORT
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </main>
    </div>
  );
}
