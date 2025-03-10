// Importazioni
const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Carica variabili d'ambiente (deve essere prima di qualsiasi configurazione)
dotenv.config();

// Connessione al database (dopo dotenv.config)
const connectDB = require('./src/config/db');
connectDB();

// Importa middleware personalizzati
const errorHandler = require('./src/middleware/error');

// Importa rotte
const authRoutes = require('./src/routes/authRoutes');
const clientRoutes = require('./src/routes/clientRoutes');
const healthRoutes = require('./src/routes/healthRoute');
// Altre rotte qui...

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Logger per lo sviluppo
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Security middleware
app.use(helmet());

// Abilita CORS
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API server running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// Monta le rotte
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api', healthRoutes);
// Altre rotte qui...

// Homepage API
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Studio Assistant Pro API',
    version: '1.0.0'
  });
});

if (process.env.NODE_ENV === 'production') {
  // Imposta la cartella statica
  app.use(express.static(path.join(__dirname, '/client/dist')));

  // Tutte le richieste che non corrispondono a rotte API vanno all'app React
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint non trovato'
  });
});

// Middleware di gestione errori
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});

// Gestione errori non gestiti
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red.bold);
  // Chiudi server e termina processo
  server.close(() => process.exit(1));
});

module.exports = app;