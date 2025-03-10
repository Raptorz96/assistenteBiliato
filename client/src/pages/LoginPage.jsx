// src/pages/LoginPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, isAuthenticated, loading, error } = useAuth();
  const navigate = useNavigate();
  
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  
  const [formError, setFormError] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Redirects to dashboard if already authenticated
  useEffect(() => {
    // Mettiamo un console.log per debug
    console.log('LoginPage: checking authentication status', { isAuthenticated, loading, url: window.location.href });
    
    if (isAuthenticated && !loading) {
      console.log('LoginPage: redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.email || !credentials.password) {
      setFormError('Inserisci email e password');
      return;
    }
    
    try {
      console.log('LoginPage: attempting login with:', credentials.email);
      setFormError(null);
      await login(credentials);
      // Dopo login con successo, navigare esplicitamente alla dashboard
      console.log('LoginPage: login successful, navigating to dashboard');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setFormError(err.response?.data?.message || 'Errore durante il login');
    }
  };
  
  // Redirect condizionale come fallback
  if (isAuthenticated && !loading) {
    console.log('LoginPage: redirect fallback triggered');
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 dark:bg-gray-900">
      {/* Sezione sinistra (immagine/grafica) */}
      <div className="flex-1 hidden lg:block">
        <div className="h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
          <div className="relative z-10 max-w-md text-white p-12">
            <div className="mb-6 flex items-center">
              <svg className="w-10 h-10 text-primary-400 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 7L12 13L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h1 className="text-3xl font-bold">Studio Assistant Pro</h1>
            </div>
            
            <p className="text-lg text-white/90 mb-8">
              La piattaforma all-in-one per la gestione dello studio professionale.
              Gestisci clienti, documenti e scadenze in un unico luogo.
            </p>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-full bg-primary-500/20 p-2">
                  <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="ml-3 text-white">Gestione clienti centralizzata</span>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-full bg-primary-500/20 p-2">
                  <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="ml-3 text-white">Monitoraggio delle scadenze</span>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-full bg-primary-500/20 p-2">
                  <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="ml-3 text-white">Archiviazione documenti sicura</span>
              </div>
            </div>
          </div>

          {/* Elementi decorativi di sfondo */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-primary-500/20 blur-3xl"></div>
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary-500/20 blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary-500/20 blur-3xl"></div>
          </div>
        </div>
      </div>
      
      {/* Sezione destra (form di login) */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12 bg-white dark:bg-gray-800">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="h-20 w-20 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Bentornato</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Accedi alla piattaforma con le tue credenziali
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {(formError || error) && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4 border-l-4 border-red-500">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-600 dark:text-red-400">{formError || error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="nome@studio.it"
                  value={credentials.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <a href="#" className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300">
                    Password dimenticata?
                  </a>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="••••••••"
                  value={credentials.password}
                  onChange={handleChange}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Ricordami
                  </label>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Accesso in corso...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                    </svg>
                    <span>Accedi</span>
                  </div>
                )}
              </button>
            </div>
            
            {/* Per sviluppo - pulsante di accesso rapido senza credenziali */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setCredentials({ email: 'admin@example.com', password: 'password' });
                  setTimeout(() => handleSubmit({ preventDefault: () => {} }), 100);
                }}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
              >
                Accesso rapido (solo sviluppo)
              </button>
            </div>
            
            {/* Link alla pagina di diagnostica */}
            <div className="mt-2 text-center">
              <a
                href="/login-diagnostica"
                className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
              >
                Problemi di accesso? Vai alla pagina di diagnostica
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;