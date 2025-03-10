// src/components/auth/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading, refreshToken, isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Aggiungiamo un console.log per debug
  console.log('ProtectedRoute check:', { 
    hasUser: !!user, 
    isAuthenticated,
    hasToken: !!localStorage.getItem('token'),
    loading, 
    isDevelopment: process.env.NODE_ENV === 'development',
    path: location.pathname 
  });
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Verifichiamo prima se abbiamo un utente nello stato E siamo autenticati
  if (user && isAuthenticated) {
    return children || <Outlet />;
  }
  
  // Verifichiamo il token in localStorage 
  const hasToken = !!localStorage.getItem('token');
  if (hasToken) {
    console.log('Token presente ma utente non caricato, tentativo di refresh...');
    // Tentiamo un refresh del token prima di reindirizzare
    refreshToken().catch(() => {
      console.log('Refresh fallito, reindirizzamento al login');
    });
    
    // Mostra un loader mentre aspettiamo
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Nessun token e nessun utente, reindirizzamento al login
  console.log('Token mancante, reindirizzamento al login');
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;