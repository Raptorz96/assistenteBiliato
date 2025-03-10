import { useState, useEffect } from 'react';

const ProxyTest = () => {
  const [status, setStatus] = useState('Caricamento...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const testProxy = async () => {
      try {
        // Questa chiamata dovrebbe essere proxata attraverso la config di Vite
        const response = await fetch('/api/health');
        
        if (response.ok) {
          const data = await response.json();
          setStatus(`Proxy configurato correttamente! Risposta: ${JSON.stringify(data)}`);
        } else {
          setStatus(`Errore: ${response.status} ${response.statusText}`);
        }
      } catch (err) {
        setError(`Errore di connessione: ${err.message}`);
      }
    };

    testProxy();
  }, []);

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Test Configurazione Proxy</h2>
      <div className="border p-3 rounded bg-gray-700">
        <p className={error ? "text-red-400" : "text-green-400"}>
          {error || status}
        </p>
      </div>
    </div>
  );
};

export default ProxyTest;