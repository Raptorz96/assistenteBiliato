// src/tests/RoleBasedProtection.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// Componenti di test
const AdminPage = () => <div>Pagina Admin</div>;
const OperatorPage = () => <div>Pagina Operatore</div>;
const AccessDenied = () => <div>Accesso Negato</div>;

// Componente di protezione basato sul ruolo
const RoleRoute = ({ element, roles }) => {
  const { isAuthenticated, hasRole } = useAuth();
  
  if (!isAuthenticated) {
    return <div className="bg-red-800 p-4 rounded">Redirect al login: utente non autenticato</div>;
  }
  
  if (!hasRole(roles)) {
    return <div className="bg-red-800 p-4 rounded">Accesso negato: ruolo insufficiente</div>;
  }
  
  return element;
};

const RoleBasedProtectionTest = () => {
  const { login, logout, isAuthenticated, hasRole, user } = useAuth();
  const [testResults, setTestResults] = useState({});
  const [currentTest, setCurrentTest] = useState(null);
  
  // Utenti di test
  const adminUser = { email: 'admin@example.com', password: 'admin123' };
  const operatorUser = { email: 'operator@example.com', password: 'operator123' };
  
  // Funzione per eseguire i test
  const runTest = async (testName, testFn) => {
    setCurrentTest(testName);
    try {
      const result = await testFn();
      setTestResults(prev => ({ ...prev, [testName]: { success: true, result } }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, [testName]: { success: false, error: error.message } }));
    }
    setCurrentTest(null);
  };
  
  // Test specifici
  const testAdminAccess = async () => {
    // Logout per iniziare pulito
    await logout();
    // Login come admin
    await login(adminUser);
    // Verifica accesso rotte admin
    const canAccessAdmin = hasRole('admin');
    const canAccessOperator = hasRole(['admin', 'operator']);
    
    return {
      userRole: 'admin',
      canAccessAdminRoutes: canAccessAdmin,
      canAccessOperatorRoutes: canAccessOperator
    };
  };
  
  const testOperatorAccess = async () => {
    // Logout per iniziare pulito
    await logout();
    // Login come operatore
    await login(operatorUser);
    // Verifica accesso rotte
    const canAccessAdmin = hasRole('admin');
    const canAccessOperator = hasRole(['admin', 'operator']);
    
    return {
      userRole: 'operator',
      canAccessAdminRoutes: canAccessAdmin, 
      canAccessOperatorRoutes: canAccessOperator
    };
  };
  
  const testManipulatedRole = async () => {
    // Logout per iniziare pulito
    await logout();
    // Login come operatore
    await login(operatorUser);
    
    // Simulare manipolazione localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    user.role = 'admin'; // Tentativo di manipolazione
    localStorage.setItem('user', JSON.stringify(user));
    
    // Verifica che il backend verifichi il ruolo
    try {
      // Eseguire una richiesta a una rotta protetta
      // Qui dovresti utilizzare il tuo servizio API per fare una richiesta reale
      const response = await fetch('/api/admin-only', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      return {
        manipulationAttempted: true,
        serverRejected: !response.ok,
        statusCode: response.status
      };
    } catch (error) {
      return {
        manipulationAttempted: true,
        serverRejected: true,
        error: error.message
      };
    }
  };
  
  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Test Protezione Basata sui Ruoli</h2>
      
      <div className="flex space-x-4 mb-6">
        <button 
          onClick={() => runTest('adminAccess', testAdminAccess)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          disabled={currentTest}
        >
          Test Admin
        </button>
        
        <button 
          onClick={() => runTest('operatorAccess', testOperatorAccess)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          disabled={currentTest}
        >
          Test Operatore
        </button>
        
        <button 
          onClick={() => runTest('manipulatedRole', testManipulatedRole)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          disabled={currentTest}
        >
          Test Manipolazione
        </button>
      </div>
      
      {currentTest && (
        <div className="mb-4 text-yellow-400">
          Esecuzione test: {currentTest}...
        </div>
      )}
      
      <div className="bg-gray-700 p-4 rounded">
        <h3 className="text-xl font-semibold mb-2">Risultati:</h3>
        {Object.entries(testResults).map(([testName, { success, result, error }]) => (
          <div key={testName} className="mb-4">
            <div className={`font-bold ${success ? 'text-green-400' : 'text-red-400'}`}>
              {testName}: {success ? 'PASS' : 'FAIL'}
            </div>
            {success ? (
              <pre className="mt-2 p-2 bg-gray-900 rounded overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            ) : (
              <div className="mt-2 text-red-300">{error}</div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Stato Attuale:</h3>
        <div className="bg-gray-700 p-4 rounded mb-4">
          <div>Utente: {user ? JSON.stringify(user.firstName + ' ' + user.lastName) : 'Non autenticato'}</div>
          <div>Ruolo: {user ? user.role : 'N/A'}</div>
          <div>Autenticato: {isAuthenticated ? 'Sì' : 'No'}</div>
        </div>
        
        <h3 className="text-xl font-semibold mb-2">Simulazione Rotte Protette:</h3>
        <div className="grid grid-cols-2 gap-4 mt-4 mb-4">
          <div className="bg-gray-700 p-4 rounded">
            <h4 className="font-semibold mb-2 text-center">Rotta Admin</h4>
            <RoleRoute element={<AdminPage />} roles={['admin']} />
          </div>
          
          <div className="bg-gray-700 p-4 rounded">
            <h4 className="font-semibold mb-2 text-center">Rotta Operatore</h4>
            <RoleRoute element={<OperatorPage />} roles={['admin', 'operator']} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleBasedProtectionTest;