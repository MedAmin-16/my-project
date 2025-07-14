import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  User, Bell, Lock, LogOut, 
  Eye, EyeOff, CheckCircle, Loader2, Save, AlertTriangle 
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Navbar } from '@/components/layout/navbar';
import { MatrixBackground } from '@/components/matrix-background';
import { apiRequest } from '@/lib/queryClient';

// Form schema for profile update
const profileUpdateSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters long' }).optional(),
  email: z.string().email({ message: 'Please enter a valid email address' }).optional(),
});

// Form schema for password update
const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required' }),
  newPassword: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
  confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;
type PasswordUpdateFormValues = z.infer<typeof passwordUpdateSchema>;

// Notification settings interface
interface NotificationSettings {
  emailNotifications: boolean;
  programUpdates: boolean;
  submissionUpdates: boolean;
  securityAlerts: boolean;
  marketingEmails: boolean;
}

export default function SettingsPage() {
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    programUpdates: true,
    submissionUpdates: true,
    securityAlerts: true,
    marketingEmails: false,
  });

  // Initialize the profile form
  const profileForm = useForm<ProfileUpdateFormValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
    },
  });

  // Initialize the password form
  const passwordForm = useForm<PasswordUpdateFormValues>({
    resolver: zodResolver(passwordUpdateSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Handle profile update
  const profileUpdateMutation = useMutation({
    mutationFn: async (data: ProfileUpdateFormValues) => {
      const res = await apiRequest('PATCH', '/api/user', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update profile',
        description: error.message || 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  // Handle password update
  const passwordUpdateMutation = useMutation({
    mutationFn: async (data: PasswordUpdateFormValues) => {
      const res = await apiRequest('POST', '/api/user/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return await res.json();
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({
        title: 'Password updated',
        description: 'Your password has been successfully changed.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update password',
        description: error.message || 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  // Handle notification settings update
  const updateNotificationSettings = () => {
    toast({
      title: 'Notification settings updated',
      description: 'Your notification preferences have been saved.',
      variant: 'default',
    });
  };

  // Handle profile form submission
  const onProfileSubmit = (data: ProfileUpdateFormValues) => {
    profileUpdateMutation.mutate(data);
  };

  // Handle password form submission
  const onPasswordSubmit = (data: PasswordUpdateFormValues) => {
    passwordUpdateMutation.mutate(data);
  };

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/auth');
        toast({
          title: 'Logged out',
          description: 'You have been successfully logged out.',
          variant: 'default',
        });
      },
    });
  };

  // Handle resend verification email
  const resendVerificationEmail = () => {
    toast({
      title: 'Verification email sent',
      description: 'Please check your inbox for the verification link.',
      variant: 'default',
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-deep-black flex flex-col items-center justify-center p-4">
        <AlertTriangle className="h-16 w-16 text-alert-red mb-4" />
        <h2 className="text-xl text-alert-red mb-2 text-center">Authentication Required</h2>
        <p className="text-dim-gray text-center mb-6">You need to be logged in to view this page.</p>
        <Button 
          variant="default" 
          onClick={() => navigate('/auth')}
          className="bg-matrix text-black hover:bg-matrix/80"
        >
          Log In
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-black relative">
      <MatrixBackground className="opacity-20" />
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold text-matrix mb-2">Account Settings</h1>
          <p className="text-dim-gray">
            Manage your account preferences, security settings, and notification options.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
          {/* Sidebar */}
          <div className="terminal-card p-4 rounded-lg h-fit">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                  activeTab === 'profile' ? 'bg-matrix text-black' : 'text-dim-gray hover:text-matrix hover:bg-dark-terminal'
                }`}
              >
                <User size={18} />
                <span>Profile</span>
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                  activeTab === 'security' ? 'bg-matrix text-black' : 'text-dim-gray hover:text-matrix hover:bg-dark-terminal'
                }`}
              >
                <Lock size={18} />
                <span>Security</span>
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                  activeTab === 'notifications' ? 'bg-matrix text-black' : 'text-dim-gray hover:text-matrix hover:bg-dark-terminal'
                }`}
              >
                <Bell size={18} />
                <span>Notifications</span>
              </button>
              
              <hr className="border-dark-terminal my-2" />
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-alert-red hover:bg-alert-red/10 transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </nav>
          </div>
          
          {/* Main content */}
          <div>
            {activeTab === 'profile' && (
              <Card className="terminal-card border-dark-terminal">
                <CardHeader>
                  <CardTitle className="text-matrix">Profile Information</CardTitle>
                  <CardDescription>
                    Update your account profile information and preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        className="terminal-input"
                        {...profileForm.register('username')}
                      />
                      {profileForm.formState.errors.username && (
                        <p className="text-alert-red text-sm mt-1">
                          {profileForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="flex flex-col space-y-2">
                        <Input
                          id="email"
                          type="email"
                          className="terminal-input"
                          {...profileForm.register('email')}
                        />
                        {!user.isEmailVerified && (
                          <div className="flex items-center justify-between p-2 bg-dark-terminal rounded">
                            <div className="flex items-center">
                              <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                              <span className="text-sm text-yellow-500">Email not verified</span>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={resendVerificationEmail}
                              className="text-xs"
                            >
                              Resend Verification
                            </Button>
                          </div>
                        )}
                        {user.isEmailVerified && (
                          <div className="flex items-center p-2 bg-dark-terminal rounded">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm text-green-500">Email verified</span>
                          </div>
                        )}
                      </div>
                      {profileForm.formState.errors.email && (
                        <p className="text-alert-red text-sm mt-1">
                          {profileForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      disabled={profileUpdateMutation.isPending}
                      className="w-full bg-matrix text-black hover:bg-matrix/80"
                    >
                      {profileUpdateMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
            
            {activeTab === 'security' && (
              <Card className="terminal-card border-dark-terminal">
                <CardHeader>
                  <CardTitle className="text-matrix">Security Settings</CardTitle>
                  <CardDescription>
                    Update your password and manage your account security.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPassword ? "text" : "password"}
                          className="terminal-input pr-10"
                          {...passwordForm.register('currentPassword')}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-dim-gray hover:text-matrix"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-alert-red text-sm mt-1">
                          {passwordForm.formState.errors.currentPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          className="terminal-input pr-10"
                          {...passwordForm.register('newPassword')}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-dim-gray hover:text-matrix"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-alert-red text-sm mt-1">
                          {passwordForm.formState.errors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        className="terminal-input"
                        {...passwordForm.register('confirmPassword')}
                      />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-alert-red text-sm mt-1">
                          {passwordForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      disabled={passwordUpdateMutation.isPending}
                      className="w-full bg-matrix text-black hover:bg-matrix/80"
                    >
                      {passwordUpdateMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Update Password
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="mt-8 p-4 border border-dark-terminal rounded-lg">
                    <h3 className="text-matrix text-lg mb-2">Session Information</h3>
                    <p className="text-dim-gray text-sm mb-4">
                      Your session is secure. If you're concerned about unauthorized access, you can log out from all devices.
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full hover:bg-dark-terminal hover:text-alert-red border-dark-terminal"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout from all devices
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {activeTab === 'notifications' && (
              <Card className="terminal-card border-dark-terminal">
                <CardHeader>
                  <CardTitle className="text-matrix">Notification Preferences</CardTitle>
                  <CardDescription>
                    Control which notifications you receive and how they are delivered.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-light-gray">Email Notifications</Label>
                        <p className="text-dim-gray text-sm">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({...notificationSettings, emailNotifications: checked})
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-light-gray">Program Updates</Label>
                        <p className="text-dim-gray text-sm">
                          Get notified when programs are added or updated
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.programUpdates}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({...notificationSettings, programUpdates: checked})
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-light-gray">Submission Updates</Label>
                        <p className="text-dim-gray text-sm">
                          Get notified when your submissions change status
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.submissionUpdates}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({...notificationSettings, submissionUpdates: checked})
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-light-gray">Security Alerts</Label>
                        <p className="text-dim-gray text-sm">
                          Get notified about security-related events on your account
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.securityAlerts}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({...notificationSettings, securityAlerts: checked})
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-light-gray">Marketing Emails</Label>
                        <p className="text-dim-gray text-sm">
                          Receive promotional offers and newsletters
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.marketingEmails}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({...notificationSettings, marketingEmails: checked})
                        }
                      />
                    </div>

                    <Button 
                      onClick={updateNotificationSettings}
                      className="w-full bg-matrix text-black hover:bg-matrix/80"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Notification Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}