// src/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Registra un nuovo utente
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { username, email, password, firstName, lastName, role } = req.body;

  // Verifica se email o username esistono già
  const existingUser = await User.findOne({ 
    $or: [{ email }, { username }] 
  });

  if (existingUser) {
    return next(
      new ErrorResponse('Email o username già registrati', 400)
    );
  }

  // Crea il nuovo utente
  const user = await User.create({
    username,
    email,
    passwordHash: password, // La password verrà hashata automaticamente nel modello
    firstName,
    lastName,
    role
  });

  // Invia token di risposta
  sendTokenResponse(user, 201, res);
});

/**
 * @desc    Effettua il login di un utente
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    console.log('Login request received:', req.body);
    const { email, password } = req.body;
    
    // Debug: Verifica requisiti
    if (!email || !password) {
      console.log('Missing credentials');
      return res.status(400).json({ 
        success: false,
        message: 'Inserisci email e password' 
      });
    }
    
    // Debug: Verifica utente
    const user = await User.findOne({ email }).select('+passwordHash');
    console.log('User found:', user ? user._id : 'Not found');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenziali non valide' 
      });
    }
    
    // Debug: Verifica password
    const isMatch = await user.matchPassword(password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenziali non valide' 
      });
    }
    
    // Genera token JWT
    const token = user.getSignedJwtToken();
    
    // Opzioni per il cookie
    const options = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    };

    // Imposta cookie sicuro in produzione
    if (process.env.NODE_ENV === 'production') {
      options.secure = true;
    }

    // Ritorna il token sia come cookie che nel body della risposta
    res
      .status(200)
      .cookie('token', token, options)
      .json({
        success: true,
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status
        }
      });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Errore durante il login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Refresh del token JWT
 * @route   POST /api/auth/refresh-token
 * @access  Private
 */
exports.refreshToken = async (req, res) => {
  try {
    // Ottieni il token dall'header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Token non fornito nell\'header Authorization');
      return res.status(401).json({ 
        success: false,
        message: 'Token non fornito' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    console.log('Refresh token ricevuto, elaborazione...');
    
    // Verifica il token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verificato con successo per utente:', decoded.id);
    } catch (error) {
      console.log('Errore verifica token:', error.message);
      return res.status(401).json({ 
        success: false,
        message: 'Token non valido o scaduto' 
      });
    }
    
    // Trova l'utente
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('Utente non trovato:', decoded.id);
      return res.status(404).json({ 
        success: false,
        message: 'Utente non trovato' 
      });
    }
    
    console.log('Generazione nuovo token per utente:', user._id);
    
    // Genera un nuovo token
    const newToken = user.getSignedJwtToken();
    
    // Opzioni per il cookie
    const options = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    };

    // Imposta cookie sicuro in produzione
    if (process.env.NODE_ENV === 'production') {
      options.secure = true;
    }
    
    // Non includere passwordHash nella risposta
    const userData = user.toObject();
    delete userData.passwordHash;
    
    console.log('Token refreshed successfully');
    
    // Ritorna il token sia come cookie che nel body della risposta
    res
      .status(200)
      .cookie('token', newToken, options)
      .json({
        success: true,
        token: newToken,
        user: userData
      });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Errore durante il refresh del token' 
    });
  }
};

/**
 * @desc    Ottiene utente corrente
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * Funzione helper per inviare il token JWT
 */
const sendTokenResponse = (user, statusCode, res) => {
  // Crea token
  const token = user.getSignedJwtToken();

  // Opzioni per il cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  // Imposta cookie sicuro in produzione
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  // Non includere passwordHash nella risposta
  const userData = user.toObject();
  delete userData.passwordHash;

  // Ritorna il token sia come cookie che nel body della risposta
  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: userData
    });
};