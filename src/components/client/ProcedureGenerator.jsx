import React, { useState } from 'react';
import api from '../../services/api';

const ProcedureGenerator = ({ clientId, onProcedureGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState({
    useAI: true,
    includeDocuments: true,
    includeDeadlines: true
  });

  const handleOptionChange = (option) => {
    setOptions({
      ...options,
      [option]: !options[option]
    });
  };

  const generateProcedure = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(`/clients/${clientId}/procedure`, options);
      setLoading(false);
      
      if (onProcedureGenerated) {
        onProcedureGenerated(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Si è verificato un errore durante la generazione della procedura');
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-gray-200">Genera Procedura Operativa</h3>
      </div>
      
      <div className="p-4">
        <p className="text-gray-300 mb-6">
          La procedura operativa verrà generata automaticamente in base al tipo di cliente e ai servizi richiesti.
        </p>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="useAI"
              checked={options.useAI}
              onChange={() => handleOptionChange('useAI')}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
            />
            <label htmlFor="useAI" className="ml-2 text-gray-300">
              Utilizza AI per ottimizzare la procedura
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeDocuments"
              checked={options.includeDocuments}
              onChange={() => handleOptionChange('includeDocuments')}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
            />
            <label htmlFor="includeDocuments" className="ml-2 text-gray-300">
              Includi lista documenti necessari
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeDeadlines"
              checked={options.includeDeadlines}
              onChange={() => handleOptionChange('includeDeadlines')}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
            />
            <label htmlFor="includeDeadlines" className="ml-2 text-gray-300">
              Includi scadenze e promemoria
            </label>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-900 bg-opacity-30 text-red-400 p-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <button
          onClick={generateProcedure}
          disabled={loading}
          className={`w-full py-2 px-4 rounded-lg ${
            loading 
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700 transition-colors'
          }`}
        >
          {loading ? 'Generazione in corso...' : 'Genera Procedura'}
        </button>
      </div>
    </div>
  );
};

export default ProcedureGenerator;