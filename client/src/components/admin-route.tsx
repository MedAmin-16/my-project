import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import AdminLoginPage from "@/pages/admin-login-page";
import AdminDashboardPage from "@/pages/admin-dashboard-page";

export function AdminRoute() {
  const [, navigate] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/admin/verify", {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });
        
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('adminToken');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Admin auth check failed:", error);
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
        <div className="text-matrix font-mono">AUTHENTICATING...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <AdminDashboardPage />;
  }

  return <AdminLoginPage />;
}