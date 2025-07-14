import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Loader2, Shield, Eye, EyeOff, ArrowLeft, Terminal, Lock } from "lucide-react";
import { MatrixBackground } from "@/components/matrix-background";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const adminLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export default function SimpleAdminLogin() {
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormValues>({
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
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      // Store the admin token in localStorage for API calls
      if (result.token) {
        localStorage.setItem('adminToken', result.token);
      }

      toast({
        title: "Access Granted",
        description: "Welcome to the cyber command center",
      });

      navigate("/admin/dashboard");
    } catch (error) {
      toast({
        title: "Access Denied",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center p-4 relative overflow-hidden">
      <MatrixBackground />
      
      {/* Back button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 text-matrix hover:text-matrix/80 flex items-center gap-2 z-20 transition-colors duration-300"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="text-sm font-mono">BACK_TO_HOME</span>
      </Link>

      {/* Main login container */}
      <div className="w-full max-w-md relative z-10">
        {/* Glowing effects */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-matrix/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-matrix/10 rounded-full blur-3xl animate-pulse"></div>
        
        {/* Login card */}
        <div className="relative bg-terminal/90 backdrop-blur-sm border border-matrix/30 rounded-lg p-8 shadow-2xl">
          {/* Animated border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-matrix/0 via-matrix/20 to-matrix/0 rounded-lg">
            <div className="absolute inset-[1px] bg-terminal/90 rounded-lg"></div>
          </div>
          
          <div className="relative z-10">
            {/* Header section */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-matrix/30 rounded-full blur-xl"></div>
                  <div className="relative h-16 w-16 bg-terminal border-2 border-matrix rounded-full flex items-center justify-center">
                    <Shield className="h-8 w-8 text-matrix" />
                  </div>
                </div>
              </div>
              
              <h1 className="text-4xl font-mono font-bold text-matrix mb-2 tracking-wider">
                CYBER HUNT
              </h1>
              <h2 className="text-2xl font-mono font-bold text-light-gray mb-3 tracking-wide">
                ADMIN PANEL
              </h2>
              <div className="flex items-center justify-center gap-2 text-matrix/70 text-sm font-mono">
                <Lock className="h-4 w-4" />
                <span>RESTRICTED_ACCESS_ONLY</span>
              </div>
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email field */}
              <div className="space-y-2">
                <label className="block text-matrix text-sm font-mono tracking-wide">
                  &gt; EMAIL_ADDRESS
                </label>
                <div className="relative">
                  <input
                    type="email"
                    className="w-full bg-terminal/50 border border-matrix/30 rounded px-4 py-3 font-mono text-light-gray placeholder-dim-gray focus:outline-none focus:border-matrix focus:ring-2 focus:ring-matrix/30 transition-all duration-300"
                    placeholder="admin@cyberhunt.com"
                    style={{ caretColor: '#00ff00' }}
                    {...register('email')}
                    autoComplete="email"
                  />
                  <div className="absolute inset-0 border border-matrix/20 rounded pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                {errors.email && (
                  <div className="text-alert-red text-xs font-mono flex items-center gap-1">
                    <span>&gt;</span>
                    {errors.email.message}
                  </div>
                )}
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <label className="block text-matrix text-sm font-mono tracking-wide">
                  &gt; PASSWORD
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full bg-terminal/50 border border-matrix/30 rounded px-4 py-3 pr-12 font-mono text-light-gray placeholder-dim-gray focus:outline-none focus:border-matrix focus:ring-2 focus:ring-matrix/30 transition-all duration-300"
                    placeholder="••••••••••••"
                    style={{ caretColor: '#00ff00' }}
                    {...register('password')}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dim-gray hover:text-matrix transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <div className="text-alert-red text-xs font-mono flex items-center gap-1">
                    <span>&gt;</span>
                    {errors.password.message}
                  </div>
                )}
              </div>

              {/* Login button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-matrix/10 hover:bg-matrix/20 border-2 border-matrix text-matrix font-mono text-lg py-3 rounded transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed tracking-wider"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      AUTHENTICATING...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Terminal className="mr-3 h-5 w-5" />
                      INITIATE_LOGIN
                    </span>
                  )}
                </Button>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-xs font-mono">
                UNAUTHORIZED_ACCESS_PROHIBITED
              </p>
              <div className="flex justify-center mt-2">
                <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-green-400/50 to-transparent"></div>
              </div>
            </div>

            {/* Credentials hint for testing */}
            <div className="mt-6 p-4 bg-green-400/5 border border-green-400/20 rounded text-center">
              <p className="text-green-400/80 text-xs font-mono mb-2">DEFAULT CREDENTIALS:</p>
              <p className="text-white text-xs font-mono">Email: admin@cyberhunt.com</p>
              <p className="text-white text-xs font-mono">Password: AdminSecure123!</p>
            </div>
          </div>
        </div>

        {/* Scanning line effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-green-400/60 to-transparent animate-pulse"></div>
        </div>
      </div>

      {/* Additional matrix effects */}
      <div className="absolute top-1/4 left-10 w-1 h-32 bg-gradient-to-b from-green-400/0 via-green-400/40 to-green-400/0 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-10 w-1 h-24 bg-gradient-to-b from-green-400/0 via-green-400/40 to-green-400/0 animate-pulse"></div>
    </div>
  );
}