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
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Always show login page first, let it handle the redirect logic
  return <AdminLoginPage />;
}