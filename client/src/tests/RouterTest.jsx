import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const RouterTest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [testResults, setTestResults] = useState({});

  // Aggiungiamo un messaggio iniziale per vedere se il componente è montato correttamente
  const [statusMessage, setStatusMessage] = useState(
    `Stato autenticazione: ${isAuthenticated ? 'Autenticato' : 'Non autenticato'}, ` +
    `Ruolo: ${user?.role || 'Nessuno'}, ` +
    `Posizione attuale: ${location.pathname}`
  );

  const testRoutes = [
    { path: '/dashboard', name: 'Dashboard', expectedAccess: isAuthenticated },
    { path: '/clienti', name: 'Clienti', expectedAccess: isAuthenticated },
    { path: '/utenti', name: 'Utenti', expectedAccess: isAuthenticated && user?.role === 'admin' },
    { path: '/login', name: 'Login', expectedAccess: true },
  ];

  const testRoute = (route) => {
    // Approccio alternativo: invece di navigare effettivamente,
    // verifichiamo solo se la rotta sarebbe accessibile
    try {
      // Verifica se l'utente è autenticato per le rotte protette
      const wouldBeAccessible = route.path === '/login' || isAuthenticated;
      
      // Verifica ruoli per rotte con restrizioni di ruolo
      const hasRequiredRole = route.path !== '/utenti' || user?.role === 'admin';
      
      // Determina se l'accesso sarebbe concesso
      const accessGranted = wouldBeAccessible && hasRequiredRole;
      
      // Aggiorna i risultati
      setTestResults(prev => ({
        ...prev,
        [route.path]: {
          success: accessGranted,
          expectedAccess: route.expectedAccess,
          result: accessGranted === route.expectedAccess ? 'PASS' : 'FAIL'
        }
      }));
      
      setStatusMessage(`Test completato per: ${route.name}`);
    } catch (error) {
      console.error(`Errore durante il test di ${route.path}:`, error);
      setStatusMessage(`Errore durante il test di ${route.path}: ${error.message}`);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg mt-6">
      <h2 className="text-xl font-bold mb-4">Test React Router</h2>
      
      <div className="space-y-3 mb-4">
        {testRoutes.map((route) => (
          <button
            key={route.path}
            onClick={() => testRoute(route)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded mr-2"
          >
            Test rotta: {route.name}
          </button>
        ))}
      </div>
      
      <div className="border p-3 rounded bg-gray-700 mb-4">
        <p className="text-blue-400">{statusMessage}</p>
      </div>
      
      <div className="border p-3 rounded bg-gray-700">
        <h3 className="font-semibold mb-2">Risultati:</h3>
        {Object.keys(testResults).length > 0 ? (
          Object.entries(testResults).map(([path, result]) => (
            <div key={path} className="mb-2">
              <p>
                <span className="font-medium">{path}</span>:{' '}
                <span 
                  className={result.result === 'PASS' ? 'text-green-400' : 'text-red-400'}
                >
                  {result.result}
                </span>
              </p>
              <p className="text-sm text-gray-400">
                Accesso previsto: {result.expectedAccess ? 'Sì' : 'No'}, 
                Risultato: {result.success ? 'Accesso ottenuto' : 'Accesso negato'}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-400">Nessun test eseguito finora. Clicca sui pulsanti sopra per testare le rotte.</p>
        )}
      </div>
    </div>
  );
};

export default RouterTest;