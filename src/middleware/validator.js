const { body, param, query, validationResult } = require('express-validator');
const ErrorResponse = require('../utils/errorResponse');

// Middleware per validare i risultati
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array().map(e => e.msg).join(', '), 400));
  }
  next();
};

// Validazione creazione e aggiornamento cliente
exports.validateClient = [
  body('name')
    .notEmpty().withMessage('Il nome è obbligatorio')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Il nome deve essere tra 2 e 100 caratteri'),
  
  body('companyType')
    .notEmpty().withMessage('Il tipo di società è obbligatorio')
    .isIn(['Individual', 'Partnership', 'Corporation', 'LLC'])
    .withMessage('Tipo di società non valido'),
  
  body('contactInfo')
    .notEmpty().withMessage('Le informazioni di contatto sono obbligatorie')
    .isObject().withMessage('Le informazioni di contatto devono essere un oggetto'),
  
  body('contactInfo.email')
    .notEmpty().withMessage("L'email è obbligatoria")
    .isEmail().withMessage('Email non valida')
    .normalizeEmail(),
  
  body('contactInfo.phone')
    .notEmpty().withMessage('Il telefono è obbligatorio')
    .trim(),
  
  body('contactInfo.address')
    .notEmpty().withMessage("L'indirizzo è obbligatorio")
    .isObject().withMessage("L'indirizzo deve essere un oggetto valido"),
  
  body('fiscalCode')
    .optional({ checkFalsy: true })
    .custom((value, { req }) => {
      if (!value && !req.body.vatNumber) {
        throw new Error('È necessario fornire almeno uno tra Codice Fiscale e Partita IVA');
      }
      return true;
    }),
  
  validate
];

// Validazione ID cliente
exports.validateClientId = [
  param('id')
    .isMongoId().withMessage('ID cliente non valido'),
  validate
];

// Validazione stato onboarding
exports.validateOnboardingStatus = [
  param('id')
    .isMongoId().withMessage('ID cliente non valido'),
  
  body('status')
    .notEmpty().withMessage('Lo stato è obbligatorio')
    .isIn(['new', 'in_progress', 'completed'])
    .withMessage('Stato non valido (new, in_progress, completed)'),
  
  validate
];

// Validazione parametri di query
exports.validateQueryParams = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La pagina deve essere un numero positivo')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Il limite deve essere tra 1 e 100')
    .toInt(),
  
  validate
];

// NUOVE VALIDAZIONI PER CONTROLLER CLIENT

/**
 * @desc    Validazione per aggiornamento elemento checklist
 */
exports.validateChecklistItem = [
  param('id')
    .isMongoId().withMessage('ID cliente non valido'),
  
  param('itemId')
    .notEmpty().withMessage('ID elemento checklist obbligatorio'),
  
  body('status')
    .notEmpty().withMessage('Lo stato è obbligatorio')
    .isIn(['pending', 'uploaded', 'verified', 'rejected'])
    .withMessage('Stato non valido (pending, uploaded, verified, rejected)'),
  
  body('documentId')
    .optional()
    .isMongoId().withMessage('ID documento non valido'),
  
  validate
];

/**
 * @desc    Validazione per filtri avanzati nella ricerca clienti
 */
exports.validateClientFilters = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La pagina deve essere un numero positivo')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Il limite deve essere tra 1 e 100')
    .toInt(),
  
  query('status')
    .optional()
    .isIn(['new', 'in_progress', 'completed'])
    .withMessage('Stato onboarding non valido'),
  
  query('companyType')
    .optional()
    .isIn(['Individual', 'Partnership', 'Corporation', 'LLC'])
    .withMessage('Tipo di azienda non valido'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('La ricerca deve contenere almeno 2 caratteri'),
  
  query('assignedTo')
    .optional()
    .isMongoId().withMessage('ID utente assegnato non valido'),
  
  validate
];

/**
 * @desc    Validazione per generazione procedura AI
 */
exports.validateGenerateProcedure = [
  param('id')
    .isMongoId().withMessage('ID cliente non valido'),
  
  validate
];

module.exports = exports;