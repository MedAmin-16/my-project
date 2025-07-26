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
import TriageDashboardPage from "@/pages/triage-dashboard-page";
import ModerationDashboard from "@/components/moderation-dashboard";
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
import AdminWithdrawalsPage from "./pages/admin-withdrawals-page";
import AdminCryptoWithdrawalsPage from "./pages/admin-crypto-withdrawals-page";
import AdminCompanyWalletsPage from "@/pages/admin-company-wallets-page";
import AdminPaymentDashboard from './pages/admin-payment-dashboard';
import CryptoPaymentPage from './pages/crypto-payment-page';
import CryptoWithdrawalPage from './pages/crypto-withdrawal-page';
import PaymentDashboardPage from "./pages/payment-dashboard-page";
import ResearcherPayoutsPage from "./pages/researcher-payouts-page";
import CompanyWalletPage from "@/pages/company-wallet-page";
import AdminLoginPage from "@/pages/admin-login-page";
import AdminDashboardPage from "@/pages/admin-dashboard-page";
import AdminPage from "./pages/admin-page";
import { AdminRoute } from "@/components/admin-route";
import SimpleAdminLogin from "@/pages/simple-admin-login";
import ForceAdmin from "@/pages/force-admin";
import ForgotPasswordPage from "./pages/forgot-password-page";
import WalletPage from "./pages/wallet-page";
import HacktivityPage from "./pages/hacktivity-page";
import FindProgramsPage from "./pages/find-programs-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/theme-provider";
import ClientLandingPage from "@/pages/client-landing-page";


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
      <ProtectedRoute path="/triage-dashboard" component={TriageDashboardPage} />
      <Route path="/programs" component={ProgramsPage} />
      <Route path="/programs/:id" component={ProgramDetailPage} />
      <Route path="/hacktivity" component={HacktivityPage} />
      <Route path="/find-programs" component={FindProgramsPage} />
      <ProtectedRoute path="/submit" component={SubmitBugPage} />
      <ProtectedRoute path="/submit-bug" component={SubmitBugPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/profile/:id" component={ProfilePage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/leaderboard" component={LeaderboardPage} />
      <ProtectedRoute path="/badges" component={BadgesPage} />
      <ProtectedRoute path="/activities" component={ActivitiesPage} />
      <ProtectedRoute path="/wallet" component={WalletComponent} />
      <ProtectedRoute path="/company/wallet" component={CompanyWalletPage} />
      <ProtectedRoute path="/admin/company-wallets" component={AdminCompanyWalletsPage} />
      <ProtectedRoute path="/admin/withdrawals" component={AdminWithdrawalsPage} />
      <ProtectedRoute path="/admin/crypto/withdrawals" component={AdminCryptoWithdrawalsPage} />
      <ProtectedRoute path="/admin/payments" component={AdminPaymentDashboard} />
      <ProtectedRoute path="/crypto/payments" component={CryptoPaymentPage} />
      <ProtectedRoute path="/crypto/payment" component={CryptoPaymentPage} />
      <ProtectedRoute path="/crypto/withdrawals" component={CryptoWithdrawalPage} />
      <Route path="/terms-of-service">
        {() => <TermsOfServicePage />}
      </Route>
      <Route path="/terms">
        {() => <Redirect to="/terms-of-service" />}
      </Route>
      <ProtectedRoute path="/payment-dashboard" component={PaymentDashboardPage} />
      <ProtectedRoute path="/researcher-payouts" component={ResearcherPayoutsPage} />
      <Route path="/admin" component={AdminLoginPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/verify-email" component={VerifyEmailPage} />
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
      <Route path="/create-program" component={CreateProgramPage} />

      {/* Admin Routes */}
      <Route path="/admin">
        {() => <ForceAdmin />}
      </Route>
      <Route path="/admin/dashboard" component={AdminDashboardPage} />
      <Route path="/for-organizations" component={ClientLandingPage} />
      <Route path="/for-organisations" component={ClientLandingPage} />

      <ProtectedRoute path="/moderation" component={ModerationDashboard} />

      <Route path="/*" component={NotFound} />
    </Switch>
  );
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