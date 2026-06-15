import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import type { JSX } from 'react/jsx-runtime';

const devBypassEnabled = import.meta.env.DEV && localStorage.getItem('dev_auth_bypass') === 'true';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  if (user) return children;
  if (devBypassEnabled) return children;
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;