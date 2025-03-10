// src/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('ERRORE: MONGODB_URI non definito nel file .env');
      console.log('Suggerimento: Crea un file .env con MONGODB_URI=mongodb://localhost:27017/assistenteBiliato');
      return console.log('MongoDB connection skipped - DB URI not provided');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    return conn;
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`.red);
    // Non terminare il processo in ambiente di sviluppo
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;