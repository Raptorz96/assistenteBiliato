// src/pages/ProcedurePage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClient } from '../context/ClientContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProcedureView from '../components/client/ProcedureView';
import ProcedureGenerator from '../components/client/ProcedureGenerator';
import api from '../services/api';

const ProcedurePage = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { fetchClientById } = useClient();
  const { user } = useAuth();
  
  const [client, setClient] = useState(null);
  const [procedure, setProcedure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carica i dati del cliente
  useEffect(() => {
    const loadClient = async () => {
      try {
        const clientData = await fetchClientById(clientId);
        setClient(clientData);
        
        // Dopo aver caricato il cliente, carica la procedura
        fetchProcedure(clientId);
      } catch (err) {
        console.error('Error loading client data:', err);
        setError('Impossibile caricare i dati del cliente');
        setLoading(false);
      }
    };

    loadClient();
  }, [clientId, fetchClientById]);
  
  // Carica la procedura per questo cliente
  const fetchProcedure = async (clientId) => {
    setLoading(true);
    try {
      const response = await api.get(`/clients/${clientId}/procedure`);
      setProcedure(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading procedure:', err);
      // Se la procedura non esiste, non è un errore grave
      if (err.response && err.response.status === 404) {
        setProcedure(null);
      } else {
        setError('Impossibile caricare la procedura operativa');
      }
      setLoading(false);
    }
  };
  
  // Gestisce il cambio di stato di un'attività
  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/clients/${clientId}/procedure/tasks/${taskId}/status`, {
        status: newStatus
      });
      
      // Aggiorna la procedura
      fetchProcedure(clientId);
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Impossibile aggiornare lo stato dell\'attività');
    }
  };
  
  // Gestisce la generazione di una nuova procedura
  const handleProcedureGenerated = (newProcedure) => {
    setProcedure(newProcedure);
  };
  
  if (loading) {
    return (
      <div className="container px-6 mx-auto py-8 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container px-6 mx-auto py-8">
        <div className="bg-red-900 bg-opacity-30 text-red-400 p-4 rounded">
          <p>{error}</p>
          <button
            onClick={() => navigate('/clients')}
            className="mt-4 px-4 py-2 bg-gray-700 rounded text-gray-200 hover:bg-gray-600 transition"
          >
            Torna alla lista clienti
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-6 mx-auto py-8">
      {/* Header con informazioni cliente */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-200">
            Procedura Operativa
          </h2>
          {client && (
            <p className="text-gray-400 mt-1">
              Cliente: <span className="text-blue-400">{client.name}</span>
            </p>
          )}
        </div>
        
        <button 
          onClick={() => navigate(`/clients/${clientId}`)}
          className="mt-4 md:mt-0 px-4 py-2 bg-gray-700 rounded text-gray-200 hover:bg-gray-600 transition"
        >
          Torna ai dettagli cliente
        </button>
      </div>

      {/* Contenuto principale */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonna principale - Visualizzazione procedura */}
        <div className="lg:col-span-2">
          {procedure ? (
            <ProcedureView 
              procedure={procedure} 
              onStatusChange={handleTaskStatusChange} 
            />
          ) : (
            <div className="bg-gray-800 rounded-lg shadow border border-gray-700 p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-200">Nessuna procedura disponibile</h3>
              <p className="mt-1 text-gray-400">
                Questo cliente non ha ancora una procedura operativa definita.
              </p>
            </div>
          )}
        </div>
        
        {/* Colonna laterale - Generazione procedura */}
        <div className="lg:col-span-1">
          {/* Mostra generatore solo per admin e manager */}
          {(user?.role === 'admin' || user?.role === 'manager') && !procedure && (
            <ProcedureGenerator 
              clientId={clientId} 
              onProcedureGenerated={handleProcedureGenerated} 
            />
          )}
          
          {/* Se la procedura esiste, mostra statistiche o altre informazioni */}
          {procedure && (
            <div className="bg-gray-800 rounded-lg shadow border border-gray-700">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-gray-200">Riepilogo Procedura</h3>
              </div>
              
              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Stato Avanzamento</p>
                    <div className="mt-2 relative pt-1">
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
                        <div 
                          style={{ 
                            width: `${calculateProgress(procedure)}%` 
                          }} 
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{calculateProgress(procedure)}% completato</span>
                        <span>{countCompletedTasks(procedure)} di {procedure.tasks.length} attività</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Data Creazione</p>
                    <p className="text-gray-200">
                      {new Date(procedure.createdAt).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Data Fine Prevista</p>
                    <p className="text-gray-200">
                      {procedure.expectedEndDate 
                        ? new Date(procedure.expectedEndDate).toLocaleDateString('it-IT')
                        : 'Non definita'}
                    </p>
                  </div>
                </div>
                
                {/* Pulsanti azioni */}
                <div className="mt-6 space-y-3">
                  {(user?.role === 'admin' || user?.role === 'manager') && (
                    <>
                      <button 
                        onClick={() => handleResetProcedure()} 
                        className="w-full py-2 px-4 bg-red-800 bg-opacity-30 text-red-400 rounded hover:bg-opacity-50 transition"
                      >
                        Ripristina Procedura
                      </button>
                      
                      <button 
                        onClick={() => handleRegenerateProcedure()}
                        className="w-full py-2 px-4 bg-blue-700 bg-opacity-30 text-blue-400 rounded hover:bg-opacity-50 transition"
                      >
                        Rigenera Procedura
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Funzioni di utilità
const calculateProgress = (procedure) => {
  if (!procedure || !procedure.tasks || procedure.tasks.length === 0) {
    return 0;
  }
  
  const completedTasks = procedure.tasks.filter(task => task.status === 'completed').length;
  return Math.round((completedTasks / procedure.tasks.length) * 100);
};

const countCompletedTasks = (procedure) => {
  if (!procedure || !procedure.tasks) {
    return 0;
  }
  
  return procedure.tasks.filter(task => task.status === 'completed').length;
};

export default ProcedurePage;