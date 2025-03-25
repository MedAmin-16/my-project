import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import MatrixBackground from "@/components/matrix-background";
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

// Extended login schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

// Extended registration schema
const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Please enter a valid email address"),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user, loginMutation, registerMutation } = useAuth();
  
  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Redirect to="/" />;
  }

  // Form for login
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  // Form for registration
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });

  // Handle login form submission
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({
      username: data.username,
      password: data.password,
    });
  };

  // Handle registration form submission
  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate({
      username: data.username,
      password: data.password,
      email: data.email,
    });
  };

  // Toggle between login and registration forms
  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <MatrixBackground />
      
      <div className="terminal-card w-full max-w-md p-6 rounded-lg relative overflow-hidden z-10">
        <div className="terminal-header mb-6"></div>
        
        <div className="text-center mb-8">
          <h1 className="text-matrix text-3xl font-mono font-bold mb-2">
            {isLogin ? "CyberHunt_" : "Join_CyberHunt"}
          </h1>
          <p className="text-dim-gray text-sm">
            {isLogin ? "Elite Bug Bounty Platform" : "Create your hacker identity"}
          </p>
        </div>
        
        {isLogin ? (
          // Login Form
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
              <FormField
                control={loginForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="block text-xs font-mono text-dim-gray">&gt; Username:</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="terminal-input w-full"
                        autoComplete="username"
                      />
                    </FormControl>
                    <FormMessage className="text-alert-red text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="block text-xs font-mono text-dim-gray">&gt; Password:</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        className="terminal-input w-full"
                        autoComplete="current-password"
                      />
                    </FormControl>
                    <FormMessage className="text-alert-red text-xs" />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-between items-center">
                <FormField
                  control={loginForm.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="remember"
                          className="bg-terminal border border-matrix/50 rounded text-matrix focus:ring-matrix focus:ring-offset-0"
                        />
                      </FormControl>
                      <label
                        htmlFor="remember"
                        className="text-xs font-mono text-dim-gray"
                      >
                        Remember me
                      </label>
                    </FormItem>
                  )}
                />
                <a href="#" className="text-xs font-mono text-matrix hover:text-matrix-dark">
                  Forgot password?
                </a>
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
                  "LOGIN TO SYSTEM"
                )}
              </Button>
              
              <div className="text-center text-xs font-mono text-dim-gray">
                New to CyberHunt?{" "}
                <button
                  type="button"
                  onClick={toggleForm}
                  className="text-matrix hover:text-matrix-dark"
                >
                  Register now
                </button>
              </div>
            </form>
          </Form>
        ) : (
          // Registration Form
          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
              <FormField
                control={registerForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="block text-xs font-mono text-dim-gray">&gt; Username:</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="terminal-input w-full"
                        autoComplete="username"
                      />
                    </FormControl>
                    <FormMessage className="text-alert-red text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="block text-xs font-mono text-dim-gray">&gt; Email:</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        className="terminal-input w-full"
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage className="text-alert-red text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="block text-xs font-mono text-dim-gray">&gt; Password:</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        className="terminal-input w-full"
                        autoComplete="new-password"
                      />
                    </FormControl>
                    <FormMessage className="text-alert-red text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={registerForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="block text-xs font-mono text-dim-gray">&gt; Confirm Password:</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        className="terminal-input w-full"
                        autoComplete="new-password"
                      />
                    </FormControl>
                    <FormMessage className="text-alert-red text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={registerForm.control}
                name="termsAccepted"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="terms"
                        className="mt-1 bg-terminal border border-matrix/50 rounded text-matrix focus:ring-matrix focus:ring-offset-0"
                      />
                    </FormControl>
                    <label
                      htmlFor="terms"
                      className="text-xs font-mono text-dim-gray"
                    >
                      I agree to the{" "}
                      <a href="#" className="text-matrix hover:text-matrix-dark">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-matrix hover:text-matrix-dark">
                        Privacy Policy
                      </a>
                    </label>
                    <FormMessage className="text-alert-red text-xs" />
                  </FormItem>
                )}
              />
              
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
                  "CREATE ACCOUNT"
                )}
              </Button>
              
              <div className="text-center text-xs font-mono text-dim-gray">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={toggleForm}
                  className="text-matrix hover:text-matrix-dark"
                >
                  Login
                </button>
              </div>
            </form>
          </Form>
        )}
        
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-matrix/5 rounded-full blur-3xl"></div>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-electric-blue/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
