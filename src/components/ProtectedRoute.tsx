'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (!isLoading) {
      // If not logged in and not on login page, redirect to login
      if (!isLoggedIn && !isLoginPage) {
        router.push('/login');
      }
      // If logged in and on login page, redirect to home
      else if (isLoggedIn && isLoginPage) {
        router.push('/');
      }
    }
  }, [isLoggedIn, isLoading, router, isLoginPage]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-indigo-400 mb-4"></div>
          <div className="h-4 w-24 bg-indigo-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Allow access to login page even when not logged in
  if (!isLoggedIn && !isLoginPage) {
    return null;
  }

  // Render children for authenticated routes or login page
  return <>{children}</>;
} 