import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
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
import AboutPage from "@/pages/about-page";
import HelpCenterPage from "@/pages/help-center-page";
import BlogPage from "@/pages/blog-page";
import DocumentationPage from "@/pages/documentation-page";
import SecurityPage from "@/pages/security-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ThemeProvider } from "./components/theme-provider";

function Router() {
  const { user } = useAuth();

  // Determine the component for the dashboard based on userType
  const DashboardComponent = () => {
    if (user?.userType === 'company') {
      return <CompanyDashboardPage />;
    }
    return <DashboardPage />;
  };

  // Admin route component with proper admin check
  const AdminComponent = () => {
    if (user?.userType !== 'admin') {
      return <Redirect to="/dashboard" />;
    }
    return <AdminPage />;
  };

  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <ProtectedRoute path="/admin" component={AdminComponent} />
      <ProtectedRoute path="/dashboard" component={DashboardComponent} />
      <ProtectedRoute path="/company-dashboard" component={CompanyDashboardPage} />
      <ProtectedRoute path="/programs" component={ProgramsPage} />
      <Route path="/programs/:id" component={ProgramDetailPage} />
      <Route path="/find-programs" component={FindProgramsPage} />
      <ProtectedRoute path="/submit" component={SubmitBugPage} />
      <ProtectedRoute path="/submit-bug" component={SubmitBugPage} />
      <ProtectedRoute path="/programs" component={ProgramsPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/profile/:id" component={ProfilePage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/leaderboard" component={LeaderboardPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/verify-email" component={VerifyEmailPage} />
      <Route path="/terms-of-service" component={TermsOfServicePage} />
      <Route path="/privacy-policy" component={PrivacyPolicyPage} />
      <Route path="/resources" component={ResourcesPage} />
      <Route path="/legal" component={LegalPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/help-center" component={HelpCenterPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/documentation" component={DocumentationPage} />
      <Route path="/security" component={SecurityPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

import AdminPage from "./pages/admin-page";
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