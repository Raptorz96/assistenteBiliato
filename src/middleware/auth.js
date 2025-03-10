// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Middleware per proteggere le rotte
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  
  // Estrai il token dall'header Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    // Oppure dai cookie per il frontend
    token = req.cookies.token;
  }
  
  // Verifica se il token esiste
  if (!token) {
    return next(new ErrorResponse('Accesso non autorizzato', 401));
  }
  
  try {
    // Verifica il token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Aggiungi l'utente alla request
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return next(new ErrorResponse('Utente non trovato', 401));
    }
    
    next();
  } catch (err) {
    return next(new ErrorResponse('Accesso non autorizzato', 401));
  }
});

// Middleware per autorizzare ruoli specifici
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `Ruolo ${req.user.role} non autorizzato per questa operazione`,
          403
        )
      );
    }
    next();
  };
};