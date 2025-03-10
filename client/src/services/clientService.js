// src/services/clientService.js
import api from './api';

const clientService = {
  // Ottieni tutti i clienti con supporto per paginazione e filtri
  getClients: async (page = 1, limit = 10, filters = {}) => {
    const params = { page, limit, ...filters };
    const response = await api.get('/clients', { params });
    return response.data;
  },
  
  // Ottieni un singolo cliente per ID
  getClient: async (id) => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },
  
  // Crea un nuovo cliente
  createClient: async (clientData) => {
    const response = await api.post('/clients', clientData);
    return response.data;
  },
  
  // Aggiorna un cliente esistente
  updateClient: async (id, clientData) => {
    const response = await api.put(`/clients/${id}`, clientData);
    return response.data;
  },
  
  // Elimina un cliente
  deleteClient: async (id) => {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },
  
  // Ottieni la checklist di onboarding di un cliente
  getChecklist: async (id) => {
    const response = await api.get(`/clients/${id}/checklist`);
    return response.data;
  },
  
  // Aggiorna un elemento della checklist
  updateChecklistItem: async (clientId, itemId, data) => {
    const response = await api.put(`/clients/${clientId}/checklist/${itemId}`, data);
    return response.data;
  },
  
  // Genera una procedura operativa utilizzando l'AI
  generateProcedure: async (clientId, options = {}) => {
    const response = await api.post(`/clients/${clientId}/procedure`, options);
    return response.data;
  }
};

export default clientService;