// src/pages/TemplatePage.jsx
import { useState } from 'react';

const TemplatePage = () => {
  const [templates, setTemplates] = useState([
    { id: 1, name: 'Lettera di Benvenuto', type: 'welcome', description: 'Template per nuovi clienti' },
    { id: 2, name: 'Contratto Standard', type: 'contract', description: 'Contratto di servizi base' },
    { id: 3, name: 'Informativa Privacy', type: 'privacy', description: 'Informativa GDPR per clienti' },
    { id: 4, name: 'Lettera Commerciale', type: 'commercial', description: 'Per comunicazioni commerciali' }
  ]);
  
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gestione Template</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow rounded-lg p-4 col-span-1">
          <h2 className="text-xl font-semibold mb-4">Template Disponibili</h2>
          <ul className="divide-y">
            {templates.map(template => (
              <li 
                key={template.id} 
                className={`py-3 px-2 cursor-pointer hover:bg-gray-50 ${selectedTemplate?.id === template.id ? 'bg-blue-50' : ''}`}
                onClick={() => handleTemplateSelect(template)}
              >
                <h3 className="font-medium">{template.name}</h3>
                <p className="text-sm text-gray-600">{template.description}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full">
              Nuovo Template
            </button>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4 col-span-2">
          {selectedTemplate ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Editor Template</h2>
                <div className="space-x-2">
                  <button className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                    Anteprima
                  </button>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Salva
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Template
                </label>
                <input 
                  type="text" 
                  value={selectedTemplate.name}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select className="w-full p-2 border border-gray-300 rounded-md">
                  <option value="welcome">Benvenuto</option>
                  <option value="contract">Contratto</option>
                  <option value="privacy">Privacy</option>
                  <option value="commercial">Commerciale</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenuto
                </label>
                <textarea 
                  className="w-full p-2 border border-gray-300 rounded-md h-64 font-mono"
                  placeholder="Inserisci il contenuto del template..."
                  defaultValue={`Gentile {{clientName}},\n\nBenvenuto in Studio Biliato!\n\nSiamo lieti di averla come cliente e la ringraziamo per la fiducia.\n\nCordiali saluti,\nStudio Biliato`}
                ></textarea>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-2">Variabili disponibili:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-gray-100 text-sm rounded-md">{{clientName}}</span>
                  <span className="px-2 py-1 bg-gray-100 text-sm rounded-md">{{clientType}}</span>
                  <span className="px-2 py-1 bg-gray-100 text-sm rounded-md">{{vatNumber}}</span>
                  <span className="px-2 py-1 bg-gray-100 text-sm rounded-md">{{fiscalCode}}</span>
                  <span className="px-2 py-1 bg-gray-100 text-sm rounded-md">{{startDate}}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Seleziona un template per modificarlo
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplatePage;