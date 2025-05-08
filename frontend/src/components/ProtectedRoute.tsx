
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = Cookies.get('authToken');
      console.log('Auth check - Token found:', !!token);
      
      if (token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    // Small delay to ensure cookie is checked after it's potentially set
    const timer = setTimeout(checkAuth, 50);
    return () => clearTimeout(timer);
  }, [location.pathname]); // Re-check when pathname changes

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    // Pass current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
