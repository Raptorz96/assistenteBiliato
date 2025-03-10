// src/routes/clientRoutes.js
const express = require('express');
const {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  updateOnboardingStatus,
  getChecklist,
  updateChecklistItem,
  generateClientProcedure
} = require('../controllers/clientController');

// Middleware
const { protect, authorize } = require('../middleware/auth');
const {
  validateClient,
  validateClientId,
  validateOnboardingStatus,
  validateQueryParams,
  validateClientFilters,
  validateChecklistItem
} = require('../middleware/validator');

const router = express.Router();

// Proteggi tutte le rotte
router.use(protect);

// Rotte principali
router
  .route('/')
  .get(validateClientFilters, getClients)
  .post(authorize('admin', 'manager'), validateClient, createClient);

router
  .route('/:id')
  .get(validateClientId, getClient)
  .put(authorize('admin', 'manager'), validateClientId, validateClient, updateClient)
  .delete(authorize('admin'), validateClientId, deleteClient);

// Rotte onboarding
router
  .route('/:id/onboarding/status')
  .put(
    authorize('admin', 'manager', 'operator'), 
    validateOnboardingStatus, 
    updateOnboardingStatus
  );

// Rotte checklist
router
  .route('/:id/checklist')
  .get(validateClientId, getChecklist);

router
  .route('/:id/checklist/:itemId')
  .put(
    authorize('admin', 'manager', 'operator'),
    validateChecklistItem,
    updateChecklistItem
  );

// Rotta procedura
router
  .route('/:id/procedure')
  .post(
    authorize('admin', 'manager'),
    validateClientId,
    generateClientProcedure
  );

module.exports = router;