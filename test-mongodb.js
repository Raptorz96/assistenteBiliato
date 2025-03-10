// test-mongodb.js
const mongoose = require('mongoose');
require('dotenv').config();

// Recupera l'URI dal file .env o usa un default
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/assistenteBiliato';

console.log('Tentativo di connessione a MongoDB...');
console.log(`URI utilizzato: ${uri}`);

mongoose.connect(uri)
  .then(() => {
    console.log('Connessione a MongoDB riuscita!');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Errore di connessione a MongoDB:');
    console.error(err);
  });