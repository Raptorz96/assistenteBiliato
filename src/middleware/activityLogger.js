// src/middleware/activityLogger.js
const mongoose = require('mongoose');

// Schema per il log delle attività
const ActivityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'read', 'update', 'delete', 'status_change', 'generate_procedure']
  },
  resourceType: {
    type: String,
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  details: {
    type: Object
  },
  ipAddress: String,
  userAgent: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);

/**
 * Middleware per registrare le attività degli utenti
 * @param {String} action - Tipo di azione eseguita
 * @param {String} resourceType - Tipo di risorsa su cui è stata eseguita l'azione
 * @returns {Function} Middleware
 */
exports.logActivity = (action, resourceType) => {
  return async (req, res, next) => {
    // Memorizza la funzione send originale
    const originalSend = res.send;
    
    // Sovrascrive la funzione send
    res.send = function(data) {
      // Ripristina la funzione send originale
      res.send = originalSend;
      
      // Esegue il logging solo se la richiesta ha avuto successo e l'utente è autenticato
      try {
        const body = JSON.parse(data);
        
        if (body.success && req.user) {
          const resourceId = req.params.id || 
                            (body.data && body.data._id ? body.data._id : null);
          
          if (resourceId) {
            ActivityLog.create({
              user: req.user._id,
              action,
              resourceType,
              resourceId,
              details: {
                method: req.method,
                url: req.originalUrl,
                body: req.method === 'POST' || req.method === 'PUT' ? req.body : undefined
              },
              ipAddress: req.ip,
              userAgent: req.get('user-agent')
            }).catch(err => console.error('Errore nel logging attività:', err));
          }
        }
      } catch (err) {
        console.error('Errore nel parsing della risposta:', err);
      }
      
      // Continua con la risposta originale
      return originalSend.apply(res, arguments);
    };
    
    next();
  };
};

exports.ActivityLog = ActivityLog;