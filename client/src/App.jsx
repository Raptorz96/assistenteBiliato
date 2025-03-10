// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import LoginDiagnostic from './pages/LoginDiagnostic';
import ClientListPage from './pages/ClientListPage';
import ClientDetailPage from './pages/ClientDetailPage';
import ProcedurePage from './pages/ProcedurePage';
import ChecklistPage from './pages/ChecklistPage';
import TemplatePage from './pages/TemplatePage';
import UsersPage from './pages/UsersPage';
import TestPage from './pages/TestPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Simula un'inizializzazione dell'app (caricamento configurazioni, tema, ecc.)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isInitializing) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="mb-4">
            <svg className="animate-spin h-10 w-10 text-primary-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white">Studio Assistant Pro</h2>
          <p className="text-gray-400 mt-2">Inizializzazione in corso...</p>
        </div>
      </div>
    );
  }
  
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login-diagnostica" element={<LoginDiagnostic />} />
          
          {/* Layout con navigazione principale */}
          <Route path="/" element={<Layout />}>
            {/* Rotte protette che richiedono autenticazione */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="clienti" element={
              <ProtectedRoute>
                <ClientListPage />
              </ProtectedRoute>
            } />
            <Route path="clienti/:id" element={
              <ProtectedRoute>
                <ClientDetailPage />
              </ProtectedRoute>
            } />
            <Route path="procedure" element={
              <ProtectedRoute>
                <ProcedurePage />
              </ProtectedRoute>
            } />
            <Route path="checklist" element={
              <ProtectedRoute>
                <ChecklistPage />
              </ProtectedRoute>
            } />
            <Route path="modelli" element={
              <ProtectedRoute>
                <TemplatePage />
              </ProtectedRoute>
            } />
            <Route path="utenti" element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            } />
            
            {/* Pagina di test */}
            <Route path="test-suite" element={<TestPage />} />
            
            {/* Pagina 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        
      </Router>
    </AuthProvider>
  );
}

export default App;