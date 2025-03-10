// src/components/auth/RoleRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RoleRoute = ({ roles, children }) => {
  const { hasRole, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-gray-900 text-blue-400">Caricamento...</div>;
  }
  
  if (!hasRole(roles)) {
    // Redirect to dashboard if user doesn't have required role
    return <Navigate to="/dashboard" replace />;
  }
  
  return children || <Outlet />;
};

export default RoleRoute;