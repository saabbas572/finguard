import { Navigate } from 'react-router-dom';
import type { JSX } from 'react/jsx-runtime';
import { useAuth } from '../../context/AuthContext';

const devBypassEnabled = import.meta.env.DEV && localStorage.getItem('dev_auth_bypass') === 'true';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  if (user) return children;
  if (devBypassEnabled) return children;
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;