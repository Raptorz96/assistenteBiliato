// src/pages/ClientDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClient } from '../context/ClientContext';

const ClientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getClientById, updateClient } = useClient();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        const clientData = await getClientById(id);
        setClient(clientData);
      } catch (err) {
        console.error('Error fetching client details:', err);
        setError('Impossibile caricare i dettagli del cliente');
      } finally {
        setLoading(false);
      }
    };
    
    fetchClient();
  }, [id, getClientById]);
  
  if (loading) return <div className="p-4">Caricamento dettagli cliente...</div>;
  
  if (error) return (
    <div className="p-4 bg-red-100 text-red-700 rounded-md">
      {error}. <button onClick={() => navigate('/clients')} className="underline">Torna alla lista</button>
    </div>
  );
  
  if (!client) return (
    <div className="p-4">
      Cliente non trovato. <button onClick={() => navigate('/clients')} className="underline">Torna alla lista</button>
    </div>
  );
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{client.name}</h1>
      
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <h2 className="text-xl font-semibold mb-2">Informazioni Cliente</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><span className="font-medium">Tipo:</span> {client.companyType}</p>
            <p><span className="font-medium">Email:</span> {client.email}</p>
            <p><span className="font-medium">Telefono:</span> {client.phone || 'Non specificato'}</p>
          </div>
          <div>
            <p><span className="font-medium">Partita IVA:</span> {client.vatNumber || 'Non specificata'}</p>
            <p><span className="font-medium">Codice Fiscale:</span> {client.fiscalCode || 'Non specificato'}</p>
            <p><span className="font-medium">Data Inserimento:</span> {new Date(client.createdAt).toLocaleDateString('it-IT')}</p>
          </div>
        </div>
      </div>
      
      {client.services && client.services.length > 0 && (
        <div className="bg-white shadow rounded-lg p-4 mb-4">
          <h2 className="text-xl font-semibold mb-2">Servizi Richiesti</h2>
          <ul className="list-disc pl-5">
            {client.services.map((service, index) => (
              <li key={index}>{service}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <h2 className="text-xl font-semibold mb-2">Note</h2>
        <p>{client.notes || 'Nessuna nota disponibile'}</p>
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        <button 
          onClick={() => navigate('/clients')}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Indietro
        </button>
        <button 
          onClick={() => navigate(`/clients/${id}/edit`)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Modifica
        </button>
      </div>
    </div>
  );
};

export default ClientDetailPage;