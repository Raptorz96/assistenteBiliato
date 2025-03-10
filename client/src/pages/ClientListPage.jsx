// src/pages/ClientListPage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useClient } from '../context/ClientContext';
import { useAuth } from '../context/AuthContext';
import ClientCreateModal from '../components/client/ClientCreateModal';

const ClientListPage = () => {
  const { fetchClients, clients, loading, pagination } = useClient();
  const { hasRole } = useAuth();
  const [filters, setFilters] = useState({
    search: '',
    companyType: '',
    onboardingStatus: ''
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  useEffect(() => {
    loadClients();
  }, []);
  
  const loadClients = async (page = 1) => {
    // Costruisci i filtri di query basati sui filtri attuali
    const queryFilters = {};
    
    if (filters.search) {
      queryFilters.search = filters.search;
    }
    
    if (filters.companyType) {
      queryFilters.companyType = filters.companyType;
    }
    
    if (filters.onboardingStatus) {
      queryFilters['onboarding.status'] = filters.onboardingStatus;
    }
    
    await fetchClients(page, 10, queryFilters);
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    loadClients(1);
  };
  
  const handlePageChange = (page) => {
    loadClients(page);
  };
  
  const handleClientCreated = () => {
    setIsCreateModalOpen(false);
    loadClients(1);
  };
  
  return (
    <div className="container px-6 mx-auto">
      <div className="flex justify-between items-center my-6">
        <h2 className="text-2xl font-semibold text-gray-700">
          Clienti
        </h2>
        
        {hasRole(['admin', 'manager']) && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-blue-600 border border-transparent rounded-lg active:bg-blue-600 hover:bg-blue-700 focus:outline-none focus:shadow-outline-blue"
          >
            Nuovo Cliente
          </button>
        )}
      </div>
      
      {/* Filtri di ricerca */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <form onSubmit={handleSearch}>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Ricerca
              </label>
              <input
                type="text"
                id="search"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Nome, P.IVA, Codice Fiscale"
              />
            </div>
            
            <div>
              <label htmlFor="companyType" className="block text-sm font-medium text-gray-700">
                Tipo
              </label>
              <select
                id="companyType"
                name="companyType"
                value={filters.companyType}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Tutti</option>
                <option value="Individual">Individuale</option>
                <option value="Partnership">Società di persone</option>
                <option value="Corporation">Società di capitali</option>
                <option value="LLC">SRL</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="onboardingStatus" className="block text-sm font-medium text-gray-700">
                Stato Onboarding
              </label>
              <select
                id="onboardingStatus"
                name="onboardingStatus"
                value={filters.onboardingStatus}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Tutti</option>
                <option value="new">Nuovo</option>
                <option value="in_progress">In corso</option>
                <option value="completed">Completato</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-blue-600 border border-transparent rounded-lg active:bg-blue-600 hover:bg-blue-700 focus:outline-none focus:shadow-outline-blue"
              >
                Filtra
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {/* Lista clienti */}
      <div className="w-full overflow-hidden rounded-lg shadow-xs">
        <div className="w-full overflow-x-auto">
          {loading ? (
            <div className="text-center py-4">
              <p>Caricamento...</p>
            </div>
          ) : clients.length > 0 ? (
            <table className="w-full whitespace-no-wrap">
              <thead>
                <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b bg-gray-50">
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Contatto</th>
                  <th className="px-4 py-3">Stato</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Azioni</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y">
                {clients.map((client) => (
                  <tr key={client._id} className="text-gray-700">
                    <td className="px-4 py-3">
                      <div className="flex items-center text-sm">
                        <div>
                          <p className="font-semibold">{client.name}</p>
                          <p className="text-xs text-gray-600">
                            {client.vatNumber || client.fiscalCode}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {client.companyType}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {client.contactInfo?.email}<br />
                      {client.contactInfo?.phone}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 font-semibold leading-tight rounded-full ${
                        client.onboarding?.status === 'completed'
                          ? 'text-green-700 bg-green-100'
                          : client.onboarding?.status === 'in_progress'
                          ? 'text-orange-700 bg-orange-100'
                          : 'text-gray-700 bg-gray-100'
                      }`}>
                        {client.onboarding?.status === 'new'
                          ? 'Nuovo'
                          : client.onboarding?.status === 'in_progress'
                          ? 'In corso'
                          : client.onboarding?.status === 'completed'
                          ? 'Completato'
                          : 'N/D'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(client.createdAt).toLocaleDateString('it-IT')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Link
                        to={`/clients/${client._id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Dettagli
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600">Nessun cliente trovato.</p>
            </div>
          )}
        </div>
        
        {/* Paginazione */}
        {pagination.totalPages > 1 && (
          <div className="grid px-4 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase border-t bg-gray-50 sm:grid-cols-9">
            <span className="flex items-center col-span-3">
              Mostrando {((pagination.page - 1) * pagination.limit) + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)} di {pagination.total}
            </span>
            <span className="col-span-2"></span>
            <div className="flex col-span-4 mt-2 sm:mt-auto sm:justify-end">
              <nav aria-label="Table navigation">
                <ul className="inline-flex items-center">
                  <li>
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className={`px-3 py-1 rounded-md rounded-l-lg focus:outline-none focus:shadow-outline-blue ${
                        pagination.page === 1
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-blue-100'
                      }`}
                    >
                      Precedente
                    </button>
                  </li>
                  
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <li key={page}>
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded-md focus:outline-none focus:shadow-outline-blue ${
                          pagination.page === page
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-blue-100'
                        }`}
                      >
                        {page}
                      </button>
                    </li>
                  ))}
                  
                  <li>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className={`px-3 py-1 rounded-md rounded-r-lg focus:outline-none focus:shadow-outline-blue ${
                        pagination.page === pagination.totalPages
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-blue-100'
                      }`}
                    >
                      Successivo
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal per creazione cliente */}
      {isCreateModalOpen && (
        <ClientCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onClientCreated={handleClientCreated}
        />
      )}
    </div>
  );
};

export default ClientListPage;