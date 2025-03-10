// src/services/tokenService.js
const tokenService = {
    // Salva il token nel localStorage
    setToken: (token) => {
      localStorage.setItem('token', token);
    },
    
    // Ottiene il token dal localStorage
    getToken: () => {
      return localStorage.getItem('token');
    },
    
    // Rimuove il token dal localStorage
    removeToken: () => {
      localStorage.removeItem('token');
    },
    
    // Decodifica il payload del token JWT
    decodeToken: (token) => {
      try {
        // Il token JWT è diviso in tre parti separate da punti
        // La seconda parte contiene il payload codificato in base64
        const payload = token.split('.')[1];
        
        // Decodifica il payload da base64
        const decodedPayload = atob(payload);
        
        // Converte il payload in oggetto JavaScript
        return JSON.parse(decodedPayload);
      } catch (error) {
        console.error('Errore durante la decodifica del token:', error);
        return null;
      }
    },
    
    // Verifica se il token è scaduto
    isTokenExpired: (token) => {
      if (!token) return true;
      
      try {
        const decoded = tokenService.decodeToken(token);
        
        if (!decoded || !decoded.exp) return true;
        
        // Calcola il timestamp attuale in secondi
        const currentTime = Math.floor(Date.now() / 1000);
        
        // Verifica se il token è scaduto
        return decoded.exp < currentTime;
      } catch (error) {
        console.error('Errore durante la verifica della scadenza del token:', error);
        return true;
      }
    },
    
    // Calcola il tempo rimanente prima della scadenza del token in millisecondi
    getTokenRemainingTime: (token) => {
      if (!token) return 0;
      
      try {
        const decoded = tokenService.decodeToken(token);
        
        if (!decoded || !decoded.exp) return 0;
        
        // Calcola il timestamp attuale in secondi
        const currentTime = Math.floor(Date.now() / 1000);
        
        // Calcola il tempo rimanente in millisecondi
        const remainingTime = (decoded.exp - currentTime) * 1000;
        
        return remainingTime > 0 ? remainingTime : 0;
      } catch (error) {
        console.error('Errore durante il calcolo del tempo rimanente del token:', error);
        return 0;
      }
    }
  };
  
  export default tokenService;