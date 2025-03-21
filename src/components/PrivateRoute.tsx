import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>טוען...</div>;
  }

  return currentUser ? <>{children}</> : <Navigate to="/admin/login" replace />;
}