import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type UserRole = 'admin' | 'moderador' | 'suporte';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  active: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (requiredRole: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuários predefinidos
const predefinedUsers: User[] = [
  {
    id: 1,
    name: 'Administrador Sistema',
    email: 'admin@cemiterios.com',
    password: 'admin123',
    role: 'admin',
    active: true
  },
  {
    id: 2,
    name: 'João Moderador',
    email: 'moderador@cemiterios.com',
    password: 'mod123',
    role: 'moderador',
    active: true
  },
  {
    id: 3,
    name: 'Maria Suporte',
    email: 'suporte@cemiterios.com',
    password: 'suporte123',
    role: 'suporte',
    active: true
  },
  {
    id: 4,
    name: 'Carlos Moderador',
    email: 'carlos@cemiterios.com',
    password: 'carlos123',
    role: 'moderador',
    active: true
  }
];

const roleHierarchy: Record<UserRole, number> = {
  'admin': 3,
  'moderador': 2,
  'suporte': 1
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users] = useState<User[]>(predefinedUsers);

  const login = (email: string, password: string): boolean => {
    const foundUser = users.find(
      u => u.email === email && u.password === password && u.active
    );
    
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    if (!user) return false;
    
    const userLevel = roleHierarchy[user.role];
    return requiredRoles.some(role => roleHierarchy[role] <= userLevel);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        hasPermission
      }}
    >
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

// Permissões por funcionalidade
export const Permissions = {
  // Admin pode tudo
  MANAGE_CEMETERIES: ['admin'] as UserRole[],
  MANAGE_USERS: ['admin'] as UserRole[],
  
  // Admin e Moderador podem gerenciar registros
  ADD_BURIAL: ['admin', 'moderador'] as UserRole[],
  EDIT_BURIAL: ['admin', 'moderador'] as UserRole[],
  DELETE_BURIAL: ['admin'] as UserRole[],
  
  ADD_LEASE: ['admin', 'moderador'] as UserRole[],
  EDIT_LEASE: ['admin', 'moderador'] as UserRole[],
  DELETE_LEASE: ['admin'] as UserRole[],
  
  // Todos podem visualizar
  VIEW_BURIALS: ['admin', 'moderador', 'suporte'] as UserRole[],
  VIEW_LEASES: ['admin', 'moderador', 'suporte'] as UserRole[],
  VIEW_NOTIFICATIONS: ['admin', 'moderador', 'suporte'] as UserRole[],
  
  // Exportar e imprimir
  EXPORT_DATA: ['admin', 'moderador'] as UserRole[],
  PRINT_CERTIFICATE: ['admin', 'moderador', 'suporte'] as UserRole[],
};