
import { Route, Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
  isPublic?: boolean;
}

export function ProtectedRoute({
  path,
  component: Component,
  isPublic = false,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen bg-deep-black">
              <Loader2 className="h-8 w-8 animate-spin text-matrix" />
            </div>
          );
        }

        if (isPublic) {
          return <Component />;
        }

        if (!user) {
          return <Redirect to="/auth" />;
        }

        return <Component />;
      }}
    </Route>
  );
}
