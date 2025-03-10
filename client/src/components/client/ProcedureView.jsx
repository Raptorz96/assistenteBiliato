// src/components/client/ProcedureView.jsx
import React, { useState } from 'react';

const ProcedureView = ({ procedure, onStatusChange }) => {
  const [expanded, setExpanded] = useState({});

  const toggleTask = (taskId) => {
    setExpanded({
      ...expanded,
      [taskId]: !expanded[taskId]
    });
  };

  if (!procedure || !procedure.tasks || procedure.tasks.length === 0) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg shadow border border-gray-700">
        <p className="text-gray-400 text-center">Nessuna procedura disponibile</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-xl font-semibold text-gray-200">{procedure.name}</h3>
        <p className="mt-2 text-gray-400">{procedure.description}</p>
      </div>

      <div className="p-4">
        <h4 className="text-lg font-medium text-gray-300 mb-4">Attività da Svolgere</h4>
        
        <div className="space-y-4">
          {procedure.tasks.map((task, index) => (
            <div key={task._id || index} className="bg-gray-750 rounded-lg border border-gray-700">
              <div 
                className="p-4 flex justify-between items-center cursor-pointer"
                onClick={() => toggleTask(task._id || index)}
              >
                <div className="flex items-center">
                  <div className={`p-2 mr-3 rounded-full ${
                    task.status === 'completed' ? 'bg-green-100 bg-opacity-20 text-green-400' : 
                    task.status === 'in_progress' ? 'bg-amber-100 bg-opacity-20 text-amber-400' : 
                    'bg-blue-100 bg-opacity-20 text-blue-400'
                  }`}>
                    {task.status === 'completed' ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                      </svg>
                    ) : task.status === 'in_progress' ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"></path>
                      </svg>
                    )}
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-200">{task.name}</h5>
                    <p className="text-sm text-gray-400">Scadenza: {task.dueDate ? new Date(task.dueDate).toLocaleDateString('it-IT') : 'Non definita'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className={`px-2 py-1 mr-3 text-xs rounded-full ${
                    task.status === 'completed' ? 'bg-green-900 bg-opacity-40 text-green-400' : 
                    task.status === 'in_progress' ? 'bg-amber-900 bg-opacity-40 text-amber-400' : 
                    'bg-blue-900 bg-opacity-40 text-blue-400'
                  }`}>
                    {task.status === 'completed' ? 'Completato' : 
                     task.status === 'in_progress' ? 'In Corso' : 'Da Iniziare'}
                  </span>
                  
                  <svg className={`w-5 h-5 text-gray-400 transform transition-transform ${expanded[task._id || index] ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
              
              {expanded[task._id || index] && (
                <div className="p-4 border-t border-gray-700">
                  <p className="text-gray-300 mb-4">{task.description}</p>
                  
                  {task.steps && task.steps.length > 0 && (
                    <div className="mt-4">
                      <h6 className="text-sm font-medium text-gray-400 mb-2">Passi da seguire:</h6>
                      <ul className="space-y-2 pl-5">
                        {task.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="text-gray-300 flex items-start">
                            <span className="inline-block w-5 h-5 mr-2 bg-gray-700 rounded-full text-gray-300 flex-shrink-0 text-xs flex items-center justify-center">
                              {step.order || stepIndex + 1}
                            </span>
                            <span>{step.name} - {step.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {task.requiredDocuments && task.requiredDocuments.length > 0 && (
                    <div className="mt-4">
                      <h6 className="text-sm font-medium text-gray-400 mb-2">Documenti richiesti:</h6>
                      <ul className="space-y-1 pl-5">
                        {task.requiredDocuments.map((doc, docIndex) => (
                          <li key={docIndex} className="text-gray-300">{doc}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="mt-6 flex space-x-3">
                    {task.status !== 'completed' && (
                      <button
                        onClick={() => onStatusChange(task._id || index, 'completed')}
                        className="px-3 py-1 bg-green-700 bg-opacity-30 text-green-400 rounded hover:bg-opacity-50 transition"
                      >
                        Segna come completato
                      </button>
                    )}
                    
                    {task.status !== 'in_progress' && task.status !== 'completed' && (
                      <button
                        onClick={() => onStatusChange(task._id || index, 'in_progress')}
                        className="px-3 py-1 bg-amber-700 bg-opacity-30 text-amber-400 rounded hover:bg-opacity-50 transition"
                      >
                        Avvia
                      </button>
                    )}
                    
                    {task.status === 'completed' && (
                      <button
                        onClick={() => onStatusChange(task._id || index, 'pending')}
                        className="px-3 py-1 bg-gray-700 bg-opacity-30 text-gray-300 rounded hover:bg-opacity-50 transition"
                      >
                        Riapri
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProcedureView;