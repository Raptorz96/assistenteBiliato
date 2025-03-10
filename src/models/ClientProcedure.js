// src/models/ClientProcedure.js
const mongoose = require('mongoose');

const TaskAttachmentSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const ClientTaskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    required: [true, 'Original task ID is required']
  },
  name: {
    type: String,
    required: [true, 'Task name is required']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  completedDate: {
    type: Date
  },
  notes: {
    type: String
  },
  attachments: [TaskAttachmentSchema],
  remindersSent: {
    type: [Date],
    default: []
  }
});

const ClientProcedureSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client reference is required']
  },
  procedureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Procedure',
    required: [true, 'Procedure reference is required']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  expectedEndDate: {
    type: Date,
    required: [true, 'Expected end date is required']
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'on_hold', 'cancelled'],
    default: 'active'
  },
  tasks: [ClientTaskSchema],
  notes: {
    type: String
  },
  generatedBy: {
    type: String,
    enum: ['manual', 'automatic', 'ai'],
    default: 'manual'
  }
}, {
  timestamps: true
});

// Indici per ottimizzare le query
ClientProcedureSchema.index({ clientId: 1 });
ClientProcedureSchema.index({ procedureId: 1 });
ClientProcedureSchema.index({ status: 1 });
ClientProcedureSchema.index({ 'tasks.assignedTo': 1 });
ClientProcedureSchema.index({ 'tasks.status': 1 });
ClientProcedureSchema.index({ 'tasks.dueDate': 1 });

// Middleware per calcolare automaticamente la data di fine prevista
ClientProcedureSchema.pre('validate', async function(next) {
  if (this.isNew || this.isModified('startDate') || this.isModified('procedureId')) {
    try {
      const procedure = await mongoose.model('Procedure').findById(this.procedureId);
      if (procedure) {
        const durationInDays = procedure.getTotalDuration();
        const endDate = new Date(this.startDate);
        endDate.setDate(endDate.getDate() + durationInDays);
        this.expectedEndDate = endDate;
      }
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Static method per trovare procedure con attività in scadenza
ClientProcedureSchema.statics.findWithPendingTasks = async function(days = 7) {
  const currentDate = new Date();
  const futureDate = new Date();
  futureDate.setDate(currentDate.getDate() + days);
  
  return this.find({
    status: 'active',
    'tasks.status': { $in: ['pending', 'in_progress'] },
    'tasks.dueDate': {
      $gte: currentDate,
      $lte: futureDate
    }
  })
  .populate('clientId', 'name')
  .populate('tasks.assignedTo', 'firstName lastName email');
};

// Metodo per ottenere lo stato di avanzamento in percentuale
ClientProcedureSchema.methods.getProgressPercentage = function() {
  if (!this.tasks || this.tasks.length === 0) return 0;
  
  const totalTasks = this.tasks.length;
  const completedTasks = this.tasks.filter(task => task.status === 'completed').length;
  
  return Math.round((completedTasks / totalTasks) * 100);
};

// Metodo per verificare se tutti i task sono completati
ClientProcedureSchema.methods.isComplete = function() {
  if (!this.tasks || this.tasks.length === 0) return false;
  
  return this.tasks.every(task => task.status === 'completed');
};

module.exports = mongoose.model('ClientProcedure', ClientProcedureSchema);