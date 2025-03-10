// src/pages/TestPage.jsx
import React, { useState, useEffect } from 'react';
import TokenRefreshTest from '../tests/TokenRefreshTest';
import NavbarTest from '../tests/NavbarTest';
import SecurityTest from '../tests/SecurityTest';
import RoleBasedProtectionTest from '../tests/RoleBasedProtection';

const TestPage = () => {
  const [activeTest, setActiveTest] = useState('token');
  const [error, setError] = useState(null);
  
  // Gestione errori
  useEffect(() => {
    const handleError = (event) => {
      console.error("Errore rilevato:", event.error);
      setError(event.error?.message || "Si è verificato un errore");
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Ripristino dell'errore quando si cambia test
  useEffect(() => {
    setError(null);
  }, [activeTest]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Studio Assistant Pro - Test Suite</h1>
      
      {error && (
        <div className="bg-red-800 text-white p-4 mb-6 rounded-lg">
          <h3 className="font-bold">Errore</h3>
          <p>{error}</p>
          <button 
            onClick={() => setError(null)} 
            className="mt-2 px-3 py-1 bg-red-700 hover:bg-red-600 rounded text-sm"
          >
            Chiudi
          </button>
        </div>
      )}
      
      <div className="bg-gray-700 rounded-lg p-4 mb-6 flex flex-wrap gap-3">
        <button 
          onClick={() => setActiveTest('token')}
          className={`px-4 py-2 rounded ${
            activeTest === 'token' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Test Refresh Token
        </button>
        
        <button 
          onClick={() => setActiveTest('navbar')}
          className={`px-4 py-2 rounded ${
            activeTest === 'navbar' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Test Navbar
        </button>
        
        <button 
          onClick={() => setActiveTest('security')}
          className={`px-4 py-2 rounded ${
            activeTest === 'security' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Test Sicurezza
        </button>
        
        <button 
          onClick={() => setActiveTest('role')}
          className={`px-4 py-2 rounded ${
            activeTest === 'role' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Test Protezione Ruoli
        </button>
      </div>
      
      <div className="test-container">
        {activeTest === 'token' && <TokenRefreshTest />}
        {activeTest === 'navbar' && <NavbarTest />}
        {activeTest === 'security' && <SecurityTest />}
        {activeTest === 'role' && <RoleBasedProtectionTest />}
      </div>
    </div>
  );
};

export default TestPage;