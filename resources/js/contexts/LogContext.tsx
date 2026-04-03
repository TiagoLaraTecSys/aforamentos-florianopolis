import { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type LogAction = 
  | 'LOGIN' 
  | 'LOGOUT'
  | 'ADD_BURIAL' 
  | 'EDIT_BURIAL' 
  | 'DELETE_BURIAL'
  | 'VIEW_BURIAL'
  | 'PRINT_BURIAL_CERTIFICATE'
  | 'ADD_LEASE' 
  | 'EDIT_LEASE' 
  | 'DELETE_LEASE'
  | 'VIEW_LEASE'
  | 'ADD_CEMETERY' 
  | 'EDIT_CEMETERY' 
  | 'DELETE_CEMETERY'
  | 'EXPORT_DATA'
  | 'IMPORT_DATA'
  | 'VIEW_NOTIFICATIONS'
  | 'VIEW_HISTORY';

export type LogCategory = 'AUTHENTICATION' | 'BURIAL' | 'LEASE' | 'CEMETERY' | 'SYSTEM' | 'NOTIFICATION';

export interface LogEntry {
  id: number;
  timestamp: Date;
  userId: number;
  userName: string;
  userRole: string;
  action: LogAction;
  category: LogCategory;
  target?: string; // Nome do falecido, titular, cemitério, etc.
  targetId?: number; // ID do registro afetado
  cemeteryName?: string;
  details?: string;
  ipAddress?: string;
  success: boolean;
  errorMessage?: string;
}

interface LogContextType {
  logs: LogEntry[];
  addLog: (action: LogAction, category: LogCategory, details?: {
    target?: string;
    targetId?: number;
    cemeteryName?: string;
    details?: string;
    success?: boolean;
    errorMessage?: string;
  }) => void;
  clearLogs: () => void;
  getLogs: (filters?: {
    category?: LogCategory;
    userId?: number;
    startDate?: Date;
    endDate?: Date;
    action?: LogAction;
  }) => LogEntry[];
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export function LogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const { user } = useAuth();

  const addLog = (
    action: LogAction, 
    category: LogCategory, 
    details?: {
      target?: string;
      targetId?: number;
      cemeteryName?: string;
      details?: string;
      success?: boolean;
      errorMessage?: string;
    }
  ) => {
    if (!user) return;

    const newLog: LogEntry = {
      id: logs.length + 1,
      timestamp: new Date(),
      userId: user.id,
      userName: user.name,
      userRole: user.roles?.[0] ?? '',
      action,
      category,
      target: details?.target,
      targetId: details?.targetId,
      cemeteryName: details?.cemeteryName,
      details: details?.details,
      ipAddress: '192.168.1.100', // Mock - em produção seria obtido do servidor
      success: details?.success !== undefined ? details.success : true,
      errorMessage: details?.errorMessage
    };

    setLogs(prev => [newLog, ...prev]); // Adiciona no início para os mais recentes aparecerem primeiro
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getLogs = (filters?: {
    category?: LogCategory;
    userId?: number;
    startDate?: Date;
    endDate?: Date;
    action?: LogAction;
  }) => {
    let filteredLogs = [...logs];

    if (filters?.category) {
      filteredLogs = filteredLogs.filter(log => log.category === filters.category);
    }

    if (filters?.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }

    if (filters?.action) {
      filteredLogs = filteredLogs.filter(log => log.action === filters.action);
    }

    if (filters?.startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!);
    }

    if (filters?.endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!);
    }

    return filteredLogs;
  };

  return (
    <LogContext.Provider value={{ logs, addLog, clearLogs, getLogs }}>
      {children}
    </LogContext.Provider>
  );
}

export function useLogs() {
  const context = useContext(LogContext);
  if (context === undefined) {
    throw new Error('useLogs must be used within a LogProvider');
  }
  return context;
}

// Mapeamento de ações para descrições em português
export const ActionDescriptions: Record<LogAction, string> = {
  LOGIN: 'Login no sistema',
  LOGOUT: 'Logout do sistema',
  ADD_BURIAL: 'Adicionou sepultamento',
  EDIT_BURIAL: 'Editou sepultamento',
  DELETE_BURIAL: 'Excluiu sepultamento',
  VIEW_BURIAL: 'Visualizou sepultamento',
  PRINT_BURIAL_CERTIFICATE: 'Imprimiu certidão de sepultamento',
  ADD_LEASE: 'Adicionou aforamento',
  EDIT_LEASE: 'Editou aforamento',
  DELETE_LEASE: 'Excluiu aforamento',
  VIEW_LEASE: 'Visualizou aforamento',
  ADD_CEMETERY: 'Adicionou cemitério',
  EDIT_CEMETERY: 'Editou cemitério',
  DELETE_CEMETERY: 'Excluiu cemitério',
  EXPORT_DATA: 'Exportou dados',
  IMPORT_DATA: 'Importou dados',
  VIEW_NOTIFICATIONS: 'Visualizou notificações',
  VIEW_HISTORY: 'Visualizou histórico'
};

// Mapeamento de categorias para descrições em português
export const CategoryDescriptions: Record<LogCategory, string> = {
  AUTHENTICATION: 'Autenticação',
  BURIAL: 'Sepultamento',
  LEASE: 'Aforamento',
  CEMETERY: 'Cemitério',
  SYSTEM: 'Sistema',
  NOTIFICATION: 'Notificação'
};
