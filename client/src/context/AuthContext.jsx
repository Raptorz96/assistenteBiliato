// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import tokenService from '../services/tokenService';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Mock dell'utente per l'ambiente di sviluppo
const MOCK_USER = {
  id: 'dev-user-123',
  firstName: 'Mario',
  lastName: 'Rossi',
  email: 'commercialista@example.com',
  role: 'admin',
  avatar: null,
  settings: {
    theme: 'light',
    notifications: true
  },
  lastLogin: new Date().toISOString(),
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-03-07T10:30:00.000Z'
};

export const AuthProvider = ({ children }) => {
  const isDev = process.env.NODE_ENV === 'development';
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tokenRefreshTimer, setTokenRefreshTimer] = useState(null);
  const [refreshingToken, setRefreshingToken] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const refreshToken = useCallback(async () => {
    // In modalità sviluppo, non facciamo niente
    if (isDev) {
      console.log('Development mode: token refresh bypassed');
      return { user: MOCK_USER, token: 'fake-dev-token' };
    }
    
    try {
      console.log('AuthContext: Initiating token refresh...');
      
      // Blocca refresh multipli usando state
      if (refreshingToken) {
        console.log('AuthContext: Refresh already in progress via state, skipping');
        return null;
      }
      
      // Blocca refresh se è già in corso in localStorage
      if (localStorage.getItem('refreshing') === 'true') {
        console.log('AuthContext: Refresh already in progress via localStorage, skipping');
        return null;
      }
      
      setRefreshingToken(true);
      
      const data = await authService.refreshToken();
      
      if (data && data.user && data.token) {
        console.log('AuthContext: Token refreshed successfully, updating user');
        setUser(data.user);
        setIsAuthenticated(true);
        // Imposta manualmente un timeout prima di pianificare il prossimo refresh
        // questo previene possibili loop di refresh
        setTimeout(() => {
          setupTokenRefresh();
          setRefreshingToken(false);
        }, 1000);
        return data;
      } else {
        console.warn('AuthContext: Invalid refresh data received');
        throw new Error('Invalid refresh data');
      }
    } catch (err) {
      console.error('AuthContext: Error during token refresh:', err);
      setRefreshingToken(false);
      
      // Non fare logout automaticamente se l'errore è solo "refresh troppo frequente"
      if (err.message && err.message === 'Refresh attempt too frequent') {
        console.log('AuthContext: Skipping logout for too frequent refresh, will retry later');
        // Pianifica comunque un nuovo refresh dopo un ritardo adeguato
        const timer = setTimeout(refreshToken, 2 * 60 * 1000); // 2 minuti
        setTokenRefreshTimer(timer);
      } else {
        // Solo per errori più gravi facciamo logout
        logout();
      }
      return null;
    }
  }, [refreshingToken, isDev]);

  const setupTokenRefresh = useCallback(() => {
    // In modalità sviluppo, non facciamo niente
    if (isDev) {
      console.log('Development mode: token refresh scheduling bypassed');
      return;
    }
    
    // Non pianificare un nuovo refresh se è già in corso
    if (refreshingToken) {
      console.log('AuthContext: Not scheduling refresh while already refreshing');
      return;
    }
    
    // Pulire il timer esistente
    if (tokenRefreshTimer) {
      console.log('AuthContext: Clearing existing refresh timer');
      clearTimeout(tokenRefreshTimer);
    }

    // Impostare il nuovo timer
    const token = tokenService.getToken();
    if (!token) {
      console.log('AuthContext: No token available, not scheduling refresh');
      return;
    }
    
    const remainingTime = tokenService.getTokenRemainingTime(token);
    // Aumentato l'intervallo minimo tra i refresh
    const minRefreshInterval = 10 * 60 * 1000; // 10 minuti
    
    let refreshTime;
    if (remainingTime <= minRefreshInterval) {
      // Aumentato il tempo di attesa per token in scadenza
      refreshTime = 30 * 1000; // 30 secondi
      console.log('AuthContext: Token expiring soon, scheduling refresh in 30 seconds');
    } else {
      // Refresha 10 minuti prima della scadenza
      refreshTime = remainingTime - minRefreshInterval;
      console.log(`AuthContext: Scheduling refresh in ${Math.round(refreshTime/1000)} seconds`);
    }
    
    const timer = setTimeout(refreshToken, refreshTime);
    setTokenRefreshTimer(timer);
  }, [tokenRefreshTimer, refreshToken, refreshingToken, isDev]);

  useEffect(() => {
    // In modalità sviluppo, controlliamo se c'è un token di test
    if (isDev) {
      const hasToken = !!localStorage.getItem('token');
      console.log('Development mode: checking authentication status', { hasToken });
      
      if (hasToken) {
        // Se c'è un token, inizializziamo l'utente mock
        setUser(MOCK_USER);
        setIsAuthenticated(true);
      } else {
        // Se non c'è token, resettiamo lo stato
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setLoading(false);
      return;
    }
    
    const initAuth = async () => {
      try {
        setLoading(true);
        const currentUser = authService.getCurrentUser();
        
        if (currentUser && authService.isAuthenticated()) {
          console.log('User already authenticated:', currentUser);
          setUser(currentUser);
          setIsAuthenticated(true);
          setupTokenRefresh();
        } else if (currentUser) {
          // Token scaduto ma utente in localStorage
          console.log('Token expired, refreshing...');
          await refreshToken();
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError('Errore durante l\'inizializzazione dell\'autenticazione');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer);
      }
    };
  }, [setupTokenRefresh, refreshToken, isDev]);

  const login = async (credentials) => {
    // In modalità sviluppo, simuliamo un login di successo
    if (isDev) {
      console.log('Development mode: login bypassed, using mock user');
      setUser(MOCK_USER);
      setIsAuthenticated(true);
      
      // Salviamo un token fittizio nel localStorage
      localStorage.setItem('token', 'fake-dev-token');
      localStorage.setItem('user', JSON.stringify(MOCK_USER));
      
      return { user: MOCK_USER, token: 'fake-dev-token' };
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await authService.login(credentials);
      console.log('Login successful, data received:', data);
      // Imposta l'utente nello stato React
      setUser(data.user);
      setIsAuthenticated(true);
      // Verifica che il token sia valido
      if (data.token) {
        console.log('Valid token received');
      }
      // Aggiungi un ritardo prima di impostare il refresh
      setTimeout(() => {
        setupTokenRefresh();
      }, 1000);
      return data;
    } catch (err) {
      console.error('Login error in AuthContext:', err);
      setError(err.response?.data?.message || 'Errore durante il login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    return new Promise((resolve, reject) => {
      try {
        console.log('AuthContext: Executing logout...');
        
        // Imposta subito lo stato di loading per prevenire operazioni durante il logout
        setLoading(true);
        
        // 1. Prima cosa: cancella immediatamente i timer per evitare operazioni asincrone indesiderate
        if (tokenRefreshTimer) {
          console.log('AuthContext: Clearing token refresh timer');
          clearTimeout(tokenRefreshTimer);
          setTokenRefreshTimer(null);
        }
        setRefreshingToken(false);
        
        // 2. Rimuovi prima le autorizzazioni per prevenire chiamate API durante il logout
        if (api?.defaults?.headers) {
          if (api.defaults.headers.common?.Authorization) {
            console.log('AuthContext: Cleaning Axios auth headers');
            delete api.defaults.headers.common.Authorization;
          }
        }
        
        // 3. Usa il servizio di autenticazione per la pulizia completa
        console.log('AuthContext: Calling authService.logout()');
        const logoutSuccess = authService.logout();
        
        if (!logoutSuccess && !isDev) {
          console.warn('AuthContext: authService.logout() had issues - attempting direct cleanup');
          // Backup: pulizia diretta
          try { localStorage.removeItem('token'); } catch (e) { console.error('Error removing token:', e); }
          try { localStorage.removeItem('user'); } catch (e) { console.error('Error removing user:', e); }
          try { localStorage.removeItem('refreshing'); } catch (e) { console.error('Error removing refreshing:', e); }
          try { localStorage.removeItem('lastRefreshTime'); } catch (e) { console.error('Error removing lastRefreshTime:', e); }
        }
        
        // 4. Aggiorna lo stato React immediatamente, poi schedula una verifica
        setUser(null);
        setIsAuthenticated(false);
        setError(null);
        
        console.log('AuthContext: Initial state reset completed, scheduling verification...');
        
        // 5. Schedula una verifica per assicurarsi che tutto sia stato pulito correttamente
        setTimeout(() => {
          // Verifica che localStorage sia stato effettivamente pulito
          const hasToken = !!localStorage.getItem('token');
          const hasUser = !!localStorage.getItem('user');
          
          if (hasToken || hasUser) {
            console.error('AuthContext: Critical error - Auth data still in localStorage after logout', {
              hasToken,
              hasUser
            });
            
            // Ultimo tentativo di pulizia
            if (hasToken) localStorage.removeItem('token');
            if (hasUser) localStorage.removeItem('user');
            
            // Assicurati che lo stato sia corretto
            setUser(null);
            setIsAuthenticated(false);
          }
          
          // Verifica anche API headers
          if (api?.defaults?.headers?.common?.Authorization) {
            console.error('AuthContext: Critical error - Auth headers still in Axios after logout');
            delete api.defaults.headers.common.Authorization;
          }
          
          // Resetta lo stato di loading
          setLoading(false);
          console.log('AuthContext: Logout completed and verified');
          resolve(true); // Risolvi la promise solo dopo la verifica
        }, 100); // Tempo sufficiente per completare tutte le operazioni asincrone
      } catch (error) {
        console.error('AuthContext: Error during logout:', error);
        
        // Anche in caso di errore, esegui una pulizia di emergenza
        try {
          // Pulizia localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('refreshing');
          localStorage.removeItem('lastRefreshTime');
          
          // Pulizia stato React
          setUser(null);
          setIsAuthenticated(false);
          setError(null);
          setLoading(false);
          
          // Pulizia Axios
          if (api?.defaults?.headers?.common) {
            delete api.defaults.headers.common.Authorization;
          }
        } catch (e) {
          console.error('AuthContext: Error in emergency cleanup:', e);
        }
        
        reject(error);
      }
    });
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    refreshToken,
    isAuthenticated,
    // Helper per verificare i ruoli
    hasRole: (role) => {
      if (isDev && user) return true; // In dev mode con utente, tutte le verifiche di ruolo passano
      return authService.hasRole(role);
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;