// src/pages/ChecklistPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClient } from '../context/ClientContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ChecklistItem from '../components/client/ChecklistItem';
import ChecklistProgress from '../components/client/ChecklistProgress';

const ChecklistPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchClient, currentClient, updateClient, loading } = useClient();
  const { hasRole } = useAuth();
  const [updating, setUpdating] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchClient(id);
    }
  }, [id, fetchClient]);
  
  const handleStatusChange = async (itemId, newStatus) => {
    if (!hasRole(['admin', 'manager', 'operator'])) return;
    
    try {
      setUpdating(true);
      
      const updatedChecklist = currentClient.onboarding.checklist.map(item => 
        item._id === itemId ? { ...item, status: newStatus } : item
      );
      
      // Calcola il nuovo stato dell'onboarding basato sulla completezza della checklist
      const allComplete = updatedChecklist.every(item => 
        item.status === 'verified' || !item.required
      );
      
      const onboardingStatus = allComplete ? 'completed' : 'in_progress';
      
      await updateClient(currentClient._id, {
        onboarding: {
          ...currentClient.onboarding,
          status: onboardingStatus,
          checklist: updatedChecklist
        }
      });
      
    } catch (err) {
      console.error('Failed to update checklist item:', err);
    } finally {
      setUpdating(false);
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!currentClient) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-md p-6 mx-auto max-w-2xl text-center">
        <h2 className="text-xl text-red-400 mb-4">Cliente non trovato</h2>
        <button
          onClick={() => navigate('/clients')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Torna alla lista
        </button>
      </div>
    );
  }
  
  return (
    <div className="container px-6 mx-auto">
      <div className="flex justify-between items-center my-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-200">
            Onboarding {currentClient.name}
          </h2>
          <p className="text-gray-400">
            {currentClient.vatNumber || currentClient.fiscalCode}
          </p>
        </div>
        
        <button
          onClick={() => navigate(`/clients/${id}`)}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Dettagli Cliente
        </button>
      </div>
      
      {/* Progresso onboarding */}
      <ChecklistProgress 
        checklist={currentClient.onboarding?.checklist || []}
        status={currentClient.onboarding?.status || 'new'}
      />
      
      {/* Lista documenti/step */}
      <div className="bg-gray-800 rounded-lg shadow-md p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">
          Documenti e Verifiche
        </h3>
        
        {currentClient.onboarding?.checklist?.length > 0 ? (
          <div className="space-y-4">
            {currentClient.onboarding.checklist.map((item) => (
              <ChecklistItem
                key={item._id}
                item={item}
                onStatusChange={handleStatusChange}
                disabled={updating || !hasRole(['admin', 'manager', 'operator'])}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-400">Nessun elemento nella checklist.</p>
        )}
      </div>
    </div>
  );
};

export default ChecklistPage;