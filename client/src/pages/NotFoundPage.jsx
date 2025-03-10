// src/pages/NotFoundPage.jsx
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-6">Pagina non trovata</p>
      <p className="text-gray-500 mb-8">
        La pagina che stai cercando non esiste o è stata rimossa.
      </p>
      <Link 
        to="/dashboard" 
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Torna alla Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;