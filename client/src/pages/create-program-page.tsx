import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
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
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  DollarSign,
  TargetIcon,
  FileIcon,
  ImageIcon,
  CheckCircle,
  InfoIcon,
  Lock,
} from "lucide-react";

// Create a schema for program creation
const programSchema = z.object({
  name: z.string().min(5, "Program name must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  rewardsRange: z.string().min(1, "Reward range is required"),
  status: z.string().optional(),
  logo: z.string().optional(),
  isPrivate: z.boolean().optional(),
  scope: z.any() // Using any since scope is JSON
});

type ProgramFormValues = z.infer<typeof programSchema>;

export default function CreateProgramPage() {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  
  // Redirect if not a company user
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
      }, null, 2),
    },
  });

  const onSubmit = async (data: ProgramFormValues) => {
    setSubmitting(true);
    
    try {
      // Ensure scope is a JSON object
      let parsedScope;
      try {
        parsedScope = JSON.parse(data.scope as string);
      } catch (e) {
        parsedScope = { domains: [], assets: [], exclusions: [] };
      }

      // Create the program data
      const programData = {
        ...data,
        scope: parsedScope
      };
      
      // Submit to create program API
      const response = await apiRequest(
        "POST",
        "/api/company/programs",
        programData
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create program");
      }
      
      const result = await response.json();
      
      toast({
        title: "Program Created",
        description: "Your bug bounty program has been created successfully.",
        variant: "default",
      });
      
      // Navigate to the company dashboard
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
    <div className="flex flex-col space-y-6 p-6 bg-black min-h-screen text-white">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-matrix">Create Bug Bounty Program</h1>
        <p className="text-dim-gray">
          Set up a new bug bounty program for your organization
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-black border border-matrix/20">
            <CardHeader>
              <CardTitle>Program Details</CardTitle>
              <CardDescription>
                Provide information about your bug bounty program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-matrix">Program Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. Company Security Bug Bounty" 
                            className="bg-background/5 border-matrix/20 focus:border-matrix text-white" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          The name of your bug bounty program.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-matrix">Program Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the purpose, goals, and focus of your bug bounty program..." 
                            className="bg-background/5 border-matrix/20 focus:border-matrix text-white min-h-[150px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Provide detailed information about what researchers should focus on.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="rewardsRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-matrix">Reward Range</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. $100 - $5,000" 
                              className="bg-background/5 border-matrix/20 focus:border-matrix text-white" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            The range of rewards you offer for vulnerabilities.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-matrix">Program Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-background/5 border-matrix/20 focus:border-matrix text-white">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-black border-matrix/20">
                              <SelectItem value="active" className="text-green-500">Active</SelectItem>
                              <SelectItem value="paused" className="text-yellow-500">Paused</SelectItem>
                              <SelectItem value="closed" className="text-red-500">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The current status of the program.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="logo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-matrix">Logo URL (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/logo.png" 
                            className="bg-background/5 border-matrix/20 focus:border-matrix text-white" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          URL to your company logo (use a square image for best results).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isPrivate"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-matrix/20 p-4">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 accent-matrix"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-matrix flex items-center">
                            <Lock className="mr-2 h-4 w-4" />
                            Private Program
                          </FormLabel>
                          <FormDescription>
                            If enabled, your program will only be visible to invited researchers.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="scope"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-matrix">Program Scope (JSON)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder='{ "domains": ["example.com"], "assets": ["Web application"], "exclusions": ["Third-party services"] }' 
                            className="bg-background/5 border-matrix/20 focus:border-matrix text-white font-mono min-h-[200px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Define the scope of your program in JSON format.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-4 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="border-matrix/30 hover:bg-matrix/20 hover:text-matrix"
                      onClick={() => setLocation("/dashboard")}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="glow-button" 
                      disabled={submitting}
                    >
                      {submitting ? "Creating..." : "Create Program"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-black border border-matrix/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <InfoIcon className="mr-2 h-5 w-5 text-matrix" />
                Program Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="flex items-center text-sm font-semibold">
                  <Shield className="mr-2 h-4 w-4 text-matrix" />
                  Define Clear Scope
                </h3>
                <p className="text-xs text-dim-gray">
                  Clearly specify what assets are in-scope and out-of-scope to avoid confusion.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="flex items-center text-sm font-semibold">
                  <DollarSign className="mr-2 h-4 w-4 text-matrix" />
                  Set Fair Rewards
                </h3>
                <p className="text-xs text-dim-gray">
                  Competitive rewards attract skilled researchers. Consider tiered rewards based on severity.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="flex items-center text-sm font-semibold">
                  <TargetIcon className="mr-2 h-4 w-4 text-matrix" />
                  Be Specific
                </h3>
                <p className="text-xs text-dim-gray">
                  Detailed descriptions help researchers understand exactly what you're looking for.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="flex items-center text-sm font-semibold">
                  <FileIcon className="mr-2 h-4 w-4 text-matrix" />
                  Documentation
                </h3>
                <p className="text-xs text-dim-gray">
                  Provide necessary documentation to help researchers understand your systems.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="flex items-center text-sm font-semibold">
                  <CheckCircle className="mr-2 h-4 w-4 text-matrix" />
                  Response Time
                </h3>
                <p className="text-xs text-dim-gray">
                  Fast responses to submissions improve researcher satisfaction and program reputation.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border border-matrix/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ImageIcon className="mr-2 h-5 w-5 text-matrix" />
                JSON Scope Example
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-black/30 p-4 rounded-md text-xs overflow-x-auto text-matrix/80 border border-matrix/20">
{`{
  "domains": [
    "example.com",
    "api.example.com"
  ],
  "assets": [
    "Web Application",
    "Mobile API",
    "Admin Portal"
  ],
  "exclusions": [
    "Third-party services",
    "Denial of Service",
    "Physical attacks"
  ]
}`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}