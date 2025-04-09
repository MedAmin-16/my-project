
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Mail, Terminal, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import MatrixBackground from "@/components/matrix-background";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setEmailSent(true);
        toast({
          title: "Reset link sent",
          description: "Please check your email for password reset instructions.",
        });
      } else {
        throw new Error("Failed to send reset link");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send password reset link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground />
      
      <div className="absolute top-4 left-4 z-20">
        <button onClick={() => setLocation("/auth")} className="flex items-center gap-2 text-matrix hover:text-matrix-dark transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-mono">Back to Login</span>
        </button>
      </div>

      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="terminal-card w-full max-w-md p-8 rounded-lg relative overflow-hidden border border-matrix/30">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-matrix/0 via-matrix/50 to-matrix/0"></div>
          
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-lg bg-matrix/10 border border-matrix/30 flex items-center justify-center">
                <Terminal className="h-6 w-6 text-matrix" />
              </div>
            </div>
            <h1 className="text-matrix text-3xl font-mono font-bold mb-2">Password Reset_</h1>
            <p className="text-dim-gray text-sm">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>

          {emailSent ? (
            <div className="space-y-6 text-center">
              <div className="p-4 rounded-lg bg-matrix/5 border border-matrix/30">
                <div className="flex justify-center mb-4">
                  <ShieldAlert className="h-8 w-8 text-matrix" />
                </div>
                <h2 className="text-matrix text-xl font-mono mb-2">Check Your Inbox</h2>
                <p className="text-dim-gray text-sm mb-4">
                  If an account exists with this email, you'll receive password reset instructions shortly.
                </p>
              </div>
              <Button 
                className="w-full bg-matrix/10 hover:bg-matrix/20 text-matrix border border-matrix/30"
                onClick={() => setEmailSent(false)}
              >
                Try Another Email
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-light-gray font-mono">Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type="email"
                            className="pl-10 bg-black/50 border-matrix/30 text-light-gray font-mono"
                            placeholder="Enter your email"
                            disabled={isLoading}
                          />
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dim-gray" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-alert-red text-xs" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-matrix/10 hover:bg-matrix/20 text-matrix border border-matrix/30"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      SENDING RESET LINK...
                    </span>
                  ) : (
                    "SEND RESET LINK"
                  )}
                </Button>
              </form>
            </Form>
          )}

          <div className="absolute bottom-0 right-0 w-32 h-32 bg-matrix/5 rounded-full blur-3xl"></div>
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-electric-blue/5 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}
