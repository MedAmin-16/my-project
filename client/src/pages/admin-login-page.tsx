
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Loader2, Shield, Eye, EyeOff, ArrowLeft } from "lucide-react";
import MatrixBackground from "@/components/matrix-background";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const adminLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const [location, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: AdminLoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      toast({
        title: "Login successful",
        description: "Welcome to the admin panel",
        variant: "default",
      });

      navigate("/admin/dashboard");
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <MatrixBackground />
      <Link 
        to="/" 
        className="absolute top-4 left-4 text-matrix hover:text-matrix-dark flex items-center gap-2 z-20"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="text-sm">Back to Home</span>
      </Link>

      <div className="terminal-card w-full max-w-md p-6 rounded-lg relative overflow-hidden z-10">
        <div className="terminal-header mb-6"></div>

        <div className="text-center mb-6">
          <Shield className="h-12 w-12 text-matrix mx-auto mb-4" />
          <h1 className="text-matrix text-3xl font-mono font-bold mb-2">
            Admin_Panel
          </h1>
          <p className="text-dim-gray text-sm">
            Restricted Access Only
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-mono text-dim-gray">&gt; Email:</label>
            <input
              type="email"
              className="w-full bg-black/50 border border-primary/30 rounded px-3 py-2 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              style={{ color: 'white', caretColor: '#00ff00' }}
              {...form.register('email')}
              autoComplete="email"
            />
            {form.formState.errors.email && (
              <div className="text-alert-red text-xs">
                {form.formState.errors.email.message}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono text-dim-gray">&gt; Password:</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full bg-black/50 border border-primary/30 rounded px-3 py-2 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary pr-10"
                style={{ color: 'white', caretColor: '#00ff00' }}
                {...form.register('password')}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dim-gray hover:text-matrix"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <div className="text-alert-red text-xs">
                {form.formState.errors.password.message}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full glow-button"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                AUTHENTICATING...
              </span>
            ) : (
              "ACCESS ADMIN PANEL"
            )}
          </Button>
        </form>

        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-matrix/5 rounded-full blur-3xl"></div>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-electric-blue/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
