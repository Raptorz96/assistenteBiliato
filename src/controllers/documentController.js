// src/controllers/documentController.js
const Document = require('../models/Document');
const Client = require('../models/Client');

// @desc    Get all clients with expiring documents
// @route   GET /api/documents/expiring
// @access  Private
exports.getClientsWithExpiringDocuments = async (req, res) => {
 try {
   const days = parseInt(req.query.days) || 30;
   
   // Trova documenti in scadenza
   const expiringDocuments = await Document.findExpiring(days);
   
   // Raggruppa per cliente
   const clientMap = new Map();
   
   for (const doc of expiringDocuments) {
     if (!clientMap.has(doc.clientId._id.toString())) {
       clientMap.set(doc.clientId._id.toString(), {
         clientId: doc.clientId._id,
         clientName: doc.clientId.name,
         documents: []
       });
     }
     
     clientMap.get(doc.clientId._id.toString()).documents.push({
       documentId: doc._id,
       filename: doc.originalName,
       category: doc.category,
       expiryDate: doc.metadata.expiryDate
     });
   }
   
   res.status(200).json({
     success: true,
     count: clientMap.size,
     data: Array.from(clientMap.values())
   });
 } catch (err) {
   res.status(500).json({
     success: false,
     error: err.message
   });
 }
};