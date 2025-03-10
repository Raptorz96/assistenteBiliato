// src/services/api.js
import axios from 'axios';

// Utilizziamo il path relativo per sfruttare il proxy configurato in vite.config.js
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor per aggiungere il token JWT alle richieste
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor per gestire errori di risposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gestione token scaduto o non valido
    if (error.response && error.response.status === 401) {
      // Solo se non siamo già nella pagina di login
      // E se non stiamo già tentando di refreshare il token
      if (!window.location.pathname.includes('/login') && 
          !error.config.url.includes('/refresh-token') &&
          localStorage.getItem('refreshing') !== 'true') {
        console.log('Token scaduto, reindirizzamento al login...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshing');
        // Utilizziamo history invece del redirect immediato
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;