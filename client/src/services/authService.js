// src/services/authService.js
import api from './api';
import tokenService from './tokenService';

// Disattiva temporaneamente il refresh automatico per debug
const DISABLE_AUTO_REFRESH = false; // MODIFICA: Attivato il refresh automatico

const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      tokenService.setToken(response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  logout: () => {
    console.log('authService: Executing logout cleanup');
    
    // Pulizia completa del localStorage - anche in caso di errore singolo
    try { tokenService.removeToken(); } catch (e) { console.error('authService: Error removing token', e); }
    try { localStorage.removeItem('user'); } catch (e) { console.error('authService: Error removing user', e); }
    try { localStorage.removeItem('refreshing'); } catch (e) { console.error('authService: Error removing refreshing', e); }
    try { localStorage.removeItem('lastRefreshTime'); } catch (e) { console.error('authService: Error removing lastRefreshTime', e); }
    try { localStorage.removeItem('theme'); } catch (e) { console.error('authService: Error removing theme', e); }
    
    // Verifica che tutto sia stato rimosso correttamente
    const remainingToken = localStorage.getItem('token');
    const remainingUser = localStorage.getItem('user');
    
    if (remainingToken || remainingUser) {
      console.warn('authService: WARNING - Auth data still present after cleanup', { 
        hasToken: !!remainingToken, 
        hasUser: !!remainingUser 
      });
      
      // Tentativo aggressivo di pulizia
      try {
        if (remainingToken) localStorage.removeItem('token');
        if (remainingUser) localStorage.removeItem('user');
      } catch (e) {
        console.error('authService: Error in aggressive cleanup', e);
      }
    }
    
    console.log('authService: Logout cleanup completed');
    return true;
  },
  
  refreshToken: async () => {
    try {
      console.log('Attempting to refresh token...');
      
      // Previene refresh se non c'è token
      const currentToken = tokenService.getToken();
      if (!currentToken) {
        console.log('No token to refresh, aborting refresh');
        throw new Error('No token available');
      }
      
      // Controllo della frequenza - non refreshare più spesso di ogni 2 minuti
      const lastRefreshTime = localStorage.getItem('lastRefreshTime');
      const currentTime = Date.now();
      const minRefreshInterval = 2 * 60 * 1000; // 2 minuti
      
      if (lastRefreshTime && (currentTime - parseInt(lastRefreshTime)) < minRefreshInterval) {
        const timeSinceLastRefresh = Math.round((currentTime - parseInt(lastRefreshTime))/1000);
        console.log(`Last refresh was ${timeSinceLastRefresh} seconds ago. Too frequent, aborting.`);
        throw new Error('Refresh attempt too frequent');
      }
      
      // Previene refresh loop inserendo flag
      if (localStorage.getItem('refreshing') === 'true') {
        console.log('Refresh already in progress, aborting');
        throw new Error('Refresh already in progress');
      }
      
      localStorage.setItem('refreshing', 'true');
      
      // Log dello stato del token prima della richiesta
      console.log('Bearer token for refresh request:', currentToken.substring(0, 20) + '...');
      
      const response = await api.post('/auth/refresh-token');
      console.log('Refresh response status:', response.status);
      
      // Salva il timestamp dell'ultimo refresh
      localStorage.setItem('lastRefreshTime', Date.now().toString());
      
      if (response.data.success === true && response.data.token) {
        console.log('Token refreshed successfully');
        tokenService.setToken(response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.removeItem('refreshing');
        return response.data;
      } else {
        console.warn('Refresh token response format invalid:', response.data);
        localStorage.removeItem('refreshing');
        throw new Error('Invalid refresh token response format');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      localStorage.removeItem('refreshing');
      
      // MODIFICA: Non facciamo logout automatico in nessun caso
      // authService.logout();
      
      throw error;
    }
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  isAuthenticated: () => {
    const token = tokenService.getToken();
    return token && !tokenService.isTokenExpired(token);
  },
  
  hasRole: (requiredRoles) => {
    const user = authService.getCurrentUser();
    if (!user) return false;
    
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(user.role);
    }
    return user.role === requiredRoles;
  },
  
  // Configura un timer per il refresh automatico del token
  setupTokenRefresh: (callback) => {
    // Se il refresh automatico è disattivato, non fare nulla
    if (DISABLE_AUTO_REFRESH) {
      console.log('⚠️ Auto-refresh is DISABLED for debugging');
      return null;
    }
    
    const token = tokenService.getToken();
    if (!token) return null;
    
    // Tempo rimanente prima della scadenza del token
    const remainingTime = tokenService.getTokenRemainingTime(token);
    console.log(`Token remaining time: ${Math.floor(remainingTime/1000/60)} minutes`);
    
    // MODIFICA: Aumentiamo i buffer di tempo per evitare refresh troppo frequenti
    
    // Se il token è già scaduto o sta per scadere, refresh con ritardo
    if (remainingTime <= 10 * 60 * 1000) { // 10 minuti prima della scadenza invece di 5
      console.log('Token expiring soon, scheduling refresh in 30 seconds');
      return setTimeout(callback, 30 * 1000); // 30 secondi invece di 10
    }
    
    // Altrimenti, imposta il timer per refreshare 10 minuti prima della scadenza
    const refreshTime = remainingTime - (10 * 60 * 1000); // 10 minuti invece di 5
    console.log(`Token refresh scheduled in ${Math.floor(refreshTime/1000/60)} minutes`);
    return setTimeout(callback, refreshTime);
  }
};

export default authService;