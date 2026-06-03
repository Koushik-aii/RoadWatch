import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * @param {{ children: import('react').ReactNode, roles?: string[] }} props
 */
export default function ProtectedRoute({ children, roles }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="animate-spin text-indigo-400" size={32} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles?.length && !roles.includes(user.role)) {
    if (user.role === 'Admin') return <Navigate to="/admin" replace />;
<<<<<<< Updated upstream
    if (user.role === 'Road Authority Officer') return <Navigate to="/officer" replace />;
    return <Navigate to="/" replace />;
=======
    if (user.role === 'Road Authority Officer') return <Navigate to="/authority" replace />;
    return <Navigate to="/app" replace />;
>>>>>>> Stashed changes
  }

  return children;
}
