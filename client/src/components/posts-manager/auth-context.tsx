import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getStrapiURL } from '@/lib/utils';

// Toast utility function
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    document.body.removeChild(toast);
  }, 3000);
};

interface AuthContextType {
  isAuthenticated: boolean;
  isInitializing: boolean;
  email: string;
  authToken: string;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => void;
  validateToken: (token: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'posts_manager_auth_token';
const EMAIL_KEY = 'posts_manager_email';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [email, setEmail] = useState('');
  const [authToken, setAuthToken] = useState('');

  // Import adminLogin here to avoid circular dependencies
  const adminLogin = async (email: string, password: string): Promise<string> => {
    const API_BASE = getStrapiURL();

    const response = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `Admin login failed: ${response.status}`);
    }

    return data.data.token;
  };

  const login = async (userEmail: string, password: string, rememberMe: boolean) => {
    try {
      const token = await adminLogin(userEmail, password);

      if (rememberMe) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(EMAIL_KEY, userEmail);
      }

      setAuthToken(token);
      setEmail(userEmail);
      setIsAuthenticated(true);
      showToast('Successfully logged in as admin!', 'success');
    } catch (error) {
      console.error('Admin login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Admin login failed. Please check your credentials.';
      showToast(errorMessage, 'error');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    setIsAuthenticated(false);
    setAuthToken('');
    setEmail('');
    showToast('Successfully signed out!', 'success');
  };

  const validateToken = async (token: string): Promise<boolean> => {
    if (!token) return false;

    try {
      // Simple token validation by making a test request
      const API_BASE = getStrapiURL();
      const response = await fetch(`${API_BASE}/content-manager/collection-types/api::post.post?pagination[page]=1&pagination[pageSize]=1`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  // Check for existing token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedEmail = localStorage.getItem(EMAIL_KEY);

      if (savedToken && savedEmail) {
        console.log('Found saved authentication, validating token...');
        setEmail(savedEmail);
        setAuthToken(savedToken);

        try {
          const isValid = await validateToken(savedToken);
          if (isValid) {
            setIsAuthenticated(true);
            showToast(`Welcome back, ${savedEmail}!`, 'success');
          } else {
            // Clear invalid token
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(EMAIL_KEY);
            setAuthToken('');
            setEmail('');
            showToast('Session expired. Please login again.', 'error');
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(EMAIL_KEY);
          setAuthToken('');
          setEmail('');
        }
      }

      setIsInitializing(false);
    };

    initializeAuth();
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    isInitializing,
    email,
    authToken,
    login,
    logout,
    validateToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
