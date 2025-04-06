import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  // Create a wrapper component that handles the protection logic
  const ProtectedComponent = () => {
    // Show loading spinner while checking auth
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-deep-black">
          <Loader2 className="h-8 w-8 animate-spin text-matrix" />
        </div>
      );
    }

    // Redirect to auth page if user is not authenticated
    if (!user) {
      return <Redirect to="/auth" />;
    }

    // Render the protected component
    return <Component />;
  };

  // Return the Route with our protected component
  return <Route path={path} component={ProtectedComponent} />;
}
