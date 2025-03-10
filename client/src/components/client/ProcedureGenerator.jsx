// src/components/client/ProcedureGenerator.jsx
import { useState } from 'react';

const ProcedureGenerator = ({ client, onGenerate, isGenerating, canGenerate }) => {
  const [options, setOptions] = useState({
    includeDeadlines: true,
    includeDocuments: true,
    procedureType: 'standard'
  });
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOptions({
      ...options,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate(options);
  };
  
  if (!canGenerate) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-300 mb-2">Nessuna procedura disponibile</h3>
          <p>Questo cliente non ha ancora una procedura operativa generata.</p>
          <p className="mt-2">Contatta un amministratore o un manager per generare una procedura.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-start mb-6">
        <div className="flex-shrink-0 bg-blue-600 rounded-full p-3">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-200">Generazione Procedura Operativa</h3>
          <p className="text-gray-400 mt-1">
            Genera una procedura operativa personalizzata per questo cliente utilizzando AI.
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Tipo di Procedura
          </label>
          <select
            name="procedureType"
            value={options.procedureType}
            onChange={handleChange}
            className="w-full bg-gray-700 border-gray-600 rounded-md text-gray-200 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="standard">Standard</option>
            <option value="detailed">Dettagliata</option>
            <option value="simplified">Semplificata</option>
          </select>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            name="includeDeadlines"
            id="includeDeadlines"
            checked={options.includeDeadlines}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
          />
          <label htmlFor="includeDeadlines" className="ml-2 block text-sm text-gray-300">
            Includere scadenze e promemoria
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            name="includeDocuments"
            id="includeDocuments"
            checked={options.includeDocuments}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
          />
          <label htmlFor="includeDocuments" className="ml-2 block text-sm text-gray-300">
            Includere documenti richiesti
          </label>
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Riepilogo Cliente</h4>
          <p className="text-sm text-gray-400">Nome: {client.name}</p>
          <p className="text-sm text-gray-400">Tipo: {client.companyType}</p>
          <p className="text-sm text-gray-400">
            {client.vatNumber ? `Partita IVA: ${client.vatNumber}` : `Codice Fiscale: ${client.fiscalCode}`}
          </p>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generazione in corso...
              </>
            ) : (
              'Genera Procedura'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProcedureGenerator;