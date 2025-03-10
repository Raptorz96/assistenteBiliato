// src/models/Document.js
const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client reference is required']
  },
  filename: {
    type: String,
    required: [true, 'Filename is required']
  },
  originalName: {
    type: String,
    required: [true, 'Original name is required']
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required']
  },
  size: {
    type: Number,
    required: [true, 'File size is required']
  },
  path: {
    type: String,
    required: [true, 'File path is required']
  },
  category: {
    type: String,
    enum: ['identity', 'fiscal', 'contract', 'registration', 'consent', 'other'],
    default: 'other'
  },
  tags: {
    type: [String],
    default: []
  },
  metadata: {
    docType: String,
    issueDate: Date,
    expiryDate: Date,
    extractedData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'verified', 'rejected'],
    default: 'pending'
  },
  processingResults: {
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    errors: {
      type: [String],
      default: []
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  }
}, {
  timestamps: true
});

// Indici per ottimizzare le query comuni
DocumentSchema.index({ clientId: 1 });
DocumentSchema.index({ category: 1 });
DocumentSchema.index({ status: 1 });
DocumentSchema.index({ 'metadata.issueDate': 1 });
DocumentSchema.index({ 'metadata.expiryDate': 1 });

// Virtual per ottenere l'URL del documento
DocumentSchema.virtual('fileUrl').get(function() {
  return `/api/documents/${this._id}/download`;
});

// Metodo per verificare se il documento è scaduto
DocumentSchema.methods.isExpired = function() {
  if (this.metadata && this.metadata.expiryDate) {
    return new Date(this.metadata.expiryDate) < new Date();
  }
  return false;
};

// Metodo per verificare se il documento sta per scadere (entro 30 giorni)
DocumentSchema.methods.isExpiringSoon = function(days = 30) {
  if (this.metadata && this.metadata.expiryDate) {
    const expiryDate = new Date(this.metadata.expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + days);
    
    return expiryDate < thirtyDaysFromNow && expiryDate >= new Date();
  }
  return false;
};

// Static method per trovare documenti in scadenza
DocumentSchema.statics.findExpiring = async function(days = 30) {
  const currentDate = new Date();
  const futureDate = new Date();
  futureDate.setDate(currentDate.getDate() + days);
  
  return this.find({
    'metadata.expiryDate': {
      $gte: currentDate,
      $lte: futureDate
    },
    status: 'verified'
  }).populate('clientId', 'name');
};

module.exports = mongoose.model('Document', DocumentSchema);