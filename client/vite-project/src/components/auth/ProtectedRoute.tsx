import { Navigate } from 'react-router-dom';
import type { JSX } from 'react/jsx-runtime';
import { useAuth } from '../../context/AuthContext';

// Dev bypass is DISABLED - always enforce authentication
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();

  // User is logged in - show page
  if (user) return children;
  
  // User is not logged in - redirect to login
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;