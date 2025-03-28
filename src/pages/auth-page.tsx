import { useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Redirect } from "wouter";
import MatrixBackground from "../components/matrix-background";

// Form validation schemas
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Please enter a valid email"),
  reputation: z.number().default(0),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      reputation: 0,
    },
  });

  // Handle login form submission
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  // Handle register form submission
  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  // Redirect if user is already logged in
  if (user) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="flex min-h-screen bg-black text-green-500 relative">
      <MatrixBackground />
      
      {/* Authentication Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md cyber-container p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 cyber-text">CyberHunt</h1>
            <p className="font-mono">Secure Access Portal</p>
          </div>

          {/* Tab Selection */}
          <div className="flex mb-6 border-b border-green-700">
            <button
              className={`flex-1 py-2 font-mono ${
                activeTab === "login" ? "border-b-2 border-green-500 text-green-400" : "text-green-700"
              }`}
              onClick={() => setActiveTab("login")}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2 font-mono ${
                activeTab === "register" ? "border-b-2 border-green-500 text-green-400" : "text-green-700"
              }`}
              onClick={() => setActiveTab("register")}
            >
              Register
            </button>
          </div>

          {/* Login Form */}
          {activeTab === "login" && (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <div>
                <label htmlFor="login-username" className="block mb-1 font-mono">
                  Username
                </label>
                <input
                  id="login-username"
                  type="text"
                  {...loginForm.register("username")}
                  className="w-full p-2 bg-black border border-green-700 focus:border-green-500 rounded outline-none font-mono"
                  placeholder="Enter your username"
                />
                {loginForm.formState.errors.username && (
                  <p className="text-red-500 text-sm mt-1">
                    {loginForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="login-password" className="block mb-1 font-mono">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  {...loginForm.register("password")}
                  className="w-full p-2 bg-black border border-green-700 focus:border-green-500 rounded outline-none font-mono"
                  placeholder="Enter your password"
                />
                {loginForm.formState.errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full py-2 bg-green-600 hover:bg-green-700 text-black font-bold rounded transition-colors duration-300"
              >
                {loginMutation.isPending ? "Authenticating..." : "Login"}
              </button>
            </form>
          )}

          {/* Register Form */}
          {activeTab === "register" && (
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <div>
                <label htmlFor="register-username" className="block mb-1 font-mono">
                  Username
                </label>
                <input
                  id="register-username"
                  type="text"
                  {...registerForm.register("username")}
                  className="w-full p-2 bg-black border border-green-700 focus:border-green-500 rounded outline-none font-mono"
                  placeholder="Choose a username"
                />
                {registerForm.formState.errors.username && (
                  <p className="text-red-500 text-sm mt-1">
                    {registerForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="register-email" className="block mb-1 font-mono">
                  Email
                </label>
                <input
                  id="register-email"
                  type="email"
                  {...registerForm.register("email")}
                  className="w-full p-2 bg-black border border-green-700 focus:border-green-500 rounded outline-none font-mono"
                  placeholder="Enter your email"
                />
                {registerForm.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="register-password" className="block mb-1 font-mono">
                  Password
                </label>
                <input
                  id="register-password"
                  type="password"
                  {...registerForm.register("password")}
                  className="w-full p-2 bg-black border border-green-700 focus:border-green-500 rounded outline-none font-mono"
                  placeholder="Create a password"
                />
                {registerForm.formState.errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full py-2 bg-green-600 hover:bg-green-700 text-black font-bold rounded transition-colors duration-300"
              >
                {registerMutation.isPending ? "Creating Account..." : "Register"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <div className="hidden md:block md:w-1/2 bg-gradient-to-r from-black to-green-900/20 relative z-10">
        <div className="h-full flex flex-col justify-center p-12">
          <h2 className="text-4xl font-bold mb-6 cyber-text">
            Hunt Bugs. Secure Systems. Earn Rewards.
          </h2>
          <p className="text-xl mb-8 font-mono">
            Join our community of ethical hackers and security researchers to find and report
            vulnerabilities in real-world applications.
          </p>
          <ul className="space-y-4 font-mono">
            <li className="flex items-center">
              <span className="text-green-400 mr-2">&gt;</span>
              <span>Access exclusive bug bounty programs</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-400 mr-2">&gt;</span>
              <span>Build your reputation in the security community</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-400 mr-2">&gt;</span>
              <span>Get paid for valid vulnerability reports</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-400 mr-2">&gt;</span>
              <span>Improve your cybersecurity skills</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}