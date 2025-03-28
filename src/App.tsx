import React from "react";
import { Route, Switch } from "wouter";
import LandingPage from "./pages/landing-page";
import AuthPage from "./pages/auth-page";
import DashboardPage from "./pages/dashboard-page";
import ProgramsPage from "./pages/programs-page";
import SubmitBugPage from "./pages/submit-bug-page";
import NotFound from "./pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import { Toaster } from "./components/ui/toaster";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/programs" component={ProgramsPage} />
      <ProtectedRoute path="/submit" component={SubmitBugPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Router />
      <Toaster />
    </div>
  );
}

export default App;