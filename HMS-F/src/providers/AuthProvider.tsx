import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { type AuthResponse } from '@/api/authAPI';
import * as authAPI from '@/api/authAPI';
import { useAuthStore } from '@/store/useAuthStore';

interface AuthContextType {
  isAuthenticated: boolean;
  user: {
    username: string;
    role: string;
  } | null;
  role: string | null;
  login: (data: AuthResponse) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, role, login: storeLogin, logout: storeLogout } = useAuthStore();
  const navigate = useNavigate();

  // Handle global unauthorized events from Axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      // Store is already cleared by axios context via store.logout()
      navigate('/login', { replace: true });
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [navigate]);

  const login = (data: AuthResponse) => {
    storeLogin(data);
  };

  const logout = async () => {
    try {
      // Attempt backend logout to revoke refresh token
      await authAPI.logout();
    } catch (e) {
      console.error('Logout failed on backend:', e);
    } finally {
      // Always clear frontend state
      storeLogout();
      navigate('/login', { replace: true });
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
