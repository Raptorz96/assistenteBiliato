// src/middleware/requestLogger.js
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const colors = require('colors');

/**
 * Configura il logger per le richieste HTTP
 * @param {Object} app - Express app
 */
const setupRequestLogger = (app) => {
  // Crea directory per i log se non esiste
  const logDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  // Formattazione colorata per l'ambiente di sviluppo
  if (process.env.NODE_ENV === 'development') {
    morgan.token('statusColor', (req, res) => {
      const status = res.statusCode;
      
      if (status >= 500) return colors.red(status);
      if (status >= 400) return colors.yellow(status);
      if (status >= 300) return colors.cyan(status);
      return colors.green(status);
    });
    
    morgan.token('methodColor', (req) => {
      const method = req.method;
      
      switch (method) {
        case 'GET': return colors.blue(method);
        case 'POST': return colors.green(method);
        case 'PUT': return colors.yellow(method);
        case 'DELETE': return colors.red(method);
        default: return colors.white(method);
      }
    });
    
    app.use(morgan(':methodColor :url :statusColor :response-time ms'));
  }
  
  // Log in file per l'ambiente di produzione
  if (process.env.NODE_ENV === 'production') {
    // Log di tutte le richieste
    const accessLogStream = fs.createWriteStream(
      path.join(logDir, 'access.log'),
      { flags: 'a' }
    );
    
    app.use(morgan('combined', {
      stream: accessLogStream
    }));
    
    // Log degli errori in file separato
    const errorLogStream = fs.createWriteStream(
      path.join(logDir, 'error.log'),
      { flags: 'a' }
    );
    
    app.use(morgan('combined', {
      skip: (req, res) => res.statusCode < 400,
      stream: errorLogStream
    }));
  }
};

module.exports = setupRequestLogger;