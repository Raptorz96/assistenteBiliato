// src/context/ClientContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';
import clientService from '../services/clientService';

// Creazione del context
const ClientContext = createContext();

// Hook personalizzato per utilizzare il context
export const useClient = () => useContext(ClientContext);

// Provider component
export const ClientProvider = ({ children }) => {
  const [clients, setClients] = useState([]);
  const [currentClient, setCurrentClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Ottieni lista clienti
  const fetchClients = useCallback(async (page = 1, limit = 10, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await clientService.getClients(page, limit, filters);
      
      setClients(data.clients);
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages
      });
      
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Errore durante il caricamento dei clienti');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Ottieni un cliente specifico
  const fetchClient = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await clientService.getClient(id);
      setCurrentClient(data);
      
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Errore durante il caricamento del cliente');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crea un nuovo cliente
  const createClient = useCallback(async (clientData) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await clientService.createClient(clientData);
      
      // Aggiorna la lista dei clienti se necessario
      setClients(prevClients => [data, ...prevClients]);
      
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Errore durante la creazione del cliente');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Aggiorna un cliente esistente
  const updateClient = useCallback(async (id, clientData) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await clientService.updateClient(id, clientData);
      
      // Aggiorna la lista dei clienti
      setClients(prevClients => 
        prevClients.map(client => 
          client._id === id ? data : client
        )
      );
      
      // Aggiorna il cliente corrente se è lo stesso
      if (currentClient && currentClient._id === id) {
        setCurrentClient(data);
      }
      
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Errore durante l\'aggiornamento del cliente');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentClient]);

  // Elimina un cliente
  const deleteClient = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      await clientService.deleteClient(id);
      
      // Rimuovi dalla lista
      setClients(prevClients => 
        prevClients.filter(client => client._id !== id)
      );
      
      // Resetta il cliente corrente se è lo stesso
      if (currentClient && currentClient._id === id) {
        setCurrentClient(null);
      }
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Errore durante l\'eliminazione del cliente');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentClient]);

  // Genera una procedura operativa
  const generateProcedure = useCallback(async (clientId, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await clientService.generateProcedure(clientId, options);
      
      // Aggiorna il cliente corrente se è lo stesso
      if (currentClient && currentClient._id === clientId) {
        setCurrentClient(prev => ({
          ...prev,
          operatingProcedure: data.procedure
        }));
      }
      
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Errore durante la generazione della procedura');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentClient]);

  // Valore del context
  const value = {
    clients,
    currentClient,
    loading,
    error,
    pagination,
    fetchClients,
    fetchClient,
    createClient,
    updateClient,
    deleteClient,
    generateProcedure,
    setCurrentClient
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
};

export default ClientContext;