import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { Link } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Redirect, useLocation } from "wouter";
import { Loader2, Monitor, User, Eye, EyeOff, ArrowLeft, Github } from "lucide-react";
import { MatrixBackground } from "@/components/matrix-background";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Extended login schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
  userType: z.enum(["hacker", "company"]).default("hacker"), // User type (hacker or company)
});

// Extended registration schema for hackers
const registerHackerSchema = z.object({
  ...insertUserSchema.shape,
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Please enter a valid email address"),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
  userType: z.enum(["hacker", "company"]).default("hacker")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Extended registration schema for companies
const registerCompanySchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Please enter a valid email address"),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
  userType: z.enum(["hacker", "company"]).default("company"),
  companyName: z.string().min(2, "Company name is required"),
  companyWebsite: z.string().url("Please enter a valid URL").optional(),
  companySize: z.enum(["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"]),
  companyIndustry: z.enum([
    "Technology",
    "Finance",
    "Healthcare",
    "E-commerce",
    "Government",
    "Education",
    "Entertainment",
    "Travel",
    "Manufacturing",
    "Other"
  ])
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterHackerFormValues = z.infer<typeof registerHackerSchema>;
type RegisterCompanyFormValues = z.infer<typeof registerCompanySchema>;

export default function AuthPage() {
  const [location] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  // Initialize state after hooks
  const showRegisterForm = location.includes('mode=register');
  const initialMode = !showRegisterForm;
  const [isLogin, setIsLogin] = useState(initialMode);
  const [activeTab, setActiveTab] = useState<"hacker" | "company">("hacker");

  // Form for login
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
      userType: "hacker",
    },
  });

  // Form for hacker registration
  const registerHackerForm = useForm<RegisterHackerFormValues>({
    resolver: zodResolver(registerHackerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
      userType: "hacker",
    },
  });

  // Form for company registration
  const registerCompanyForm = useForm<RegisterCompanyFormValues>({
    resolver: zodResolver(registerCompanySchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
      userType: "company",
      companyName: "",
      companyWebsite: "",
      companySize: "1-10",
      companyIndustry: "Technology",
    },
  });

  // If user is already logged in, redirect to dashboard
  // This must be AFTER all hooks are called
  if (user) {
    return <Redirect to="/" />;
  }

  // Handle login form submission
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({
      username: data.username,
      password: data.password,
      userType: data.userType,
    });
  };

  // Handle hacker registration form submission
  const onRegisterHackerSubmit = (data: RegisterHackerFormValues) => {
    registerMutation.mutate({
      username: data.username,
      password: data.password,
      email: data.email,
      userType: "hacker",
    }, {
      onSuccess: () => {
        // Show a toast notification about email verification
        toast({
          title: "Registration successful!",
          description: "Please check your email to verify your account.",
          variant: "default",
        });
      }
    });
  };

  // Handle company registration form submission
  const onRegisterCompanySubmit = (data: RegisterCompanyFormValues) => {
    console.log("Registering company with data:", {
      username: data.username,
      email: data.email,
      userType: "company",
      companyName: data.companyName,
      companyWebsite: data.companyWebsite,
      companySize: data.companySize,
      companyIndustry: data.companyIndustry,
    });

    registerMutation.mutate({
      username: data.username,
      password: data.password,
      email: data.email,
      userType: "company",
      companyName: data.companyName,
      companyWebsite: data.companyWebsite,
      companySize: data.companySize,
      companyIndustry: data.companyIndustry,
    }, {
      onSuccess: () => {
        // Show a toast notification about email verification
        toast({
          title: "Company registration successful!",
          description: "Please check your email to verify your company account.",
          variant: "default",
        });
      }
    });
  };

  // Toggle between login and registration forms
  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  // Switch between hacker and company tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value as "hacker" | "company");
    if (isLogin) {
      loginForm.setValue("userType", value as "hacker" | "company");
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
          <h1 className="text-matrix text-3xl font-mono font-bold mb-2">
            {isLogin ? "CyberHunt_" : "Join_CyberHunt"}
          </h1>
          <p className="text-dim-gray text-sm">
            {isLogin ? "Elite Bug Bounty Platform" : "Create your account"}
          </p>
        </div>

        {/* Tabs for Hacker/Company selection */}
        <Tabs 
          defaultValue={activeTab} 
          onValueChange={handleTabChange}
          className="mb-6"
        >
          <TabsList className="grid w-full grid-cols-2 bg-black/30 border border-primary/20">
            <TabsTrigger 
              value="hacker" 
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-matrix"
            >
              <User className="mr-2 h-4 w-4" />
              Hacker
            </TabsTrigger>
            <TabsTrigger 
              value="company"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-matrix"
            >
              <Monitor className="mr-2 h-4 w-4" />
              Company
            </TabsTrigger>
          </TabsList>

          {isLogin ? (
            // Login Forms
            <>
              <TabsContent value="hacker" className="mt-4">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-mono text-dim-gray">&gt; Username:</label>
                      <input
                        type="text"
                        className="w-full bg-black/50 border border-primary/30 rounded px-3 py-2 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        style={{ color: 'white', caretColor: '#00ff00' }}
                        onChange={(e) => loginForm.setValue('username', e.target.value)}
                        autoComplete="username"
                      />
                      {loginForm.formState.errors.username && (
                        <div className="text-alert-red text-xs">
                          {loginForm.formState.errors.username.message}
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
                          onChange={(e) => loginForm.setValue('password', e.target.value)}
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
                      {loginForm.formState.errors.password && (
                        <div className="text-alert-red text-xs">
                          {loginForm.formState.errors.password.message}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="remember"
                          className="bg-terminal border border-matrix/50 rounded text-matrix focus:ring-matrix focus:ring-offset-0"
                          onChange={(e) => loginForm.setValue('rememberMe', e.target.checked)}
                        />
                        <label
                          htmlFor="remember"
                          className="text-xs font-mono text-dim-gray"
                        >
                          Remember me
                        </label>
                      </div>
                      <Link href="/forgot-password" className="text-xs font-mono text-matrix hover:text-matrix-dark">
                        Forgot password?
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      disabled={loginMutation.isPending}
                      className="w-full glow-button"
                    >
                      {loginMutation.isPending ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          AUTHENTICATING...
                        </span>
                      ) : (
                        "LOGIN AS HACKER"
                      )}
                    </Button>

                    {/* Social Login Divider */}
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-primary/30" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-black px-2 text-dim-gray">Or continue with</span>
                      </div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <a
                        href="/api/auth/google"
                        className="flex items-center justify-center px-4 py-2 border border-primary/30 rounded-md bg-black/50 hover:bg-primary/10 transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = '/api/auth/google';
                        }}
                      >
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </a>
                      <a
                        href="/api/auth/github"
                        className="flex items-center justify-center px-4 py-2 border border-primary/30 rounded-md bg-black/50 hover:bg-primary/10 transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = '/api/auth/github';
                        }}
                      >
                        <Github className="w-5 h-5 text-white" />
                      </a>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="company" className="mt-4">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-mono text-dim-gray">&gt; Company Username:</label>
                      <input
                        type="text"
                        className="w-full bg-black/50 border border-primary/30 rounded px-3 py-2 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        style={{ color: 'white', caretColor: '#00ff00' }}
                        onChange={(e) => loginForm.setValue('username', e.target.value)}
                        autoComplete="username"
                      />
                      {loginForm.formState.errors.username && (
                        <div className="text-alert-red text-xs">
                          {loginForm.formState.errors.username.message}
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
                          onChange={(e) => loginForm.setValue('password', e.target.value)}
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
                      {loginForm.formState.errors.password && (
                        <div className="text-alert-red text-xs">
                          {loginForm.formState.errors.password.message}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="remember-company"
                          className="bg-terminal border border-matrix/50 rounded text-matrix focus:ring-matrix focus:ring-offset-0"
                          onChange={(e) => loginForm.setValue('rememberMe', e.target.checked)}
                        />
                        <label
                          htmlFor="remember-company"
                          className="text-xs font-mono text-dim-gray"
                        >
                          Remember me
                        </label>
                      </div>
                      <Link href="/forgot-password" className="text-xs font-mono text-matrix hover:text-matrix-dark">
                        Forgot password?
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      disabled={loginMutation.isPending}
                      className="w-full glow-button"
                    >
                      {loginMutation.isPending ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          AUTHENTICATING...
                        </span>
                      ) : (
                        "LOGIN AS COMPANY"
                      )}
                    </Button>

                    {/* Social Login Divider */}
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-primary/30" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-black px-2 text-dim-gray">Or continue with</span>
                      </div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <a
                        href="/api/auth/google"
                        className="flex items-center justify-center px-4 py-2 border border-primary/30 rounded-md bg-black/50 hover:bg-primary/10 transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = '/api/auth/google';
                        }}
                      >
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </a>
                      <a
                        href="/api/auth/github"
                        className="flex items-center justify-center px-4 py-2 border border-primary/30 rounded-md bg-black/50 hover:bg-primary/10 transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = '/api/auth/github';
                        }}
                      >
                        <Github className="w-5 h-5 text-white" />
                      </a>
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </>
          ) : (
            // Registration Forms
            <>
              <TabsContent value="hacker" className="mt-4">
                <Form {...registerHackerForm}>
                  <form onSubmit={registerHackerForm.handleSubmit(onRegisterHackerSubmit)} className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-mono text-dim-gray">&gt; Username:</label>
                      <input
                        type="text"
                        className="w-full bg-black/50 border border-primary/30 rounded px-3 py-2 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        style={{ color: 'white', caretColor: '#00ff00' }}
                        onChange={(e) => registerHackerForm.setValue('username', e.target.value)}
                        autoComplete="username"
                      />
                      {registerHackerForm.formState.errors.username && (
                        <div className="text-alert-red text-xs">
                          {registerHackerForm.formState.errors.username.message}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-mono text-dim-gray">&gt; Email:</label>
                      <input
                        type="email"
                        className="w-full bg-black/50 border border-primary/30 rounded px-3 py-2 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        style={{ color: 'white', caretColor: '#00ff00' }}
                        onChange={(e) => registerHackerForm.setValue('email', e.target.value)}
                        autoComplete="email"
                      />
                      {registerHackerForm.formState.errors.email && (
                        <div className="text-alert-red text-xs">
                          {registerHackerForm.formState.errors.email.message}
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
                          onChange={(e) => registerHackerForm.setValue('password', e.target.value)}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-dim-gray hover:text-matrix"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {registerHackerForm.formState.errors.password && (
                        <div className="text-alert-red text-xs">
                          {registerHackerForm.formState.errors.password.message}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-mono text-dim-gray">&gt; Confirm Password:</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="w-full bg-black/50 border border-primary/30 rounded px-3 py-2 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary pr-10"
                          style={{ color: 'white', caretColor: '#00ff00' }}
                          onChange={(e) => registerHackerForm.setValue('confirmPassword', e.target.value)}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-dim-gray hover:text-matrix"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {registerHackerForm.formState.errors.confirmPassword && (
                        <div className="text-alert-red text-xs">
                          {registerHackerForm.formState.errors.confirmPassword.message}
                        </div>
                      )}
                    </div>

                    <div className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        id="terms-hacker"
                        className="mt-1 bg-terminal border border-matrix/50 rounded text-matrix focus:ring-matrix focus:ring-offset-0"
                        onChange={(e) => registerHackerForm.setValue('termsAccepted', e.target.checked)}
                      />
                      <div>
                        <label
                          htmlFor="terms-hacker"
                          className="text-xs font-mono text-dim-gray"
                        >
                          I agree to the{" "}
                          <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-matrix hover:text-matrix-dark">
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-matrix hover:text-matrix-dark">
                            Privacy Policy
                          </a>
                        </label>
                        {registerHackerForm.formState.errors.termsAccepted && (
                          <div className="text-alert-red text-xs mt-1">
                            {registerHackerForm.formState.errors.termsAccepted.message}
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={registerMutation.isPending}
                      className="w-full glow-button"
                    >
                      {registerMutation.isPending ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          CREATING ACCOUNT...
                        </span>
                      ) : (
                        "CREATE HACKER ACCOUNT"
                      )}
                    </Button>

                    {/* Social Login Divider */}
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-primary/30" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-black px-2 text-dim-gray">Or continue with</span>
                      </div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <a
                        href="/api/auth/google"
                        className="flex items-center justify-center px-4 py-2 border border-primary/30 rounded-md bg-black/50 hover:bg-primary/10 transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = '/api/auth/google';
                        }}
                      >
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.221 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </a>
                      <a
                        href="/api/auth/github"
                        className="flex items-center justify-center px-4 py-2 border border-primary/30 rounded-md bg-black/50 hover:bg-primary/10 transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = '/api/auth/github';
                        }}
                      >
                        <Github className="w-5 h-5 text-white" />
                      </a>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="company" className="mt-4">
                <Form {...registerCompanyForm}>
                  <form onSubmit={registerCompanyForm.handleSubmit(onRegisterCompanySubmit)} className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-mono text-dim-gray">&gt; Company Name:</label>
                      <input
                        type="text"
                        className="w-full bg-black/50 border border-primary/30 rounded px-3 py-2 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        style={{ color: 'white', caretColor: '#00ff00' }}
                        onChange={(e) => registerCompanyForm.setValue('companyName', e.target.value)}
                      />
                      {registerCompanyForm.formState.errors.companyName && (
                        <div className="text-alert-red text-xs">
                          {registerCompanyForm.formState.errors.companyName.message}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-mono text-dim-gray">&gt; Company Username:</label>
                      <input
                        type="text"
                        className="w-full bg-black/50 border border-primary/30 rounded px-3 py-2 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        style={{ color: 'white', caretColor: '#00ff00' }}
                        onChange={(e) => registerCompanyForm.setValue('username', e.target.value)}
                        autoComplete="username"
                      />
                      {registerCompanyForm.formState.errors.username && (
                        <div className="text-alert-red text-xs">
                          {registerCompanyForm.formState.errors.username.message}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-mono text-dim-gray">&gt; Email:</label>
                      <input
                        type="email"
                        className="w-full bg-black/50 border border-primary/30 rounded px-3 py-2 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        style={{ color: 'white', caretColor: '#00ff00' }}
                        onChange={(e) => registerCompanyForm.setValue('email', e.target.value)}
                        autoComplete="email"
                      />
                      {registerCompanyForm.formState.errors.email && (
                        <div className="text-alert-red text-xs">
                          {registerCompanyForm.formState.errors.email.message}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-mono text-dim-gray">&gt; Company Size:</label>
                        <Select onValueChange={(value) => registerCompanyForm.setValue('companySize', value as any)}>
                          <SelectTrigger className="w-full bg-black/50 border border-primary/30 text-white">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent className="bg-black/90 border border-primary/30 text-white">
                            <SelectItem value="1-10">1-10 employees</SelectItem>
                            <SelectItem value="11-50">11-50 employees</SelectItem>
                            <SelectItem value="51-200">51-200 employees</SelectItem>
                            <SelectItem value="201-500">201-500 employees</SelectItem>
                            <SelectItem value="501-1000">501-1000 employees</SelectItem>
                            <SelectItem value="1000+">1000+ employees</SelectItem>
                          </SelectContent>
                        </Select>
                        {registerCompanyForm.formState.errors.companySize && (
                          <div className="text-alert-red text-xs">
                            {registerCompanyForm.formState.errors.companySize.message}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-mono text-dim-gray">&gt; Industry:</label>
                        <Select onValueChange={(value) => registerCompanyForm.setValue('companyIndustry', value as any)}>
                          <SelectTrigger className="w-full bg-black/50 border border-primary/30 text-white">
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent className="bg-black/90 border border-primary/30 text-white">
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                            <SelectItem value="E-commerce">E-commerce</SelectItem>
                            <SelectItem value="Government">Government</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                            <SelectItem value="Entertainment">Entertainment</SelectItem>
                            <SelectItem value="Travel">Travel</SelectItem>
                            <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {registerCompanyForm.formState.errors.companyIndustry && (
                          <div className="text-alert-red text-xs">
                            {registerCompanyForm.formState.errors.companyIndustry.message}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-mono text-dim-gray">&gt; Company Website:</label>
                      <input
                        type="url"
                        className="w-full bg-black/50 border border-primary/30 rounded px-3 py-2 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        style={{ color: 'white', caretColor: '#00ff00' }}
                        onChange={(e) => registerCompanyForm.setValue('companyWebsite', e.target.value)}
                        placeholder="https://example.com"
                      />
                      {registerCompanyForm.formState.errors.companyWebsite && (
                        <div className="text-alert-red text-xs">
                          {registerCompanyForm.formState.errors.companyWebsite.message}
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
                          onChange={(e) => registerCompanyForm.setValue('password', e.target.value)}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-dim-gray hover:text-matrix"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {registerCompanyForm.formState.errors.password && (
                        <div className="text-alert-red text-xs">
                          {registerCompanyForm.formState.errors.password.message}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-mono text-dim-gray">&gt; Confirm Password:</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="w-full bg-black/50 border border-primary/30 rounded px-3 py-2 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary pr-10"
                          style={{ color: 'white', caretColor: '#00ff00' }}
                          onChange={(e) => registerCompanyForm.setValue('confirmPassword', e.target.value)}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-dim-gray hover:text-matrix"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {registerCompanyForm.formState.errors.confirmPassword && (
                        <div className="text-alert-red text-xs">
                          {registerCompanyForm.formState.errors.confirmPassword.message}
                        </div>
                      )}
                    </div>

                    <div className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        id="terms-company"
                        className="mt-1 bg-terminal border border-matrix/50 rounded text-matrix focus:ring-matrix focus:ring-offset-0"
                        onChange={(e) => registerCompanyForm.setValue('termsAccepted', e.target.checked)}
                      />
                      <div>
                        <label
                          htmlFor="terms-company"
                          className="text-xs font-mono text-dim-gray"
                        >
                          I agree to the{" "}
                          <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-matrix hover:text-matrix-dark">
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-matrix hover:text-matrix-dark">
                            Privacy Policy
                          </a>
                        </label>
                        {registerCompanyForm.formState.errors.termsAccepted && (
                          <div className="text-alert-red text-xs mt-1">
                            {registerCompanyForm.formState.errors.termsAccepted.message}
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={registerMutation.isPending}
                      className="w-full glow-button"
                    >
                      {registerMutation.isPending ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          CREATING COMPANY ACCOUNT...
                        </span>
                      ) : (
                        "CREATE COMPANY ACCOUNT"
                      )}
                    </Button>

                    {/* Social Login Divider */}
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-primary/30" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-black px-2 text-dim-gray">Or continue with</span>
                      </div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <a
                        href="/api/auth/google"
                        className="flex items-center justify-center px-4 py-2 border border-primary/30 rounded-md bg-black/50 hover:bg-primary/10 transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = '/api/auth/google';
                        }}
                      >
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </a>
                      <a
                        href="/api/auth/github"
                        className="flex items-center justify-center px-4 py-2 border border-primary/30 rounded-md bg-black/50 hover:bg-primary/10 transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = '/api/auth/github';
                        }}
                      >
                        <Github className="w-5 h-5 text-white" />
                      </a>
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </>
          )}
        </Tabs>

        <div className="text-center text-xs font-mono text-dim-gray mt-6">
          {isLogin ? "New to CyberHunt? " : "Already have an account? "}
          <button
            type="button"
            onClick={toggleForm}
            className="text-matrix hover:text-matrix-dark"
          >
            {isLogin ? "Register now" : "Login"}
          </button>
        </div>

        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-matrix/5 rounded-full blur-3xl"></div>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-electric-blue/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
// Removed Microsoft social login button from all login and registration forms.