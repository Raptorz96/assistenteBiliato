// ./client/src/tests/AxiosTest.jsx
import { useState } from 'react';
import api from '../services/api'; // Il tuo servizio Axios
import { useAuth } from '../context/AuthContext';

const AxiosTest = () => {
  const { login, logout, isAuthenticated } = useAuth();
  const [testResults, setTestResults] = useState({});
  const [statusMessage, setStatusMessage] = useState(
    `Stato attuale: ${isAuthenticated ? 'Autenticato' : 'Non autenticato'}`
  );
  const [testCredentials, setTestCredentials] = useState({
    email: 'test@example.com',
    password: 'password123'
  });

  const runTest = async (testName, testFn) => {
    setStatusMessage(`Esecuzione test: ${testName}...`);
    try {
      const result = await testFn();
      setTestResults(prev => ({
        ...prev,
        [testName]: { status: 'PASS', message: result }
      }));
      setStatusMessage(`Test completato: ${testName}`);
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: { status: 'FAIL', message: error.message }
      }));
      setStatusMessage(`Test fallito: ${testName}`);
    }
  };

  const testLogin = async () => {
    try {
      await login(testCredentials);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Login completato ma nessun token salvato in localStorage');
      }
      return `Login riuscito, token salvato: ${token.substring(0, 15)}...`;
    } catch (error) {
      throw new Error(`Login fallito: ${error.message}`);
    }
  };

  const testAuthenticatedRequest = async () => {
    try {
      // Usa l'endpoint di health che sappiamo esistere
      // Nota: axios.create è configurato con baseURL: '/api', quindi non includiamo '/api/' nel percorso
      const response = await api.get('/health');
      return `Richiesta autenticata riuscita, risposta valida`;
    } catch (error) {
      throw new Error(`Richiesta autenticata fallita: ${error.response?.data?.message || error.message}`);
    }
  };

  const testTokenHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Nessun token trovato in localStorage');
    }
    
    // Verifica che l'interceptor stia funzionando
    // Ottieni la configurazione di una richiesta per verificare gli headers
    const config = { headers: {} };
    api.interceptors.request.handlers.forEach(handler => {
      if (handler.fulfilled) {
        handler.fulfilled(config);
      }
    });
    
    if (!config.headers.Authorization || !config.headers.Authorization.includes(token)) {
      throw new Error('Token non presente negli headers di default');
    }
    
    return 'Token presente negli headers di default';
  };

  const testLogout = async () => {
    const tokenBefore = localStorage.getItem('token');
    if (!tokenBefore) {
      throw new Error('Nessun token presente prima del logout');
    }
    
    await logout();
    const tokenAfter = localStorage.getItem('token');
    if (tokenAfter) {
      throw new Error('Token ancora presente in localStorage dopo logout');
    }
    return 'Logout riuscito, token rimosso correttamente';
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg mt-6">
      <h2 className="text-xl font-bold mb-4">Test Servizio Axios e JWT</h2>
      
      <div className="mb-4">
        <h3 className="text-md font-semibold mb-2">Credenziali di test:</h3>
        <div className="grid grid-cols-2 gap-2 mb-3">
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
          onClick={() => runTest('login', testLogin)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded mr-2"
        >
          Test Login
        </button>
        
        <button
          onClick={() => runTest('tokenHeader', testTokenHeader)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded mr-2"
        >
          Test Token negli Headers
        </button>
        
        <button
          onClick={() => runTest('authenticatedRequest', testAuthenticatedRequest)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded mr-2"
        >
          Test Richiesta Autenticata
        </button>
        
        <button
          onClick={() => runTest('logout', testLogout)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded mr-2"
        >
          Test Logout
        </button>
      </div>
      
      <div className="border p-3 rounded bg-gray-700 mb-4">
        <p className="text-blue-400">{statusMessage}</p>
      </div>
      
      <div className="border p-3 rounded bg-gray-700">
        <h3 className="font-semibold mb-2">Risultati:</h3>
        {Object.keys(testResults).length > 0 ? (
          Object.entries(testResults).map(([testName, result]) => (
            <div key={testName} className="mb-2">
              <p>
                <span className="font-medium">{testName}</span>:{' '}
                <span 
                  className={result.status === 'PASS' ? 'text-green-400' : 'text-red-400'}
                >
                  {result.status}
                </span>
              </p>
              <p className="text-sm text-gray-400">{result.message}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400">Nessun test eseguito finora. Clicca sui pulsanti sopra per testare il servizio Axios e JWT.</p>
        )}
      </div>
    </div>
  );
};

export default AxiosTest;