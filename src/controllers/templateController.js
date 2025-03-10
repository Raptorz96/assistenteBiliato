// src/controllers/templateController.js
const Template = require('../models/Template');
const Client = require('../models/Client');
const User = require('../models/User');
const Document = require('../models/Document');
const path = require('path');
const fs = require('fs').promises;
const { generatePdf, generateDocx } = require('../utils/documentGenerator');

// @desc    Generate document from template
// @route   POST /api/templates/:id/generate
// @access  Private
exports.generateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { clientId, customData } = req.body;
    
    // Trova il template
    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }
    
    if (!template.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Template is inactive'
      });
    }
    
    // Trova il cliente
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }
    
    // Trova l'utente corrente per i dati di contatto
    const user = await User.findById(req.user.id);
    
    // Prepara i dati per il template
    const templateData = {
      client: {
        name: client.name,
        fiscalCode: client.fiscalCode,
        vatNumber: client.vatNumber,
        address: client.contactInfo.address,
        email: client.contactInfo.email,
        phone: client.contactInfo.phone
      },
      user: {
        name: user.fullName,
        email: user.email,
        role: user.role
      },
      date: new Date().toLocaleDateString('it-IT'),
      ...customData
    };
    
    // Genera il documento in base al formato
    let generatedFilePath;
    let originalFilename;
    
    if (template.format === 'pdf') {
      originalFilename = `${template.name}_${client.name.replace(/\s+/g, '_')}.pdf`;
      generatedFilePath = await generatePdf(template.content, templateData, originalFilename);
    } else if (template.format === 'docx') {
      originalFilename = `${template.name}_${client.name.replace(/\s+/g, '_')}.docx`;
      generatedFilePath = await generateDocx(template.content, templateData, originalFilename);
    } else {
      // Per html, restituisci direttamente il contenuto compilato senza salvare
      const htmlContent = compileTemplate(template.content, templateData);
      return res.status(200).json({
        success: true,
        data: {
          content: htmlContent,
          format: 'html'
        }
      });
    }
    
    // Crea un record del documento nel database
    const document = await Document.create({
      clientId: client._id,
      filename: path.basename(generatedFilePath),
      originalName: originalFilename,
      mimeType: template.format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: (await fs.stat(generatedFilePath)).size,
      path: generatedFilePath,
      category: template.category === 'welcome' ? 'contract' : template.category,
      status: 'verified', // Documento generato internamente, già verificato
      createdBy: req.user.id
    });
    
    res.status(200).json({
      success: true,
      data: {
        document,
        downloadUrl: `/api/documents/${document._id}/download`
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Funzione per compilare template con dati
function compileTemplate(template, data) {
  // Semplice sistema di template con placeholders tipo {{client.name}}
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const keys = key.trim().split('.');
    let value = data;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return match;
    }
    
    return value;
  });
}