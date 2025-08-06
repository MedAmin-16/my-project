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
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Extended login schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
  userType: z.enum(["hacker", "company"]).default("hacker"),
});

// Extended registration schema for hackers
const registerHackerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
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
  companyWebsite: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
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
    registerMutation.mutate({
      username: data.username,
      password: data.password,
      email: data.email,
      userType: "company",
      companyName: data.companyName,
      companyWebsite: data.companyWebsite || undefined,
      companySize: data.companySize,
      companyIndustry: data.companyIndustry,
    }, {
      onSuccess: () => {
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
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-mono text-dim-gray">&gt; Username:</label>
                    <input
                      type="text"
                      className="w-full bg-black/50 border border-primary/30 rounded px-3 py-2 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white"
                      style={{ caretColor: '#00ff00' }}
                      {...loginForm.register('username')}
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
                        className="w-full bg-black/50 border border-primary/30 rounded px-3 py-2 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary pr-10 text-white"
                        style={{ caretColor: '#00ff00' }}
                        {...loginForm.register('password')}
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
                        {...loginForm.register('rememberMe')}
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

                </form>
              </TabsContent>

              <TabsContent value="company" className="mt-4">
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-mono text-dim-gray">&gt; Company Username:</label>
                    <input
                      type="text"
                      className="w-full bg-black/50 border border-primary/30 rounded px-3 py-2 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white"
                      style={{ caretColor: '#00ff00' }}
                      {...loginForm.register('username')}
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
                        className="w-full bg-black/50 border border-primary/30 rounded px-3 py-2 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary pr-10 text-white"
                        style={{ caretColor: '#00ff00' }}
                        {...loginForm.register('password')}
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
                        {...loginForm.register('rememberMe')}
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

                </form>
              </TabsContent>
            </>
          ) : (
            // Registration Forms
            <>
              <TabsContent value="hacker" className="mt-4">
                <form onSubmit={registerHackerForm.handleSubmit(onRegisterHackerSubmit)} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-mono text-dim-gray">&gt; Username:</label>
                    <input
                      type="text"
                      className="w-full bg-black/50 border border-primary/30 rounded px-3 py-2 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white"
                      style={{ caretColor: '#00ff00' }}
                      {...registerHackerForm.register('username')}
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
                      className="w-full bg-black/50 border border-primary/30 rounded px-3 py-2 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white"
                      style={{ caretColor: '#00ff00' }}
                      {...registerHackerForm.register('email')}
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
                        className="w-full bg-black/50 border border-primary/30 rounded px-3 py-2 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary pr-10 text-white"
                        style={{ caretColor: '#00ff00' }}
                        {...registerHackerForm.register('password')}
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
                        className="w-full bg-black/50 border border-primary/30 rounded px-3 py-2 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary pr-10 text-white"
                        style={{ caretColor: '#00ff00' }}
                        {...registerHackerForm.register('confirmPassword')}
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
                      {...registerHackerForm.register('termsAccepted')}
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

                </form>
              </TabsContent>

              <TabsContent value="company" className="mt-4">
                <form onSubmit={registerCompanyForm.handleSubmit(onRegisterCompanySubmit)} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-mono text-dim-gray">&gt; Company Name:</label>
                    <input
                      type="text"
                      className="w-full bg-black/50 border border-primary/30 rounded px-3 py-2 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white"
                      style={{ caretColor: '#00ff00' }}
                      {...registerCompanyForm.register('companyName')}
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
                      className="w-full bg-black/50 border border-primary/30 rounded px-3 py-2 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white"
                      style={{ caretColor: '#00ff00' }}
                      {...registerCompanyForm.register('username')}
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
                      className="w-full bg-black/50 border border-primary/30 rounded px-3 py-2 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white"
                      style={{ caretColor: '#00ff00' }}
                      {...registerCompanyForm.register('email')}
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
                    <label className="block text-xs font-mono text-dim-gray">&gt; Company Website (Optional):</label>
                    <input
                      type="url"
                      className="w-full bg-black/50 border border-primary/30 rounded px-3 py-2 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white"
                      style={{ caretColor: '#00ff00' }}
                      {...registerCompanyForm.register('companyWebsite')}
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
                        className="w-full bg-black/50 border border-primary/30 rounded px-3 py-2 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary pr-10 text-white"
                        style={{ caretColor: '#00ff00' }}
                        {...registerCompanyForm.register('password')}
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
                        className="w-full bg-black/50 border border-primary/30 rounded px-3 py-2 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary pr-10 text-white"
                        style={{ caretColor: '#00ff00' }}
                        {...registerCompanyForm.register('confirmPassword')}
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
                      {...registerCompanyForm.register('termsAccepted')}
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

                </form>
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