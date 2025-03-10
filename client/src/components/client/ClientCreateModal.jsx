// src/components/client/ClientCreateModal.jsx
import { useState } from 'react';
import { useClient } from '../../context/ClientContext';

const ClientCreateModal = ({ isOpen, onClose, onClientCreated }) => {
  const { createClient, loading, error } = useClient();
  
  const [formData, setFormData] = useState({
    name: '',
    companyType: 'Individual',
    fiscalCode: '',
    vatNumber: '',
    contactInfo: {
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        province: '',
        postalCode: '',
        country: 'Italy'
      }
    }
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Il nome è obbligatorio';
    }
    
    if (!formData.fiscalCode.trim() && !formData.vatNumber.trim()) {
      errors.fiscalCode = 'Inserire almeno uno tra Codice Fiscale e Partita IVA';
      errors.vatNumber = 'Inserire almeno uno tra Codice Fiscale e Partita IVA';
    }
    
    if (!formData.contactInfo.email.trim()) {
      errors.email = 'L\'email è obbligatoria';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.contactInfo.email)) {
      errors.email = 'Email non valida';
    }
    
    if (!formData.contactInfo.phone.trim()) {
      errors.phone = 'Il telefono è obbligatorio';
    }
    
    // Validazione indirizzo
    if (!formData.contactInfo.address.street.trim()) {
      errors.street = 'L\'indirizzo è obbligatorio';
    }
    
    if (!formData.contactInfo.address.city.trim()) {
      errors.city = 'La città è obbligatoria';
    }
    
    if (!formData.contactInfo.address.province.trim()) {
      errors.province = 'La provincia è obbligatoria';
    }
    
    if (!formData.contactInfo.address.postalCode.trim()) {
      errors.postalCode = 'Il CAP è obbligatorio';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Gestione campi nidificati (contactInfo)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      contactInfo: {
        ...formData.contactInfo,
        address: {
          ...formData.contactInfo.address,
          [name]: value
        }
      }
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await createClient(formData);
      onClientCreated();
    } catch (err) {
      console.error('Error creating client:', err);
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      }
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Nuovo Cliente
                </h3>
                
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    {/* Nome cliente */}
                    <div className="sm:col-span-4">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Nome / Ragione Sociale
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            formErrors.name ? 'border-red-300' : ''
                          }`}
                        />
                        {formErrors.name && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Tipo azienda */}
                    <div className="sm:col-span-2">
                      <label htmlFor="companyType" className="block text-sm font-medium text-gray-700">
                        Tipo
                      </label>
                      <div className="mt-1">
                        <select
                          id="companyType"
                          name="companyType"
                          value={formData.companyType}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        >
                          <option value="Individual">Individuale</option>
                          <option value="Partnership">Società di persone</option>
                          <option value="Corporation">Società di capitali</option>
                          <option value="LLC">SRL</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Codice Fiscale */}
                    <div className="sm:col-span-3">
                      <label htmlFor="fiscalCode" className="block text-sm font-medium text-gray-700">
                        Codice Fiscale
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="fiscalCode"
                          id="fiscalCode"
                          value={formData.fiscalCode}
                          onChange={handleChange}
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            formErrors.fiscalCode ? 'border-red-300' : ''
                          }`}
                        />
                        {formErrors.fiscalCode && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.fiscalCode}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Partita IVA */}
                    <div className="sm:col-span-3">
                      <label htmlFor="vatNumber" className="block text-sm font-medium text-gray-700">
                        Partita IVA
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="vatNumber"
                          id="vatNumber"
                          value={formData.vatNumber}
                          onChange={handleChange}
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            formErrors.vatNumber ? 'border-red-300' : ''
                          }`}
                        />
                        {formErrors.vatNumber && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.vatNumber}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Email */}
                    <div className="sm:col-span-3">
                      <label htmlFor="contactInfo.email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <div className="mt-1">
                        <input
                          type="email"
                          name="contactInfo.email"
                          id="contactInfo.email"
                          value={formData.contactInfo.email}
                          onChange={handleChange}
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            formErrors.email ? 'border-red-300' : ''
                          }`}
                        />
                        {formErrors.email && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Telefono */}
                    <div className="sm:col-span-3">
                      <label htmlFor="contactInfo.phone" className="block text-sm font-medium text-gray-700">
                        Telefono
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="contactInfo.phone"
                          id="contactInfo.phone"
                          value={formData.contactInfo.phone}
                          onChange={handleChange}
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            formErrors.phone ? 'border-red-300' : ''
                          }`}
                        />
                        {formErrors.phone && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Indirizzo - Via */}
                    <div className="sm:col-span-6">
                      <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                        Via/Piazza
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="street"
                          id="street"
                          value={formData.contactInfo.address.street}
                          onChange={handleAddressChange}
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            formErrors.street ? 'border-red-300' : ''
                          }`}
                        />
                        {formErrors.street && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.street}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Città */}
                    <div className="sm:col-span-2">
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        Città
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="city"
                          id="city"
                          value={formData.contactInfo.address.city}
                          onChange={handleAddressChange}
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            formErrors.city ? 'border-red-300' : ''
                          }`}
                        />
                        {formErrors.city && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Provincia */}
                    <div className="sm:col-span-2">
                      <label htmlFor="province" className="block text-sm font-medium text-gray-700">
                        Provincia
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="province"
                          id="province"
                          value={formData.contactInfo.address.province}
                          onChange={handleAddressChange}
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            formErrors.province ? 'border-red-300' : ''
                          }`}
                        />
                        {formErrors.province && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.province}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* CAP */}
                    <div className="sm:col-span-2">
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                        CAP
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="postalCode"
                          id="postalCode"
                          value={formData.contactInfo.address.postalCode}
                          onChange={handleAddressChange}
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            formErrors.postalCode ? 'border-red-300' : ''
                          }`}
                        />
                        {formErrors.postalCode && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.postalCode}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Errore API */}
                  {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
                      {error}
                    </div>
                  )}
                  
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                    >
                      {loading ? 'Salvataggio...' : 'Salva'}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    >
                      Annulla
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientCreateModal;