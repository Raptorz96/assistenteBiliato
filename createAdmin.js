// createAdmin.js - versione corretta
const mongoose = require('mongoose');
require('dotenv').config();

// URI di connessione
const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/assistenteBiliato';

async function createAdmin() {
  let connection = null;
  
  try {
    console.log('Connessione a MongoDB...');
    // Esplicitamente crea e memorizza la connessione
    connection = await mongoose.connect(dbUri);
    console.log('✅ Connessione a MongoDB stabilita con successo!');
    
    // IMPORTANTE: Carica il modello DOPO aver stabilito la connessione
    // E assicurati che il percorso sia corretto
    const User = require('./src/models/User');
    
    console.log('Verifica esistenza admin...');
    const adminExists = await User.findOne({ email: 'admin@tuodominio.it' });
    
    if (!adminExists) {
      console.log('Creazione nuovo admin...');
      const adminUser = new User({
        username: 'admin',
        email: 'admin@tuodominio.it',
        passwordHash: 'password123', // Verrà hashata dal middleware pre-save
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        permissions: [],
        status: 'active'
      });
      
      await adminUser.save();
      console.log('✅ Utente admin creato con successo!');
      console.log('Email: admin@tuodominio.it');
      console.log('Password: password123');
    } else {
      console.log('✅ Admin già esistente nel database');
    }
    
  } catch (err) {
    console.error('❌ Errore durante l\'operazione:');
    console.error(err);
    
    // Log informazioni aggiuntive per debug
    if (err.name === 'MongooseError') {
      console.error('\nIl problema sembra essere con Mongoose. Dettagli:');
      console.error('- Stato connessione:', mongoose.connection.readyState);
      console.error('- Percorso modello: ./src/models/User');
    }
    
  } finally {
    // Chiudi sempre la connessione
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('Disconnesso da MongoDB');
    }
  }
}

// Esegui la funzione e gestisci eventuali errori a livello più alto
createAdmin().catch(err => {
  console.error('❌ Errore non gestito:', err);
  process.exit(1);
});