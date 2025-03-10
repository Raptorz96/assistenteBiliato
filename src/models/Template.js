// src/models/Template.js
const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  category: {
    type: String,
    enum: ['welcome', 'contract', 'report', 'fiscal', 'notification', 'other'],
    default: 'other'
  },
  format: {
    type: String,
    enum: ['html', 'docx', 'pdf'],
    required: [true, 'Format is required']
  },
  content: {
    type: String,
    required: [true, 'Template content is required']
  },
  variables: {
    type: [String],
    default: []
  },
  version: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
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
TemplateSchema.index({ category: 1 });
TemplateSchema.index({ format: 1 });
TemplateSchema.index({ isActive: 1 });

// Static method per ottenere l'ultima versione attiva di un template per nome
TemplateSchema.statics.getActiveByName = async function(name) {
  return this.findOne({
    name: name,
    isActive: true
  }).sort({ version: -1 });
};

// Middleware per incrementare la versione quando un template viene modificato
TemplateSchema.pre('save', async function(next) {
  if (this.isModified('content')) {
    // Se il contenuto è modificato, cerca la versione precedente
    if (!this.isNew) {
      const latestVersion = await this.constructor.findOne({
        name: this.name
      }).sort({ version: -1 });
      
      if (latestVersion) {
        this.version = latestVersion.version + 1;
      }
    }
  }
  next();
});

module.exports = mongoose.model('Template', TemplateSchema);