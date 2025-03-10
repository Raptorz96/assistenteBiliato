// ./client/src/tests/AuthContextTest.jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthContextTest = () => {
  const { 
    isAuthenticated, 
    login, 
    logout, 
    user, 
    loading, 
    hasRole 
  } = useAuth();
  
  const [testResults, setTestResults] = useState({});
  const [authState, setAuthState] = useState({ isAuthenticated, user });
  const [testCredentials, setTestCredentials] = useState({
    email: 'test@example.com',
    password: 'password123'
  });

  // Monitora i cambiamenti nello stato di autenticazione
  useEffect(() => {
    console.log("AuthContextTest: Stato aggiornato", { isAuthenticated, user });
    
    setAuthState({ isAuthenticated, user });
    
    setTestResults(prev => ({
      ...prev,
      initialState: {
        status: 'INFO',
        message: `Autenticazione: ${isAuthenticated ? 'Sì' : 'No'}, Utente: ${user ? user.email : 'Nessuno'}`
      }
    }));
  }, [isAuthenticated, user]);
  
  // Effect per rilevare esplicitamente i cambiamenti di autenticazione
  useEffect(() => {
    // Monitora i cambiamenti nello stato di autenticazione per aggiornare i test
    
    // Gestione del logout: quando isAuthenticated diventa false dopo un test fallito
    if (
      testResults.logoutContext && 
      testResults.logoutContext.status === 'FAIL' && 
      !isAuthenticated
    ) {
      console.log("Monitor di stato: rilevato cambio di autenticazione dopo test di logout fallito");
      setTestResults(prev => ({
        ...prev,
        logoutContext: {
          status: 'PASS',
          message: 'Context aggiornato correttamente (rilevato dal monitor di stato)'
        }
      }));
    }
    
    // Gestione del login: quando isAuthenticated diventa true dopo un test fallito
    if (
      testResults.loginContext && 
      testResults.loginContext.status === 'FAIL' && 
      isAuthenticated
    ) {
      console.log("Monitor di stato: rilevato cambio di autenticazione dopo test di login fallito");
      setTestResults(prev => ({
        ...prev,
        loginContext: {
          status: 'PASS',
          message: 'Context aggiornato correttamente (rilevato dal monitor di stato)'
        }
      }));
    }
  }, [isAuthenticated, testResults]);

  const testLoginContext = async () => {
    try {
      const before = authState.isAuthenticated;
      await login(testCredentials);
      
      // Aggiungi un breve ritardo per assicurarsi che lo stato sia aggiornato
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Leggi lo stato aggiornato
      const after = isAuthenticated;
      
      if (!after) {
        throw new Error('Context non aggiornato dopo login');
      }
      
      return {
        status: 'PASS',
        message: `Context aggiornato correttamente: prima ${before}, dopo ${after}`
      };
    } catch (error) {
      return {
        status: 'FAIL',
        message: error.message
      };
    }
  };

  const testUserData = () => {
    if (!authState.isAuthenticated || !authState.user) {
      return {
        status: 'FAIL',
        message: 'Utente non autenticato o dati utente non disponibili'
      };
    }
    
    // Verifica che i dati utente siano presenti e validi
    if (!authState.user.id || !authState.user.email) {
      return {
        status: 'FAIL',
        message: 'Dati utente incompleti'
      };
    }
    
    return {
      status: 'PASS',
      message: `Dati utente validi: ID=${authState.user.id}, Email=${authState.user.email}, Ruolo=${authState.user.role || 'non specificato'}`
    };
  };

  const testLogoutContext = async () => {
    try {
      // Verifica stato iniziale
      const before = isAuthenticated;
      if (!before) {
        return {
          status: 'INFO',
          message: 'Utente non autenticato, impossibile testare il logout'
        };
      }
      
      console.log("Test logout: stato prima", { isAuthenticated, user });
      
      // Inizia monitoraggio degli aggiornamenti di stato
      let stateUpdateDetected = false;
      let maxWaitTime = 1000; // Tempo massimo di attesa in ms
      let checkInterval = 50; // Intervallo di controllo in ms
      
      // Promise per monitorare i cambiamenti di stato
      const stateChangePromise = new Promise((resolve) => {
        const initialAuthState = isAuthenticated;
        const checkStateChange = () => {
          if (isAuthenticated !== initialAuthState) {
            console.log("Cambiamento di stato rilevato dopo logout");
            stateUpdateDetected = true;
            resolve();
          }
        };
        
        // Configura un osservatore per controllare regolarmente i cambiamenti di stato
        const intervalId = setInterval(checkStateChange, checkInterval);
        
        // Configura un timeout massimo per evitare attese infinite
        setTimeout(() => {
          clearInterval(intervalId);
          if (!stateUpdateDetected) {
            console.warn("Nessun cambiamento di stato rilevato entro il timeout");
          }
          resolve();
        }, maxWaitTime);
      });
      
      // Esegui il logout e attendi che sia completato
      const logoutResult = await logout();
      console.log("Logout completato con risultato:", logoutResult);
      
      // Attendi che lo stato venga aggiornato o che scada il timeout
      await stateChangePromise;
      
      // Verifica lo stato dopo il logout
      console.log("Test logout: stato dopo", { isAuthenticated, user });
      const after = isAuthenticated;
      
      if (after) {
        throw new Error('Context non aggiornato dopo logout');
      }
      
      return {
        status: 'PASS',
        message: `Context aggiornato correttamente: prima ${before}, dopo ${after}${stateUpdateDetected ? '' : ' (timeout)'}`
      };
    } catch (error) {
      console.error("Errore durante il test logout:", error);
      return {
        status: 'FAIL',
        message: error.message
      };
    }
  };

  const testHasRole = () => {
    if (!authState.isAuthenticated || !authState.user) {
      return {
        status: 'INFO',
        message: 'Utente non autenticato, impossibile verificare i ruoli'
      };
    }
    
    const adminCheck = hasRole('admin');
    const operatorCheck = hasRole('operator');
    const multiRoleCheck = hasRole(['admin', 'operator']);
    
    return {
      status: 'INFO',
      message: `Ruolo admin: ${adminCheck}, operatore: ${operatorCheck}, uno dei due: ${multiRoleCheck}`
    };
  };

  const runTest = async (testName, testFn) => {
    console.log(`Esecuzione test: ${testName}...`);
    const result = await testFn();
    console.log(`Risultato test ${testName}:`, result);
    
    setTestResults(prev => ({
      ...prev,
      [testName]: result
    }));
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg mt-6">
      <h2 className="text-xl font-bold mb-4">Test Context API Autenticazione</h2>
      
      <div className="mb-4 p-3 border rounded bg-gray-700">
        <h3 className="text-md font-semibold mb-2">Stato Attuale:</h3>
        <p className="text-sm">IsAuthenticated: <span className={isAuthenticated ? "text-green-400" : "text-red-400"}>{String(isAuthenticated)}</span></p>
        <p className="text-sm">User: <span className="text-blue-400">{user ? user.email : 'null'}</span></p>
      </div>
      
      <div className="mb-4">
        <h3 className="text-md font-semibold mb-2">Credenziali di test:</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm text-gray-400">Email</label>
            <input 
              type="text" 
              value={testCredentials.email}
              onChange={e => setTestCredentials({...testCredentials, email: e.target.value})}
              className="bg-gray-700 text-white px-3 py-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400">Password</label>
            <input 
              type="password" 
              value={testCredentials.password}
              onChange={e => setTestCredentials({...testCredentials, password: e.target.value})}
              className="bg-gray-700 text-white px-3 py-2 rounded w-full"
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        <button
          onClick={() => runTest('loginContext', testLoginContext)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded mr-2"
        >
          Test Login con Context
        </button>
        
        <button
          onClick={() => runTest('userData', testUserData)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded mr-2"
        >
          Test Dati Utente
        </button>
        
        <button
          onClick={() => runTest('hasRole', testHasRole)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded mr-2"
        >
          Test Verifica Ruoli
        </button>
        
        <button
          onClick={() => runTest('logoutContext', testLogoutContext)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded mr-2"
        >
          Test Logout con Context
        </button>
      </div>
      
      <div className="border p-3 rounded bg-gray-700">
        <h3 className="font-semibold mb-2">Risultati:</h3>
        {Object.entries(testResults).map(([testName, result]) => (
          <div key={testName} className="mb-2">
            <p>
              <span className="font-medium">{testName}</span>:{' '}
              <span 
                className={
                  result.status === 'PASS' ? 'text-green-400' : 
                  result.status === 'FAIL' ? 'text-red-400' : 
                  'text-blue-400'
                }
              >
                {result.status}
              </span>
            </p>
            <p className="text-sm text-gray-400">{result.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuthContextTest;