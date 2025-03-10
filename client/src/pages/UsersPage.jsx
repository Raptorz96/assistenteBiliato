// src/pages/UsersPage.jsx
import { useState } from 'react';

const UsersPage = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin', lastLogin: '2023-04-20' },
    { id: 2, name: 'Manager', email: 'manager@example.com', role: 'manager', lastLogin: '2023-04-19' },
    { id: 3, name: 'Operator', email: 'operator@example.com', role: 'operator', lastLogin: '2023-04-18' },
    { id: 4, name: 'User', email: 'user@example.com', role: 'operator', lastLogin: '2023-04-15' }
  ]);
  
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const handleAddUser = () => {
    setCurrentUser(null);
    setShowModal(true);
  };
  
  const handleEditUser = (user) => {
    setCurrentUser(user);
    setShowModal(true);
  };
  
  const handleDeleteUser = (userId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo utente?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };
  
  const handleSaveUser = (formData) => {
    if (currentUser) {
      // Edit existing user
      setUsers(users.map(user => 
        user.id === currentUser.id ? { ...user, ...formData } : user
      ));
    } else {
      // Add new user
      const newUser = {
        id: Math.max(...users.map(u => u.id)) + 1,
        ...formData,
        lastLogin: '-'
      };
      setUsers([...users, newUser]);
    }
    setShowModal(false);
  };
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestione Utenti</h1>
        <button
          onClick={handleAddUser}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Nuovo Utente
        </button>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ruolo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ultimo Accesso
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                      user.role === 'manager' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.lastLogin}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Modifica
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Elimina
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Modal for adding/editing users */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {currentUser ? 'Modifica Utente' : 'Nuovo Utente'}
              </h3>
            </div>
            
            <UserForm
              user={currentUser}
              onSave={handleSaveUser}
              onCancel={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// User form component for the modal
const UserForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'operator',
    password: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ruolo
        </label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="operator">Operator</option>
        </select>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {user ? 'Nuova Password (lasciare vuoto per non modificare)' : 'Password'}
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required={!user}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Annulla
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Salva
        </button>
      </div>
    </form>
  );
};

export default UsersPage;