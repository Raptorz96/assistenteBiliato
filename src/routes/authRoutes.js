// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, getMe, refreshToken } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Rotta per la registrazione degli utenti
router.route('/register').post(register);

// Rotta per il login
router.route('/login').post(login);

// Rotta per il refresh del token
router.route('/refresh-token').post(refreshToken);

// Rotta per ottenere il profilo dell'utente corrente (protetta)
router.route('/me').get(protect, getMe);

module.exports = router;