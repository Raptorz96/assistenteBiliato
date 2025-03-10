// src/tests/SecurityTest.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const SecurityTest = () => {
  const { login, logout, isAuthenticated } = useAuth();
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Funzione test generica
  const runTest = async (testName, testFn) => {
    setLoading(true);
    try {
      const result = await testFn();
      setTestResults(prev => ({ ...prev, [testName]: { success: true, result } }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, [testName]: { success: false, error: error.message } }));
    }
    setLoading(false);
  };
  
  // Test HTTP vs HTTPS
  const testSecureTransport = async () => {
    const isSecure = window.location.protocol === 'https:';
    return {
      protocol: window.location.protocol,
      isSecure,
      environment: process.env.NODE_ENV,
      recommendation: !isSecure && process.env.NODE_ENV === 'production' 
        ? 'ATTENZIONE: Utilizzare HTTPS in produzione!' 
        : 'OK'
    };
  };
  
  // Test LocalStorage sensitive info
  const testLocalStorageContent = async () => {
    if (!isAuthenticated) {
      throw new Error('Effettua prima il login');
    }
    
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Verifica che non ci siano informazioni sensibili
    const hasSensitiveInfo = user.password || user.passwordHash || token?.includes('password');
    
    return {
      tokenStored: !!token,
      tokenLength: token?.length || 0,
      userProperties: Object.keys(user),
      containsSensitiveInfo: hasSensitiveInfo,
      recommendation: hasSensitiveInfo ? 'RISCHIO: Dati sensibili in localStorage!' : 'OK'
    };
  };
  
  // Test token expiration
  const testTokenExpiration = async () => {
    if (!isAuthenticated) {
      throw new Error('Effettua prima il login');
    }
    
    // Decodifica JWT (senza librerie)
    const token = localStorage.getItem('token');
    const tokenParts = token.split('.');
    
    if (tokenParts.length !== 3) {
      throw new Error('Token JWT non valido');
    }
    
    try {
      // Decodifica payload (parte centrale del token)
      const payload = JSON.parse(atob(tokenParts[1]));
      
      const expiration = payload.exp ? new Date(payload.exp * 1000) : null;
      const issuedAt = payload.iat ? new Date(payload.iat * 1000) : null;
      
      // Calcola durata token in minuti
      const durationMinutes = expiration && issuedAt 
        ? Math.round((expiration - issuedAt) / (1000 * 60)) 
        : null;
      
      return {
        hasExpiration: !!payload.exp,
        expirationDate: expiration?.toLocaleString() || 'Non specificata',
        durationMinutes,
        recommendation: !payload.exp 
          ? 'RISCHIO: Token senza scadenza!' 
          : durationMinutes > 60 * 24 
            ? 'ATTENZIONE: Token dura più di 24 ore' 
            : 'OK'
      };
    } catch (error) {
      throw new Error(`Impossibile decodificare token: ${error.message}`);
    }
  };
  
  // Test login falliti
  const testFailedLogins = async () => {
    // Prima assicuriamoci di essere logout
    logout();
    
    const results = [];
    
    // Tenta login con credenziali errate 3 volte
    for (let i = 0; i < 3; i++) {
      try {
        const startTime = Date.now();
        await login({ email: `test${i}@example.com`, password: 'wrongpassword' });
        const endTime = Date.now();
        
        results.push({
          attempt: i + 1,
          success: true, // Non dovrebbe succedere
          responseTime: endTime - startTime
        });
      } catch (error) {
        const endTime = Date.now();
        results.push({
          attempt: i + 1,
          success: false,
          error: error.message,
          responseTime: endTime - startTime
        });
      }
    }
    
    // Verifica tempi di risposta per rate limiting
    const responseTimes = results.map(r => r.responseTime);
    const increasingTime = responseTimes[2] > responseTimes[0];
    
    return {
      attempts: results,
      hasRateLimiting: increasingTime,
      recommendation: !increasingTime 
        ? 'RISCHIO: Nessun rate limiting per login falliti!' 
        : 'OK'
    };
  };
  
  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Test di Sicurezza</h2>
      
      <div className="mb-4">
        <div className="text-gray-300 mb-2">Stato autenticazione: 
          <span className={`ml-2 font-bold ${isAuthenticated ? 'text-green-400' : 'text-red-400'}`}>
            {isAuthenticated ? 'Autenticato' : 'Non autenticato'}
          </span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 mb-6">
        {!isAuthenticated && (
          <button 
            onClick={() => login({ email: 'test@example.com', password: 'password123' })}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
            disabled={loading}
          >
            Login Test
          </button>
        )}
        
        {isAuthenticated && (
          <button 
            onClick={logout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
            disabled={loading}
          >
            Logout
          </button>
        )}
        
        <button 
          onClick={() => runTest('secureTransport', testSecureTransport)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
          disabled={loading}
        >
          Test HTTPS
        </button>
        
        <button 
          onClick={() => runTest('localStorage', testLocalStorageContent)}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded"
          disabled={loading}
        >
          Test LocalStorage
        </button>
        
        <button 
          onClick={() => runTest('tokenExpiration', testTokenExpiration)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
          disabled={loading}
        >
          Test Scadenza Token
        </button>
        
        <button 
          onClick={() => runTest('failedLogins', testFailedLogins)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded"
          disabled={loading}
        >
          Test Login Falliti
        </button>
      </div>
      
      {loading && (
        <div className="mb-4 text-yellow-400">
          Esecuzione test in corso...
        </div>
      )}
      
      <div className="bg-gray-900 p-4 rounded">
        <h3 className="text-xl font-semibold mb-2">Risultati:</h3>
        {Object.entries(testResults).length === 0 ? (
          <div className="text-gray-500 italic">Nessun test eseguito...</div>
        ) : (
          Object.entries(testResults).map(([testName, { success, result, error }]) => (
            <div key={testName} className="mb-4">
              <div className={`font-bold ${success ? 'text-green-400' : 'text-red-400'}`}>
                {testName}: {success ? 'PASS' : 'FAIL'}
              </div>
              {success ? (
                <pre className="mt-2 p-2 bg-gray-800 rounded overflow-x-auto text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
              ) : (
                <div className="mt-2 text-red-300">{error}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SecurityTest;