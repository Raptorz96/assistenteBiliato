// src/models/Procedure.js
const mongoose = require('mongoose');

const StepSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Step name is required']
  },
  description: {
    type: String
  },
  order: {
    type: Number,
    required: [true, 'Step order is required']
  }
});

const TaskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Task name is required']
  },
  description: {
    type: String,
    required: [true, 'Task description is required']
  },
  dueOffset: {
    type: Number,
    default: 7,
    min: 0,
    description: 'Days from procedure start date'
  },
  assignedRole: {
    type: String,
    required: [true, 'Assigned role is required']
  },
  requiredDocuments: {
    type: [String],
    default: []
  },
  reminderDays: {
    type: [Number],
    default: [1, 3, 7],
    description: 'Days before due date to send reminders'
  },
  steps: [StepSchema]
});

const ProcedureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Procedure name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  clientType: {
    type: String,
    enum: ['Individual', 'Partnership', 'Corporation', 'LLC', 'All'],
    required: [true, 'Client type is required']
  },
  tasks: [TaskSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indici per ottimizzare le query
ProcedureSchema.index({ clientType: 1 });
ProcedureSchema.index({ isActive: 1 });

// Metodo per ottenere il numero totale di giorni per completare la procedura
ProcedureSchema.methods.getTotalDuration = function() {
  if (!this.tasks || this.tasks.length === 0) return 0;
  
  return Math.max(...this.tasks.map(task => task.dueOffset));
};

// Static method per trovare procedure applicabili a un tipo di cliente
ProcedureSchema.statics.findForClientType = function(clientType) {
  return this.find({
    $or: [
      { clientType: clientType },
      { clientType: 'All' }
    ],
    isActive: true
  });
};

module.exports = mongoose.model('Procedure', ProcedureSchema);