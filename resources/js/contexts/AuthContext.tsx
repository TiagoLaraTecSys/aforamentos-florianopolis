import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { loginRequest } from '@/services/AuthService';
import axios from 'axios';
axios.defaults.withCredentials = true;
export type UserRole = 'admin' | 'moderador' | 'operador' | 'visitante';

export interface User {
  id: number;
  name: string;
  email: string;
  roles: UserRole[];
}

export const Permissions = {
  isAdmin: (user: User | null) => !!user?.roles?.includes('admin'),
  isModerador: (user: User | null) => !!user?.roles?.includes('moderador'),
  isPrivileged: (user: User | null) =>
    !!user?.roles?.some((r) => ['admin', 'moderador'].includes(r)),
  needsApproval: (user: User | null) =>
    !user?.roles?.some((r) => ['admin', 'moderador'].includes(r)),
};

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  hasPermission: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔥 ESSENCIAL: verifica sessão ao abrir app
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get('/me');
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 🔐 login
  const login = async (email: string, password: string) => {
    const data = await loginRequest(email, password);
    setUser(data.user ?? data);
  };

  // 🚪 logout
  const logout = async () => {
    await axios.post('/logout');
    setUser(null);
  };

  const hasPermission = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return user.roles?.some((r) => roles.includes(r)) ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
