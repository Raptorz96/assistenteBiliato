// src/tests/test-models.js
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Client = require('../models/Client');
const User = require('../models/User');
const Document = require('../models/Document');
const Template = require('../models/Template');
const Procedure = require('../models/Procedure');
const ClientProcedure = require('../models/ClientProcedure');

// Funzione per formattare l'output dei risultati
const logResult = (testName, success, details = null) => {
  if (success) {
    console.log(`✅ PASS: ${testName}`);
  } else {
    console.log(`❌ FAIL: ${testName}`);
    if (details) console.error(details);
  }
  console.log('----------------------------');
};

async function runTests() {
  try {
    // Connessione al database
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected to MongoDB. Running tests...\n');

    // Test 1: Creazione di un utente
    try {
      const user = new User({
        username: 'test_user',
        email: 'test@example.com',
        passwordHash: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'operator'
      });

      await user.save();
      const savedUser = await User.findOne({ username: 'test_user' });
      
      logResult('User creation', 
        savedUser && 
        savedUser.email === 'test@example.com' && 
        savedUser.role === 'operator'
      );

      // Verificare che la password sia hashata
      const isHashDifferent = user.passwordHash !== 'password123';
      logResult('Password hashing', isHashDifferent);

      // Testare la proprietà fullName (virtual)
      logResult('User fullName virtual', user.fullName === 'Test User');

    } catch (err) {
      logResult('User creation and validation', false, err);
    }

    // Test 2: Validatori del modello Client
    try {
      // Test con codice fiscale non valido
      const invalidClient = new Client({
        name: 'Test Client',
        fiscalCode: 'INVALID',
        companyType: 'Individual',
        contactInfo: {
          email: 'client@example.com',
          phone: '123456789',
          address: {
            street: 'Via Roma 1',
            city: 'Roma',
            province: 'RM',
            postalCode: '00100'
          }
        }
      });

      let validationError;
      try {
        await invalidClient.validate();
      } catch (err) {
        validationError = err;
      }

      logResult('Client validation with invalid fiscal code', 
        validationError && 
        validationError.errors && 
        validationError.errors.fiscalCode
      );

      // Test con dati validi
      const validClient = new Client({
        name: 'Valid Client',
        fiscalCode: 'RSSMRA80A01H501U', // Codice fiscale italiano valido
        companyType: 'Individual',
        contactInfo: {
          email: 'valid@example.com',
          phone: '123456789',
          address: {
            street: 'Via Roma 1',
            city: 'Roma',
            province: 'RM',
            postalCode: '00100'
          }
        }
      });

      await validClient.save();
      logResult('Client creation with valid data', true);

      // Test del metodo generateChecklist
      const checklist = Client.generateChecklist('Corporation');
      logResult('Client generateChecklist static method', 
        Array.isArray(checklist) && 
        checklist.length > 0 &&
        checklist.some(item => item.name === 'Certificate of Incorporation')
      );

      // Aggiornare il cliente con una checklist
      validClient.onboarding.checklist = checklist;
      await validClient.save();
      logResult('Client update with checklist', true);

      // Test del metodo isOnboardingComplete
      logResult('Client isOnboardingComplete method (should be false)', 
        !validClient.isOnboardingComplete()
      );

      // Aggiornare lo stato dei documenti nella checklist
      validClient.onboarding.checklist.forEach(item => {
        item.status = 'verified';
      });
      await validClient.save();
      
      // Verificare che l'onboarding sia ora completo
      validClient.onboarding.status = 'completed';
      await validClient.save();
      logResult('Client isOnboardingComplete method (should be true)', 
        validClient.isOnboardingComplete()
      );

    } catch (err) {
      logResult('Client model tests', false, err);
    }

    // Test 3: Modello Document
    try {
      // Ottenere il cliente e l'utente per associarli al documento
      const client = await Client.findOne({ name: 'Valid Client' });
      const user = await User.findOne({ username: 'test_user' });

      const document = new Document({
        clientId: client._id,
        filename: 'test_document.pdf',
        originalName: 'Test Document.pdf',
        mimeType: 'application/pdf',
        size: 12345,
        path: '/uploads/test_document.pdf',
        category: 'identity',
        metadata: {
          docType: 'ID Card',
          issueDate: new Date('2020-01-01'),
          expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 giorni nel futuro
        },
        status: 'verified',
        createdBy: user._id
      });

      await document.save();
      logResult('Document creation', true);

      // Test del metodo isExpired
      logResult('Document isExpired method (should be false)', 
        !document.isExpired()
      );

      // Test del metodo isExpiringSoon
      logResult('Document isExpiringSoon method (should be true)', 
        document.isExpiringSoon(30)
      );

      // Test del metodo findExpiring
      const expiringDocs = await Document.findExpiring(30);
      logResult('Document findExpiring static method', 
        Array.isArray(expiringDocs) && 
        expiringDocs.length > 0
      );

    } catch (err) {
      logResult('Document model tests', false, err);
    }

    // Test 4: Modello Template
    try {
      const user = await User.findOne({ username: 'test_user' });

      const template = new Template({
        name: 'Welcome Letter',
        description: 'Standard welcome letter for new clients',
        category: 'welcome',
        format: 'html',
        content: '<h1>Welcome {{client.name}}!</h1><p>We are happy to have you as a client.</p>',
        variables: ['client.name'],
        createdBy: user._id
      });

      await template.save();
      logResult('Template creation', true);

      // Modificare il contenuto e verificare che la versione aumenti
      template.content = '<h1>Welcome {{client.name}}!</h1><p>We are delighted to have you as a client.</p>';
      await template.save();
      
      logResult('Template versioning', template.version === 2);

      // Test del metodo getActiveByName
      const activeTemplate = await Template.getActiveByName('Welcome Letter');
      logResult('Template getActiveByName static method', 
        activeTemplate && 
        activeTemplate.name === 'Welcome Letter' &&
        activeTemplate.isActive === true
      );

    } catch (err) {
      logResult('Template model tests', false, err);
    }

    // Test 5: Modello Procedure
    try {
      const procedure = new Procedure({
        name: 'New Client Onboarding',
        description: 'Standard procedure for onboarding new individual clients',
        clientType: 'Individual',
        tasks: [
          {
            name: 'Initial Assessment',
            description: 'Evaluate client needs and tax situation',
            dueOffset: 3,
            assignedRole: 'operator',
            requiredDocuments: ['ID Card', 'Fiscal Code'],
            reminderDays: [1, 3],
            steps: [
              {
                name: 'Interview client',
                description: 'Conduct initial interview',
                order: 1
              },
              {
                name: 'Document collection',
                description: 'Collect required documents',
                order: 2
              }
            ]
          },
          {
            name: 'Tax Setup',
            description: 'Configure tax parameters',
            dueOffset: 7,
            assignedRole: 'admin',
            requiredDocuments: ['Tax Information'],
            reminderDays: [2, 5],
            steps: [
              {
                name: 'Configure tax settings',
                description: 'Set up tax parameters in system',
                order: 1
              }
            ]
          }
        ]
      });

      await procedure.save();
      logResult('Procedure creation', true);

      // Test del metodo getTotalDuration
      logResult('Procedure getTotalDuration method', 
        procedure.getTotalDuration() === 7
      );

      // Test del metodo findForClientType
      const procedures = await Procedure.findForClientType('Individual');
      logResult('Procedure findForClientType static method', 
        Array.isArray(procedures) && 
        procedures.length > 0 &&
        procedures.some(p => p.name === 'New Client Onboarding')
      );

    } catch (err) {
      logResult('Procedure model tests', false, err);
    }

    // Test 6: Modello ClientProcedure
    try {
      const client = await Client.findOne({ name: 'Valid Client' });
      const procedure = await Procedure.findOne({ name: 'New Client Onboarding' });
      const user = await User.findOne({ username: 'test_user' });

      const clientProcedure = new ClientProcedure({
        clientId: client._id,
        procedureId: procedure._id,
        startDate: new Date(),
        tasks: procedure.tasks.map(task => ({
          taskId: task._id,
          name: task.name,
          assignedTo: user._id,
          status: 'pending',
          dueDate: new Date(Date.now() + task.dueOffset * 24 * 60 * 60 * 1000)
        }))
      });

      await clientProcedure.save();
      logResult('ClientProcedure creation', true);

      // Test del metodo getProgressPercentage
      logResult('ClientProcedure getProgressPercentage method (0%)', 
        clientProcedure.getProgressPercentage() === 0
      );

      // Aggiornare lo stato di un task
      clientProcedure.tasks[0].status = 'completed';
      clientProcedure.tasks[0].completedDate = new Date();
      await clientProcedure.save();

      // Verificare che il progresso sia aggiornato
      logResult('ClientProcedure getProgressPercentage method (50%)', 
        clientProcedure.getProgressPercentage() === 50
      );

      // Test del metodo isComplete
      logResult('ClientProcedure isComplete method (should be false)', 
        !clientProcedure.isComplete()
      );

      // Completare tutti i task
      clientProcedure.tasks.forEach(task => {
        task.status = 'completed';
        task.completedDate = new Date();
      });
      await clientProcedure.save();

      // Verificare che la procedura sia ora completa
      logResult('ClientProcedure isComplete method (should be true)', 
        clientProcedure.isComplete()
      );

      // Test del metodo findWithPendingTasks
      const pendingProcedures = await ClientProcedure.findWithPendingTasks(7);
      logResult('ClientProcedure findWithPendingTasks static method',
        Array.isArray(pendingProcedures)
      );

    } catch (err) {
      logResult('ClientProcedure model tests', false, err);
    }

    // Pulizia dei dati di test
    console.log('\nCleaning up test data...');
    await User.deleteOne({ username: 'test_user' });
    const client = await Client.findOne({ name: 'Valid Client' });
    if (client) {
      await Document.deleteMany({ clientId: client._id });
      await ClientProcedure.deleteMany({ clientId: client._id });
      await client.deleteOne();
    }
    await Template.deleteOne({ name: 'Welcome Letter' });
    await Procedure.deleteOne({ name: 'New Client Onboarding' });
    console.log('Cleanup complete!');

  } catch (err) {
    console.error('Test failed with error:', err);
  } finally {
    // Chiudere la connessione al database
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('\nClosed MongoDB connection');
    }
  }
}

// Eseguire i test
runTests().catch(err => {
  console.error('Error in runTests:', err);
  mongoose.connection.close();
});