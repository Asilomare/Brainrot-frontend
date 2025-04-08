'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isAuthenticated, authenticate, logout } from '@/lib/auth';

interface AuthContextType {
  isLoggedIn: boolean;
  login: (password: string) => boolean;
  logOut: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  login: () => false,
  logOut: () => {},
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check authentication status on mount
    setIsLoggedIn(isAuthenticated());
    setIsLoading(false);
  }, []);

  const login = (password: string): boolean => {
    const success = authenticate(password);
    setIsLoggedIn(success);
    return success;
  };

  const logOut = () => {
    logout();
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}; 