
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  requiredUserType?: "hacker" | "company" | "admin";
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = "/auth", 
  requiredUserType 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center">
        <div className="text-matrix font-mono">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to={redirectTo} />;
  }

  if (requiredUserType && user.userType !== requiredUserType) {
    return <Redirect to="/dashboard" />;
  }

  return <>{children}</>;
}
