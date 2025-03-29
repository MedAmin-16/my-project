import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import MatrixBackground from "@/components/matrix-background";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, DollarSign, TargetIcon, Lock } from "lucide-react";

const programSchema = z.object({
  name: z.string().min(5, "Program name must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  rewardsRange: z.string().min(1, "Reward range is required"),
  status: z.string().default("active"),
  logo: z.string().optional(),
  isPrivate: z.boolean().default(false),
  scope: z.string().min(1, "Program scope is required")
});

type ProgramFormValues = z.infer<typeof programSchema>;

export default function CreateProgramPage() {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [_, setLocation] = useLocation();

  if (user && user.userType !== "company") {
    setLocation("/dashboard");
    return null;
  }

  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      name: "",
      description: "",
      rewardsRange: "$100 - $5,000",
      status: "active",
      isPrivate: false,
      scope: JSON.stringify({
        domains: [],
        assets: [],
        exclusions: []
      }, null, 2)
    }
  });

  const onSubmit = async (data: ProgramFormValues) => {
    setSubmitting(true);

    try {
      let parsedScope;
      try {
        parsedScope = JSON.parse(data.scope);
      } catch (e) {
        parsedScope = { domains: [], assets: [], exclusions: [] };
      }

      const programData = {
        ...data,
        scope: parsedScope
      };

      const response = await apiRequest("POST", "/api/company/programs", programData);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create program");
      }

      toast({
        title: "Program Created",
        description: "Your bug bounty program has been created successfully.",
      });

      setLocation("/dashboard");
    } catch (error) {
      console.error("Error creating program:", error);
      toast({
        title: "Failed to Create Program",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      <MatrixBackground className="opacity-20" />

      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        <h1 className="text-3xl font-bold tracking-tight text-matrix mb-2">Create Bug Bounty Program</h1>
        <p className="text-dim-gray mb-8">Set up a new bug bounty program for your organization</p>

        <Card className="bg-deep-black border-matrix/20">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Program Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. CyberHunt Main Program" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your program's goals and guidelines..."
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rewardsRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rewards Range</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. $100 - $5,000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scope"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Program Scope (JSON)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={`{
  "domains": ["*.example.com"],
  "assets": ["Web Application", "Mobile Apps"],
  "exclusions": ["*.test.example.com"]
}`}
                          className="min-h-[200px] font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Define the scope of your program in JSON format
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPrivate"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel>Private Program</FormLabel>
                        <FormDescription>
                          Only invited researchers can participate
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

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? "Creating Program..." : "Create Program"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}