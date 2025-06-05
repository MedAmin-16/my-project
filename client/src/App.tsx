import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import LandingPage from "@/pages/landing-page";
import DashboardPage from "@/pages/dashboard-page";
import CompanyDashboardPage from "@/pages/company-dashboard-page";
import CreateProgramPage from "@/pages/create-program-page";
import ProgramsPage from "@/pages/programs-page";
import ProgramDetailPage from "@/pages/program-detail-page";
import SubmitBugPage from "@/pages/submit-bug-page";
import VerifyEmailPage from "@/pages/verify-email-page";
import ProfilePage from "@/pages/profile-page";
import SettingsPage from "@/pages/settings-page";
import LeaderboardPage from "@/pages/leaderboard-page";
import TermsOfServicePage from "@/pages/terms-of-service";
import PrivacyPolicyPage from "@/pages/privacy-policy";
import ResourcesPage from "@/pages/resources-page";
import LegalPage from "@/pages/legal-page";
import HelpCenterPage from "@/pages/help-center-page";
import BlogPage from "@/pages/blog-page";
import DocumentationPage from "@/pages/documentation-page";
import SecurityPage from "@/pages/security-page";
import BadgesPage from "./pages/badges-page";
import ActivitiesPage from "@/pages/activities-page";
import AboutPage from "@/pages/about-page";
import AdminLoginPage from "@/pages/admin-login-page";
import AdminDashboardPage from "@/pages/admin-dashboard-page";
import AdminPage from "./pages/admin-page";
import ForgotPasswordPage from "./pages/forgot-password-page";
import WalletPage from "./pages/wallet-page";
import HacktivityPage from "./pages/hacktivity-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/theme-provider";

function Router() {
  const { user } = useAuth();

  // Determine the component for the dashboard based on userType
  const DashboardComponent = () => {
    if (user?.userType === 'company') {
      return <CompanyDashboardPage />;
    }
    return <DashboardPage />;
  };

  // Wallet route component 
  const WalletComponent = () => {
    if (!user) {
      return <Redirect to="/auth" />;
    }
    return <WalletPage />;
  };

  // Admin route component with enhanced security checks
  const AdminComponent = () => {
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
      // Verify admin status on component mount
      const verifyAdmin = async () => {
        try {
          const response = await fetch('/api/admin/verify', {
            credentials: 'include'
          });
          setIsAuthorized(response.ok);
        } catch (error) {
          console.error('Admin verification failed');
          setIsAuthorized(false);
        }
      };
      verifyAdmin();
    }, []);

    // Multiple layers of protection
    if (!user || user.userType !== 'admin' || !isAuthorized) {
      return <Redirect to="/dashboard" />;
    }
    return <AdminPage />;
  };

  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <ProtectedRoute path="/dashboard" component={DashboardComponent} />
      <ProtectedRoute path="/company-dashboard" component={CompanyDashboardPage} />
      <ProtectedRoute path="/programs" component={ProgramsPage} />
      <Route path="/programs/:id" component={ProgramDetailPage} />
      <Route path="/hacktivity" component={HacktivityPage} />
      <Route path="/find-programs" component={FindProgramsPage} />
      <ProtectedRoute path="/submit" component={SubmitBugPage} />
      <ProtectedRoute path="/submit-bug" component={SubmitBugPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/profile/:id" component={ProfilePage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/leaderboard" component={LeaderboardPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/verify-email" component={VerifyEmailPage} />
      <Route path="/terms-of-service">
        {() => <TermsOfServicePage />}
      </Route>
      <Route path="/privacy-policy">
        {() => <PrivacyPolicyPage />}
      </Route>
      <Route path="/resources">
        {() => <ResourcesPage />}
      </Route>
      <Route path="/legal">
        {() => <LegalPage />}
      </Route>
      <Route path="/help-center">
        {() => <HelpCenterPage />}
      </Route>
      <Route path="/blog">
        {() => <BlogPage />}
      </Route>
      <Route path="/documentation">
        {() => <DocumentationPage />}
      </Route>
      <Route path="/security">
        {() => <SecurityPage />}
      </Route>
      <Route path="/about">
        {() => <AboutPage />}
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" component={AdminLoginPage} />
      <Route path="/admin/dashboard" component={AdminDashboardPage} />

      <Route path="/*" component={NotFound} />
    </Switch>
  );
}

// Placeholder for FindProgramsPage component
function FindProgramsPage() {
  return <h1>Find Programs Page</h1>;
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;