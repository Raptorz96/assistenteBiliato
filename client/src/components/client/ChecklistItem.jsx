// src/components/client/ChecklistItem.jsx
const ChecklistItem = ({ item, onStatusChange, disabled }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'verified': return 'bg-green-500';
        case 'rejected': return 'bg-red-500';
        case 'uploaded': return 'bg-yellow-500';
        default: return 'bg-gray-500';
      }
    };
    
    const getStatusText = (status) => {
      switch (status) {
        case 'verified': return 'Verificato';
        case 'rejected': return 'Rifiutato';
        case 'uploaded': return 'Caricato';
        default: return 'In attesa';
      }
    };
    
    return (
      <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
        <div className="flex items-center">
          <div className={`w-4 h-4 rounded-full mr-4 ${getStatusColor(item.status)}`}></div>
          
          <div>
            <p className="text-gray-200 font-medium">
              {item.name}
              {item.required && <span className="text-red-400 ml-1">*</span>}
            </p>
            <p className="text-sm text-gray-400">
              Stato: {getStatusText(item.status)}
            </p>
          </div>
        </div>
        
        <select
          value={item.status}
          onChange={(e) => onStatusChange(item._id, e.target.value)}
          disabled={disabled}
          className="bg-gray-800 border border-gray-700 text-gray-200 rounded-md px-3 py-1 disabled:opacity-50"
        >
          <option value="pending">In attesa</option>
          <option value="uploaded">Caricato</option>
          <option value="verified">Verificato</option>
          <option value="rejected">Rifiutato</option>
        </select>
      </div>
    );
  };
  
  export default ChecklistItem;