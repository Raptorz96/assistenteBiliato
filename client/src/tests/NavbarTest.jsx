// src/tests/NavbarTest.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar'; // Il tuo componente Navbar

const NavbarTest = () => {
  const { login, logout, isAuthenticated } = useAuth();
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [showMobileView, setShowMobileView] = useState(false);
  
  // Utenti di test
  const adminUser = { email: 'admin@example.com', password: 'admin123' };
  const operatorUser = { email: 'operator@example.com', password: 'operator123' };
  
  // Aggiorna dimensione viewport
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Simula viewport mobile
  const toggleMobileView = () => {
    setShowMobileView(!showMobileView);
  };
  
  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Test Navbar</h2>
      
      <div className="flex flex-wrap gap-4 mb-6">
        {!isAuthenticated ? (
          <>
            <button 
              onClick={() => login(adminUser)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
            >
              Login come Admin
            </button>
            
            <button 
              onClick={() => login(operatorUser)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
            >
              Login come Operatore
            </button>
          </>
        ) : (
          <button 
            onClick={logout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
          >
            Logout
          </button>
        )}
        
        <button 
          onClick={toggleMobileView}
          className={`px-4 py-2 rounded ${
            showMobileView 
              ? 'bg-yellow-600 hover:bg-yellow-700' 
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          {showMobileView ? 'Vista Desktop' : 'Simula Mobile'}
        </button>
      </div>
      
      <div className="mb-4">
        <div className="text-gray-300 mb-2">
          Stato autenticazione: 
          <span className={`ml-2 font-bold ${isAuthenticated ? 'text-green-400' : 'text-red-400'}`}>
            {isAuthenticated ? 'Autenticato' : 'Non autenticato'}
          </span>
        </div>
        
        <div className="text-gray-300">
          Larghezza viewport: <span className="font-bold">{viewportWidth}px</span>
          {showMobileView && <span className="ml-2 text-yellow-400">(Simulazione mobile)</span>}
        </div>
      </div>
      
      <div className={`border-4 border-dashed border-gray-600 p-2 ${showMobileView ? 'max-w-sm' : 'w-full'}`}>
        <div className="text-xs text-gray-400 text-center mb-2">
          {showMobileView ? 'Vista Mobile Simulata' : 'Vista Desktop'}
        </div>
        
        <div className={showMobileView ? 'transform scale-75 origin-top-left' : ''}>
          <div className="bg-gray-700 p-4 rounded text-center">
            La preview della Navbar è disabilitata nella pagina di test per evitare conflitti di routing.
            <p className="mt-2 text-sm text-gray-400">
              Per testare la Navbar, visitare altre pagine dell'applicazione.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-gray-900 p-4 rounded">
        <h3 className="text-xl font-semibold mb-2">Punti da verificare:</h3>
        
        <div className="space-y-2">
          <div className="flex items-start">
            <input type="checkbox" id="check1" className="mt-1 mr-2" />
            <label htmlFor="check1">Navbar mostra correttamente nome utente/avatar quando autenticato</label>
          </div>
          
          <div className="flex items-start">
            <input type="checkbox" id="check2" className="mt-1 mr-2" />
            <label htmlFor="check2">Menu utente funziona correttamente (click apre/chiude il dropdown)</label>
          </div>
          
          <div className="flex items-start">
            <input type="checkbox" id="check3" className="mt-1 mr-2" />
            <label htmlFor="check3">Link di navigazione mostrano correttamente lo stato "attivo"</label>
          </div>
          
          <div className="flex items-start">
            <input type="checkbox" id="check4" className="mt-1 mr-2" />
            <label htmlFor="check4">In vista mobile, il menu hamburger mostra/nasconde correttamente i link</label>
          </div>
          
          <div className="flex items-start">
            <input type="checkbox" id="check5" className="mt-1 mr-2" />
            <label htmlFor="check5">I link visualizzati cambiano in base al ruolo dell'utente (admin vs operatore)</label>
          </div>
          
          <div className="flex items-start">
            <input type="checkbox" id="check6" className="mt-1 mr-2" />
            <label htmlFor="check6">Logout funziona correttamente (rimuove token, reindirizza)</label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavbarTest;