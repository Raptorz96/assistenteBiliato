const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Carica variabili d'ambiente
dotenv.config();

async function createAdmin() {
  try {
    // Usa il database reale invece di un in-memory server
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/studioAssistant';
    
    console.log(`Connecting to MongoDB: ${mongoURI}`);
    await mongoose.connect(mongoURI);
    
    // Genera hash della password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    
    console.log('Creating admin user...');
    await User.create({
      username: 'admin',
      email: 'admin@tuodominio.it',
      passwordHash: passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      permissions: ['create_user', 'edit_user', 'delete_user', 'all'],
      status: 'active'
    });
    
    console.log('Admin user created successfully!');
    console.log('You can use these credentials for testing:');
    console.log('Email: admin@tuodominio.it');
    console.log('Password: password123');
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (mongoose.connection.readyState) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  }
}

createAdmin();