import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import AdminLoginPage from "@/pages/admin-login-page";
import AdminDashboardPage from "@/pages/admin-dashboard-page";

export function AdminRoute() {
  const [, navigate] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const tokenData = localStorage.getItem('adminToken');
      
      if (!tokenData) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const parsedTokenData = JSON.parse(tokenData);
        const { token, expiresAt } = parsedTokenData;

        // Check token expiration
        if (!token || !expiresAt || Date.now() > expiresAt) {
          localStorage.removeItem('adminToken');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Validate token format
        if (!/^[a-f0-9]{64}$/i.test(token)) {
          localStorage.removeItem('adminToken');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const response = await fetch("/api/admin/verify", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Requested-With': 'XMLHttpRequest'
          },
          credentials: 'include'
        });
        
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          console.log("Admin verification failed, redirecting to login");
          localStorage.removeItem('adminToken');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center">
        <div className="text-matrix font-mono">Authenticating...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <AdminDashboardPage />;
  }

  return <AdminLoginPage />;
}