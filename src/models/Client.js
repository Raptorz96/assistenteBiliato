// src/models/Client.js
const mongoose = require('mongoose');

const StepSchema = new mongoose.Schema({
  name: String,
  description: String,
  order: Number
});

const TaskSchema = new mongoose.Schema({
  name: String,
  description: String,
  dueOffset: Number,
  assignedRole: String,
  requiredDocuments: [String],
  steps: [StepSchema]
});

const OperatingProcedureSchema = new mongoose.Schema({
  name: String,
  description: String,
  tasks: [TaskSchema]
});

const AddressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: [true, 'Street address is required']
  },
  city: {
    type: String,
    required: [true, 'City is required']
  },
  province: {
    type: String,
    required: [true, 'Province is required']
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required']
  },
  country: {
    type: String,
    default: 'Italy'
  }
});

const ContactInfoSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  address: {
    type: AddressSchema,
    required: true
  }
});

const LegalRepresentativeSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required']
  },
  fiscalCode: {
    type: String,
    required: [true, 'Fiscal code is required'],
    validate: {
      validator: function(v) {
        // Validazione codice fiscale italiano (16 caratteri alfanumerici)
        return /^[A-Za-z]{6}[0-9]{2}[A-Za-z][0-9]{2}[A-Za-z][0-9]{3}[A-Za-z]$/.test(v);
      },
      message: props => `${props.value} is not a valid Italian fiscal code!`
    }
  },
  role: {
    type: String,
    required: [true, 'Role is required']
  }
});

const ChecklistItemSchema = new mongoose.Schema({
  documentId: {
    type: String
  },
  name: {
    type: String,
    required: [true, 'Document name is required']
  },
  required: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['pending', 'uploaded', 'verified', 'rejected'],
    default: 'pending'
  },
  uploadedAt: {
    type: Date
  },
  verifiedAt: {
    type: Date
  }
});

const OnboardingSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['new', 'in_progress', 'completed'],
    default: 'new'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  completedDate: {
    type: Date
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  checklist: [ChecklistItemSchema]
});

const DataConsentSchema = new mongoose.Schema({
  marketing: {
    type: Boolean,
    default: false
  },
  thirdParty: {
    type: Boolean,
    default: false
  },
  consentDate: {
    type: Date
  }
});

const ClientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true
  },
  fiscalCode: {
    type: String,
    validate: {
      validator: function(v) {
        // Validazione codice fiscale italiano
        return /^[A-Za-z]{6}[0-9]{2}[A-Za-z][0-9]{2}[A-Za-z][0-9]{3}[A-Za-z]$/.test(v);
      },
      message: props => `${props.value} is not a valid Italian fiscal code!`
    }
  },
  vatNumber: {
    type: String,
    validate: {
      validator: function(v) {
        // Validazione partita IVA italiana (11 cifre)
        return /^[0-9]{11}$/.test(v);
      },
      message: props => `${props.value} is not a valid Italian VAT number!`
    }
  },
  companyType: {
    type: String,
    enum: ['Individual', 'Partnership', 'Corporation', 'LLC'],
    required: [true, 'Company type is required']
  },
  contactInfo: {
    type: ContactInfoSchema,
    required: true
  },
  legalRepresentative: {
    type: LegalRepresentativeSchema,
    required: function() {
      // Richiesto solo per aziende, non per individui
      return this.companyType !== 'Individual';
    }
  },
  onboarding: {
    type: OnboardingSchema,
    default: () => ({})
  },
  services: {
    type: [String],
    default: []
  },
  operatingProcedure: {
    type: OperatingProcedureSchema,
    default: null
  },
  notes: {
    type: String
  },
  tags: {
    type: [String],
    default: []
  },
  externalIds: {
    erpId: String,
    legacyId: String
  },
  dataConsent: {
    type: DataConsentSchema,
    default: () => ({})
  }
}, {
  timestamps: true
});

// Indici per ottimizzare le ricerche frequenti
ClientSchema.index({ name: 1 });
ClientSchema.index({ fiscalCode: 1 });
ClientSchema.index({ vatNumber: 1 });
ClientSchema.index({ 'onboarding.status': 1 });
ClientSchema.index({ 'onboarding.assignedTo': 1 });

// Middleware per garantire che almeno uno tra fiscalCode e vatNumber sia presente
ClientSchema.pre('validate', function(next) {
  if (!this.fiscalCode && !this.vatNumber) {
    this.invalidate('fiscalCode', 'Either Fiscal Code or VAT Number must be provided');
    this.invalidate('vatNumber', 'Either Fiscal Code or VAT Number must be provided');
  }
  next();
});

// Metodo per verificare se l'onboarding è completo
ClientSchema.methods.isOnboardingComplete = function() {
  if (this.onboarding.status === 'completed') {
    return true;
  }
  
  // Verifica che tutti i documenti richiesti siano verificati
  const requiredDocs = this.onboarding.checklist.filter(item => item.required);
  const verifiedDocs = requiredDocs.filter(item => item.status === 'verified');
  
  return requiredDocs.length > 0 && requiredDocs.length === verifiedDocs.length;
};

// Static method per generare checklist basata sul tipo di azienda
ClientSchema.statics.generateChecklist = function(companyType) {
  const baseDocuments = [
    { name: 'ID Document', required: true },
    { name: 'Fiscal Code Card', required: true },
    { name: 'Privacy Consent Form', required: true }
  ];
  
  let additionalDocuments = [];
  
  switch(companyType) {
    case 'Individual':
      additionalDocuments = [
        { name: 'VAT Registration', required: true },
        { name: 'Tax Regime Declaration', required: true }
      ];
      break;
    case 'Partnership':
      additionalDocuments = [
        { name: 'Partnership Deed', required: true },
        { name: 'VAT Registration', required: true },
        { name: 'Partner List', required: true }
      ];
      break;
    case 'Corporation':
    case 'LLC':
      additionalDocuments = [
        { name: 'Certificate of Incorporation', required: true },
        { name: 'Company Statute', required: true },
        { name: 'Chamber of Commerce Registration', required: true },
        { name: 'Director/Administrator ID', required: true }
      ];
      break;
  }
  
  return [...baseDocuments, ...additionalDocuments];
};

module.exports = mongoose.model('Client', ClientSchema);