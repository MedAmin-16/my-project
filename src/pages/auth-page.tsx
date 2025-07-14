import React, { useState } from 'react';
import { useLocation, Redirect } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Eye, EyeOff, User, Mail, Terminal, ShieldCheck } from 'lucide-react';

import { useAuth } from '../hooks/use-auth';
import { insertUserSchema } from '../../shared/schema';
import MatrixBackground from '../components/matrix-background';

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Registration form schema with extended validation
const registerSchema = insertUserSchema
  .extend({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [location] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Registration form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  // If the user is already logged in, redirect to dashboard
  if (user) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <MatrixBackground />
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center space-x-2">
          <Terminal className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold neon-text">CyberHunt</span>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col md:flex-row relative z-10">
        {/* Form Section */}
        <div className="w-full md:w-1/2 p-4 md:p-8 flex items-center justify-center">
          <div className="cyber-card w-full max-w-md p-6 md:p-8 scanner">
            <div className="mb-8 flex justify-center">
              <h2 className="text-2xl md:text-3xl font-bold terminal-text">
                {isLogin ? 'Access Portal' : 'New Identity'}
              </h2>
            </div>
            
            {/* Login Form */}
            {isLogin ? (
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <User className="h-4 w-4 mr-2 text-primary" />
                      <label htmlFor="login-username" className="text-sm font-medium">
                        Username
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        id="login-username"
                        type="text"
                        className="cyber-input"
                        placeholder="Enter your username"
                        {...loginForm.register('username')}
                      />
                    </div>
                    {loginForm.formState.errors.username && (
                      <p className="mt-1 text-sm text-red-500">
                        {loginForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <Lock className="h-4 w-4 mr-2 text-primary" />
                      <label htmlFor="login-password" className="text-sm font-medium">
                        Password
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        className="cyber-input pr-10"
                        placeholder="Enter your password"
                        {...loginForm.register('password')}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="mt-1 text-sm text-red-500">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="cyber-button w-full py-2 flex items-center justify-center"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <div className="cyber-loading h-5 w-5 mr-2" />
                  ) : (
                    <ShieldCheck className="mr-2 h-5 w-5" />
                  )}
                  {loginMutation.isPending ? 'Authenticating...' : 'Access System'}
                </button>
                
                <div className="text-center mt-4">
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline"
                    onClick={() => setIsLogin(false)}
                  >
                    Need an account? Register
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <User className="h-4 w-4 mr-2 text-primary" />
                      <label htmlFor="register-username" className="text-sm font-medium">
                        Username
                      </label>
                    </div>
                    <input
                      id="register-username"
                      type="text"
                      className="cyber-input"
                      placeholder="Choose a username"
                      {...registerForm.register('username')}
                    />
                    {registerForm.formState.errors.username && (
                      <p className="mt-1 text-sm text-red-500">
                        {registerForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <Mail className="h-4 w-4 mr-2 text-primary" />
                      <label htmlFor="register-email" className="text-sm font-medium">
                        Email
                      </label>
                    </div>
                    <input
                      id="register-email"
                      type="email"
                      className="cyber-input"
                      placeholder="Enter your email"
                      {...registerForm.register('email')}
                    />
                    {registerForm.formState.errors.email && (
                      <p className="mt-1 text-sm text-red-500">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <Lock className="h-4 w-4 mr-2 text-primary" />
                      <label htmlFor="register-password" className="text-sm font-medium">
                        Password
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        className="cyber-input pr-10"
                        placeholder="Create a strong password"
                        {...registerForm.register('password')}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {registerForm.formState.errors.password && (
                      <p className="mt-1 text-sm text-red-500">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <Lock className="h-4 w-4 mr-2 text-primary" />
                      <label htmlFor="register-confirm-password" className="text-sm font-medium">
                        Confirm Password
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        id="register-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="cyber-input pr-10"
                        placeholder="Confirm your password"
                        {...registerForm.register('confirmPassword')}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">
                        {registerForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="cyber-button w-full py-2 flex items-center justify-center"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <div className="cyber-loading h-5 w-5 mr-2" />
                  ) : (
                    <ShieldCheck className="mr-2 h-5 w-5" />
                  )}
                  {registerMutation.isPending ? 'Creating Identity...' : 'Create Identity'}
                </button>
                
                <div className="text-center mt-4">
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline"
                    onClick={() => setIsLogin(true)}
                  >
                    Already have an account? Login
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        
        {/* Hero Section */}
        <div className="w-full md:w-1/2 bg-black/40 p-6 md:p-12 flex items-center relative overflow-hidden">
          <div className="relative z-10 max-w-lg mx-auto">
            <h1 className="glitch text-3xl md:text-4xl lg:text-5xl font-bold mb-6" data-text="Join CyberHunt">
              Join CyberHunt
            </h1>
            <div className="mb-8">
              <p className="text-lg mb-4 terminal-text typing-text">
                Enter the world of ethical hacking
              </p>
              <p className="text-gray-300 mb-3">
                Find vulnerabilities in real applications and earn rewards for your skills. 
                Join our community of security researchers making the digital world safer.
              </p>
              <p className="text-gray-300">
                Whether you're a seasoned security professional or just starting out, 
                CyberHunt offers a platform to showcase your talents and build your reputation.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="h-8 w-8 rounded-full bg-black border border-primary flex items-center justify-center mr-3 mt-1 neon-border">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold neon-text">Secure Platform</h3>
                  <p className="text-gray-300">End-to-end encrypted communications and secure submission handling</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="h-8 w-8 rounded-full bg-black border border-primary flex items-center justify-center mr-3 mt-1 neon-border">
                  <Terminal className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold neon-text">Active Programs</h3>
                  <p className="text-gray-300">Access to a diverse range of bug bounty programs with competitive rewards</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}