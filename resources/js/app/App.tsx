import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LogProvider } from '@/contexts/LogContext';
import { CemeteryDashboard } from '@/app/components/CemeteryDashboard';
import { LoginPage } from '@/app/components/LoginPage';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

    if (loading) {
      return <div>Carregando...</div>;
    }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <CemeteryDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <LogProvider>
        <AppContent />
      </LogProvider>
    </AuthProvider>
  );
}
