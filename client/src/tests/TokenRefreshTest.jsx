// src/tests/TokenRefreshTest.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const TokenRefreshTest = () => {
  const { isAuthenticated, login, logout, refreshToken } = useAuth();
  const [logs, setLogs] = useState([]);
  const [originalToken, setOriginalToken] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  // Funzione per aggiungere log
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };
  
  // Effetto per monitorare il token
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token');
      if (token && token !== originalToken) {
        setOriginalToken(token);
        addLog(`Token aggiornato: ${token.substring(0, 10)}...`, 'success');
      }
    };
    
    // Controlla il token ogni secondo
    const interval = setInterval(checkToken, 1000);
    return () => clearInterval(interval);
  }, [originalToken]);
  
  // Test di refresh token
  const testRefreshToken = async () => {
    try {
      addLog('Inizio test refresh token...');
      const beforeToken = localStorage.getItem('token');
      addLog(`Token attuale: ${beforeToken?.substring(0, 10)}...`);
      
      addLog('Chiamata refreshToken()...');
      await refreshToken();
      
      const afterToken = localStorage.getItem('token');
      if (beforeToken !== afterToken) {
        addLog('Token aggiornato con successo!', 'success');
      } else {
        addLog('Il token non è stato aggiornato', 'warning');
      }
    } catch (error) {
      addLog(`Errore durante il refresh: ${error.message}`, 'error');
    }
  };
  
  // Test token scaduto
  const testExpiredToken = async () => {
    try {
      addLog('Simulazione token scaduto...');
      // Sostituisci il token con uno scaduto (o invalido)
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      localStorage.setItem('token', expiredToken);
      addLog(`Token impostato a scaduto: ${expiredToken.substring(0, 10)}...`);
      
      addLog('Tentativo di refresh token scaduto...');
      await refreshToken();
      
      // Controlla se l'utente è stato disconnesso
      if (!localStorage.getItem('token')) {
        addLog('Utente disconnesso come previsto (token rimosso)', 'success');
      } else {
        addLog('Errore: l\'utente è ancora autenticato con token scaduto', 'error');
      }
    } catch (error) {
      addLog(`Gestione errore token scaduto: ${error.message}`, 'warning');
    }
  };
  
  // Test refresh loop
  const testRefreshLoop = async () => {
    try {
      addLog('Test di protezione refresh loop...');
      let callCount = 0;
      
      // Esegui 5 refresh in rapida successione
      for (let i = 0; i < 5; i++) {
        addLog(`Tentativo di refresh #${i+1}...`);
        setTimeout(() => refreshToken(), i * 100);
      }
      
      // Verifica risultati dopo un secondo
      setTimeout(() => {
        const lastRefresh = localStorage.getItem('lastTokenRefresh');
        addLog(`Ultimo refresh timestamp: ${new Date(parseInt(lastRefresh)).toLocaleTimeString()}`);
        addLog('Test refresh loop completato', 'success');
      }, 1500);
    } catch (error) {
      addLog(`Errore durante il test refresh loop: ${error.message}`, 'error');
    }
  };
  
  // Toggle auto refresh
  const toggleAutoRefresh = () => {
    if (autoRefresh) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
      setAutoRefresh(false);
      addLog('Auto refresh disattivato', 'info');
    } else {
      const interval = setInterval(() => {
        addLog('Esecuzione auto refresh...');
        refreshToken().catch(err => {
          addLog(`Errore auto refresh: ${err.message}`, 'error');
        });
      }, 10000); // Ogni 10 secondi
      
      setRefreshInterval(interval);
      setAutoRefresh(true);
      addLog('Auto refresh attivato (ogni 10 secondi)', 'info');
    }
  };
  
  // Pulisci intervallo quando il componente viene smontato
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);
  
  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Test Refresh Token</h2>
      
      <div className="mb-4">
        <div className="text-gray-300 mb-2">Stato autenticazione: 
          <span className={`ml-2 font-bold ${isAuthenticated ? 'text-green-400' : 'text-red-400'}`}>
            {isAuthenticated ? 'Autenticato' : 'Non autenticato'}
          </span>
        </div>
        
        {isAuthenticated && (
          <div className="text-gray-300">
            Token: 
            <span className="ml-2 font-mono text-sm text-yellow-300">
              {localStorage.getItem('token')?.substring(0, 20)}...
            </span>
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-4 mb-6">
        {!isAuthenticated && (
          <button 
            onClick={() => login({ email: 'test@example.com', password: 'password123' })}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Login Test
          </button>
        )}
        
        {isAuthenticated && (
          <>
            <button 
              onClick={testRefreshToken}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
            >
              Test Refresh Token
            </button>
            
            <button 
              onClick={testExpiredToken}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded"
            >
              Test Token Scaduto
            </button>
            
            <button 
              onClick={testRefreshLoop}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
            >
              Test Refresh Loop
            </button>
            
            <button 
              onClick={toggleAutoRefresh}
              className={`px-4 py-2 rounded ${
                autoRefresh 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {autoRefresh ? 'Disattiva' : 'Attiva'} Auto Refresh
            </button>
            
            <button 
              onClick={logout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
            >
              Logout
            </button>
          </>
        )}
      </div>
      
      <div className="bg-gray-900 p-4 rounded h-80 overflow-y-auto">
        <h3 className="text-xl font-semibold mb-2">Log:</h3>
        {logs.length === 0 ? (
          <div className="text-gray-500 italic">Nessun log...</div>
        ) : (
          <div className="space-y-2">
            {logs.map((log, index) => (
              <div key={index} className={`
                p-2 rounded text-sm font-mono
                ${log.type === 'error' ? 'bg-red-900 text-red-300' : 
                  log.type === 'success' ? 'bg-green-900 text-green-300' :
                  log.type === 'warning' ? 'bg-yellow-900 text-yellow-300' :
                  'bg-gray-800 text-gray-300'}
              `}>
                <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenRefreshTest;