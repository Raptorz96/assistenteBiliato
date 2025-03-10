// src/middleware/error.js
const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log per debugging
  console.log(err.stack.red);
  
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Risorsa non trovata con id ${err.value}`;
    error = new ErrorResponse(message, 404);
  }
  
  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Valore duplicato inserito';
    error = new ErrorResponse(message, 400);
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }
  
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Errore del server'
  });
};

module.exports = errorHandler;