import { useAuth } from "../hooks/use-auth";
import { Link } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import MatrixBackground from "../components/matrix-background";

// Form validation schema
const submitBugSchema = z.object({
  programId: z.string().min(1, "Please select a program"),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  severity: z.string().min(1, "Please select a severity level"),
  stepsToReproduce: z.string().min(20, "Steps to reproduce must be at least 20 characters"),
  impact: z.string().min(20, "Impact must be at least 20 characters"),
});

type SubmitBugFormValues = z.infer<typeof submitBugSchema>;

export default function SubmitBugPage() {
  const { user, logoutMutation } = useAuth();

  // Mock data for programs
  const { data: programs } = useQuery({
    queryKey: ["/api/programs"],
    queryFn: () => Promise.resolve([
      { id: "1", name: "SecureBank Web App" },
      { id: "2", name: "CloudStore API" },
      { id: "3", name: "HealthTrack Mobile App" },
    ]),
    enabled: !!user,
  });

  // Form setup
  const form = useForm<SubmitBugFormValues>({
    resolver: zodResolver(submitBugSchema),
    defaultValues: {
      programId: "",
      title: "",
      description: "",
      severity: "",
      stepsToReproduce: "",
      impact: "",
    },
  });

  // Submit bug mutation
  const submitBugMutation = useMutation({
    mutationFn: async (data: SubmitBugFormValues) => {
      const res = await apiRequest("POST", "/api/submissions", {
        ...data,
        userId: user?.id,
        status: "pending",
        submittedAt: new Date().toISOString(),
      });
      return await res.json();
    },
    onSuccess: () => {
      // Reset form and invalidate queries
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/user/submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/activities"] });
    },
    onError: (error: Error) => {
      console.error("Failed to submit bug report:", error);
    },
  });

  // Handle form submission
  const onSubmit = (data: SubmitBugFormValues) => {
    submitBugMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-black text-green-500 relative">
      <MatrixBackground />
      
      {/* Navbar */}
      <nav className="bg-black/90 border-b border-green-800 p-4 sticky top-0 z-20">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/">
            <a className="text-2xl font-bold cyber-text">CyberHunt</a>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <a className="hover:text-green-400 transition-colors duration-200 font-mono">Dashboard</a>
            </Link>
            <Link href="/programs">
              <a className="hover:text-green-400 transition-colors duration-200 font-mono">Programs</a>
            </Link>
            <Link href="/submit">
              <a className="text-green-400 border-b border-green-400 pb-1 font-mono">Submit Bug</a>
            </Link>
            
            <div className="relative group">
              <button className="flex items-center space-x-1 hover:text-green-400 transition-colors duration-200 font-mono">
                <span>{user?.username}</span>
                <span>▼</span>
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-black border border-green-700 rounded shadow-lg py-1 hidden group-hover:block">
                <button
                  onClick={() => logoutMutation.mutate()}
                  className="block w-full text-left px-4 py-2 hover:bg-green-900/30 transition-colors duration-200 font-mono"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="container mx-auto p-6 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 cyber-text">Submit Vulnerability Report</h1>
          <p className="font-mono">Report a security vulnerability you've discovered.</p>
        </div>
        
        {/* Submission Form */}
        <div className="cyber-container p-6">
          {submitBugMutation.isSuccess ? (
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4 cyber-text">Report Submitted Successfully!</h2>
              <p className="font-mono mb-6">
                Thank you for your contribution to making the digital world more secure.
                Our team will review your submission and get back to you.
              </p>
              <div className="flex justify-center space-x-4">
                <Link href="/dashboard">
                  <a className="px-4 py-2 bg-green-600 hover:bg-green-700 text-black font-bold rounded transition-colors duration-300">
                    Back to Dashboard
                  </a>
                </Link>
                <button
                  onClick={() => {
                    submitBugMutation.reset();
                    form.reset();
                  }}
                  className="px-4 py-2 bg-green-900/30 hover:bg-green-900/50 border border-green-700 rounded transition-colors duration-300 font-mono"
                >
                  Submit Another Bug
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Program Selection */}
              <div>
                <label htmlFor="programId" className="block mb-1 font-mono">
                  Program <span className="text-red-500">*</span>
                </label>
                <select
                  id="programId"
                  {...form.register("programId")}
                  className="w-full p-2 bg-black border border-green-700 focus:border-green-500 rounded outline-none font-mono"
                >
                  <option value="">Select a program</option>
                  {programs?.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
                {form.formState.errors.programId && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.programId.message}
                  </p>
                )}
              </div>
              
              {/* Title */}
              <div>
                <label htmlFor="title" className="block mb-1 font-mono">
                  Vulnerability Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  {...form.register("title")}
                  className="w-full p-2 bg-black border border-green-700 focus:border-green-500 rounded outline-none font-mono"
                  placeholder="Brief title describing the vulnerability"
                />
                {form.formState.errors.title && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>
              
              {/* Severity */}
              <div>
                <label htmlFor="severity" className="block mb-1 font-mono">
                  Severity <span className="text-red-500">*</span>
                </label>
                <select
                  id="severity"
                  {...form.register("severity")}
                  className="w-full p-2 bg-black border border-green-700 focus:border-green-500 rounded outline-none font-mono"
                >
                  <option value="">Select severity level</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                {form.formState.errors.severity && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.severity.message}
                  </p>
                )}
              </div>
              
              {/* Description */}
              <div>
                <label htmlFor="description" className="block mb-1 font-mono">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  {...form.register("description")}
                  rows={5}
                  className="w-full p-2 bg-black border border-green-700 focus:border-green-500 rounded outline-none font-mono"
                  placeholder="Detailed description of the vulnerability"
                />
                {form.formState.errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>
              
              {/* Steps to Reproduce */}
              <div>
                <label htmlFor="stepsToReproduce" className="block mb-1 font-mono">
                  Steps to Reproduce <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="stepsToReproduce"
                  {...form.register("stepsToReproduce")}
                  rows={5}
                  className="w-full p-2 bg-black border border-green-700 focus:border-green-500 rounded outline-none font-mono"
                  placeholder="Step-by-step instructions to reproduce the vulnerability"
                />
                {form.formState.errors.stepsToReproduce && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.stepsToReproduce.message}
                  </p>
                )}
              </div>
              
              {/* Impact */}
              <div>
                <label htmlFor="impact" className="block mb-1 font-mono">
                  Business Impact <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="impact"
                  {...form.register("impact")}
                  rows={4}
                  className="w-full p-2 bg-black border border-green-700 focus:border-green-500 rounded outline-none font-mono"
                  placeholder="Describe the potential impact of this vulnerability"
                />
                {form.formState.errors.impact && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.impact.message}
                  </p>
                )}
              </div>
              
              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitBugMutation.isPending}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-black font-bold rounded transition-colors duration-300"
                >
                  {submitBugMutation.isPending ? "Submitting..." : "Submit Vulnerability Report"}
                </button>
              </div>
              
              <p className="text-xs text-green-700 font-mono">
                <span className="text-red-500">*</span> Required fields
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}