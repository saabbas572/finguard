import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { loginUser, logoutUser, registerUser } from '../services/authService';
import type { LoginCredentials, RegisterCredentials, User } from '../types/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const readStoredUser = (): User | null => {
  const stored = localStorage.getItem('user');
  if (!stored) return null;

  try {
    return JSON.parse(stored) as User;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(readStoredUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    try {
      const nextUser = await loginUser(credentials);
      setUser(nextUser);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setLoading(true);
    setError(null);
    try {
      const nextUser = await registerUser(credentials);
      setUser(nextUser);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    setError(null);
  };

  const clearError = () => setError(null);

  const value = useMemo(
    () => ({ user, loading, error, login, register, logout, clearError }),
    [user, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};