// src/controllers/clientController.js
const Client = require('../models/Client');

// @desc    Create new client with auto-generated checklist
// @route   POST /api/clients
// @access  Private
exports.createClient = async (req, res) => {
  try {
    const { name, fiscalCode, vatNumber, companyType, contactInfo, legalRepresentative } = req.body;
    
    // Ottieni la checklist basata sul tipo di azienda
    const checklist = Client.generateChecklist(companyType);
    
    const client = await Client.create({
      name,
      fiscalCode,
      vatNumber,
      companyType,
      contactInfo,
      legalRepresentative,
      onboarding: {
        status: 'new',
        assignedTo: req.user.id, // Utente che ha creato il cliente
        checklist
      }
    });
    
    res.status(201).json({
      success: true,
      data: client
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};