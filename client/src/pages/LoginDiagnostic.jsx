// src/pages/LoginDiagnostic.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginDiagnostic = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading, login, logout } = useAuth();
  const [diagnosticInfo, setDiagnosticInfo] = useState({
    browserInfo: null,
    routingInfo: null,
    authState: null,
    localStorage: null,
    network: null
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Raccogli informazioni diagnostiche
    const gatherDiagnosticInfo = async () => {
      try {
        // Browser info
        const browserInfo = {
          userAgent: navigator.userAgent,
          language: navigator.language,
          cookiesEnabled: navigator.cookieEnabled,
          windowSize: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          url: window.location.href,
          pathname: window.location.pathname
        };

        // Routing info
        const routingInfo = {
          currentPath: window.location.pathname,
          currentSearch: window.location.search,
          currentHash: window.location.hash,
          origin: window.location.origin,
          history: !!window.history
        };

        // Auth state
        const authState = {
          isAuthenticated,
          hasUser: !!user,
          userEmail: user?.email || 'nessuno',
          loading,
          isDev: process.env.NODE_ENV === 'development'
        };

        // LocalStorage
        const localStorageItems = {
          token: !!localStorage.getItem('token'),
          user: !!localStorage.getItem('user'),
          refreshing: localStorage.getItem('refreshing'),
          lastRefreshTime: localStorage.getItem('lastRefreshTime'),
          theme: localStorage.getItem('theme')
        };

        // Network test - tentativo di ping al backend
        let networkStatus = null;
        try {
          const timeStart = Date.now();
          const response = await fetch('/api/health', { 
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            mode: 'no-cors' // Per evitare problemi CORS
          });
          const timeEnd = Date.now();
          networkStatus = {
            success: true,
            latency: timeEnd - timeStart,
            statusText: 'OK'
          };
        } catch (err) {
          networkStatus = {
            success: false,
            error: err.message,
            statusText: 'Errore di connessione'
          };
        }

        setDiagnosticInfo({
          browserInfo,
          routingInfo,
          authState,
          localStorage: localStorageItems,
          network: networkStatus
        });
      } catch (err) {
        console.error('Errore durante la diagnostica:', err);
        setDiagnosticInfo({
          error: err.message
        });
      }
    };

    gatherDiagnosticInfo();
  }, [isAuthenticated, user, loading]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="bg-primary-600 p-4 text-white">
          <h1 className="text-xl font-bold">Diagnostica Pagina Login</h1>
          <p className="mt-1 text-sm">Uno strumento per diagnosticare problemi di accesso all'applicazione</p>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Stato Attuale</h2>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <p>
                <span className="font-medium">Autenticato:</span>{' '}
                <span className={isAuthenticated ? "text-green-600" : "text-red-600"}>
                  {isAuthenticated ? 'Sì' : 'No'}
                </span>
              </p>
              <p>
                <span className="font-medium">Utente:</span>{' '}
                <span className="text-blue-600">{user ? user.email : 'Nessuno'}</span>
              </p>
              <p>
                <span className="font-medium">In caricamento:</span>{' '}
                <span>{loading ? 'Sì' : 'No'}</span>
              </p>
              <p>
                <span className="font-medium">URL corrente:</span>{' '}
                <span className="text-blue-600">{window.location.href}</span>
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Azioni</h2>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded"
                >
                  Vai alla pagina di login
                </button>
                
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Vai alla dashboard
                </button>
                
                {isAuthenticated ? (
                  <button
                    onClick={() => logout()}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={() => login({ email: 'admin@example.com', password: 'password' })}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Login rapido
                  </button>
                )}
                
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
                >
                  Pulisci localStorage
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Informazioni di diagnostica</h2>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-primary-600 hover:text-primary-800"
              >
                {showDetails ? 'Nascondi dettagli' : 'Mostra dettagli'}
              </button>
            </div>
            
            {showDetails && (
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <pre className="text-xs overflow-auto max-h-96">
                  {JSON.stringify(diagnosticInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Possibili soluzioni</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Problema di reindirizzamento:</strong> Prova ad accedere a <a href="/login" className="text-primary-600 hover:underline">/login</a> direttamente
              </li>
              <li>
                <strong>Problema con i cookie/localStorage:</strong> Prova a pulire localStorage e ricaricare
              </li>
              <li>
                <strong>Problema con il router:</strong> Verifica che il componente Router sia configurato correttamente
              </li>
              <li>
                <strong>Problema con il rendering condizionale:</strong> Potrebbe esserci un problema con il componente ProtectedRoute
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginDiagnostic;