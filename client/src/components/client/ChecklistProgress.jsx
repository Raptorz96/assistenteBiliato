// src/components/client/ChecklistProgress.jsx
const ChecklistProgress = ({ checklist, status }) => {
    const calculateProgress = () => {
      if (!checklist || checklist.length === 0) return 0;
      
      const totalItems = checklist.length;
      const completedItems = checklist.filter(item => item.status === 'verified').length;
      
      return Math.round((completedItems / totalItems) * 100);
    };
    
    const progress = calculateProgress();
    
    const getStatusLabel = () => {
      switch (status) {
        case 'completed': return 'Completato';
        case 'in_progress': return 'In corso';
        case 'new': return 'Nuovo';
        default: return 'Sconosciuto';
      }
    };
    
    const getStatusColor = () => {
      switch (status) {
        case 'completed': return 'bg-green-600';
        case 'in_progress': return 'bg-blue-600';
        case 'new': return 'bg-gray-600';
        default: return 'bg-gray-600';
      }
    };
    
    return (
      <div className="bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-200">
            Progresso Onboarding
          </h3>
          <div className="flex items-center">
            <div className={`px-3 py-1 rounded-full text-white text-sm ${getStatusColor()}`}>
              {getStatusLabel()}
            </div>
            <span className="ml-2 text-blue-400 font-medium">{progress}%</span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Statistiche */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-700 p-3 rounded-lg">
            <p className="text-sm text-gray-400">Totale elementi</p>
            <p className="text-xl text-gray-200 font-semibold">{checklist.length}</p>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg">
            <p className="text-sm text-gray-400">Completati</p>
            <p className="text-xl text-green-400 font-semibold">
              {checklist.filter(item => item.status === 'verified').length}
            </p>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg">
            <p className="text-sm text-gray-400">In attesa</p>
            <p className="text-xl text-yellow-400 font-semibold">
              {checklist.filter(item => item.status !== 'verified').length}
            </p>
          </div>
        </div>
      </div>
    );
  };
  
  export default ChecklistProgress;