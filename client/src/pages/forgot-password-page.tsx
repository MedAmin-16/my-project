
import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail, Terminal, Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MatrixBackground } from "@/components/matrix-background";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error();
      
      setEmailSent(true);
      toast({
        title: "Reset Link Sent",
        description: "Check your email for password reset instructions.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reset link. Please try again.",
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
        <button 
          onClick={() => setLocation("/auth")} 
          className="flex items-center gap-2 text-matrix hover:text-matrix-dark transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-mono">Back to Login</span>
        </button>
      </div>

      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md p-8 rounded-lg relative overflow-hidden border border-matrix/30 bg-black/80 backdrop-blur-sm">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-matrix/0 via-matrix/50 to-matrix/0" />
          
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
              <div className="p-6 rounded-lg bg-matrix/5 border border-matrix/30">
                <Mail className="h-8 w-8 text-matrix mx-auto mb-4" />
                <h2 className="text-matrix text-xl font-mono mb-2">Check Your Inbox</h2>
                <p className="text-dim-gray text-sm">
                  If an account exists with this email, you'll receive password reset instructions shortly.
                </p>
              </div>
              <Button 
                onClick={() => setEmailSent(false)}
                className="w-full bg-matrix/10 hover:bg-matrix/20 text-matrix border border-matrix/30"
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
        </div>
      </div>
    </div>
  );
}
