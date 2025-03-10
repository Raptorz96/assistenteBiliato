// src/controllers/clientController.js
const Client = require('../models/Client');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const aiService = require('../services/aiService');

/**
 * @desc    Recupera tutti i clienti con filtri e paginazione
 * @route   GET /api/clients
 * @access  Private
 * @param   {Object} req - Express request object
 * @param   {Object} req.query - Query parameters
 * @param   {number} [req.query.page=1] - Pagina corrente
 * @param   {number} [req.query.limit=10] - Numero di risultati per pagina
 * @param   {string} [req.query.status] - Filtro per stato onboarding
 * @param   {string} [req.query.companyType] - Filtro per tipo società
 * @param   {string} [req.query.search] - Ricerca testuale su nome, codice fiscale, p.iva, email
 * @param   {string} [req.query.assignedTo] - Filtro per utente assegnato
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 * @returns {Object} - Lista clienti, conteggio, paginazione
 */
exports.getClients = asyncHandler(async (req, res, next) => {
  // Recupero parametri di query per filtri e paginazione
  const { page = 1, limit = 10, status, companyType, search, assignedTo } = req.query;
  
  // Costruisco filtro di ricerca
  const filter = {};
  
  if (status) {
    filter['onboarding.status'] = status;
  }
  
  if (companyType) {
    filter.companyType = companyType;
  }
  
  if (assignedTo) {
    filter['onboarding.assignedTo'] = assignedTo;
  }
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { fiscalCode: { $regex: search, $options: 'i' } },
      { vatNumber: { $regex: search, $options: 'i' } },
      { 'contactInfo.email': { $regex: search, $options: 'i' } }
    ];
  }
  
  // Calcolo parametri paginazione
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = parseInt(page) * parseInt(limit);
  const total = await Client.countDocuments(filter);
  
  // Eseguo query con paginazione e popolamento
  const clients = await Client.find(filter)
    .populate({
      path: 'onboarding.assignedTo',
      select: 'name email'
    })
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(parseInt(limit));
  
  // Preparo oggetto paginazione per risposta
  const pagination = {};
  
  if (endIndex < total) {
    pagination.next = {
      page: parseInt(page) + 1,
      limit
    };
  }
  
  if (startIndex > 0) {
    pagination.prev = {
      page: parseInt(page) - 1,
      limit
    };
  }
  
  res.status(200).json({
    success: true,
    count: clients.length,
    pagination,
    data: clients,
    total
  });
});

/**
 * @desc    Recupera un singolo cliente con i suoi dati completi
 * @route   GET /api/clients/:id
 * @access  Private
 * @param   {Object} req - Express request object
 * @param   {Object} req.params - URL parameters
 * @param   {string} req.params.id - ID del cliente 
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 * @returns {Object} - Dati cliente
 */
exports.getClient = asyncHandler(async (req, res, next) => {
  const client = await Client.findById(req.params.id).populate({
    path: 'onboarding.assignedTo',
    select: 'name email'
  });
  
  if (!client) {
    return next(
      new ErrorResponse(`Cliente non trovato con id ${req.params.id}`, 404)
    );
  }
  
  res.status(200).json({
    success: true,
    data: client
  });
});

/**
 * @desc    Crea un nuovo cliente e genera la checklist basata sul tipo di azienda
 * @route   POST /api/clients
 * @access  Private (admin, manager)
 * @param   {Object} req - Express request object
 * @param   {Object} req.body - Request body 
 * @param   {string} req.body.name - Nome cliente
 * @param   {string} req.body.companyType - Tipo società
 * @param   {Object} req.body.contactInfo - Informazioni di contatto
 * @param   {string} req.body.fiscalCode - Codice fiscale (opzionale se presente VAT)
 * @param   {string} req.body.vatNumber - Partita IVA (opzionale se presente fiscalCode)
 * @param   {Object} req.user - Utente autenticato
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 * @returns {Object} - Cliente creato con dati completi
 */
exports.createClient = asyncHandler(async (req, res, next) => {
  // Verifica input minimi necessari
  const { name, companyType, contactInfo } = req.body;
  
  if (!name || !companyType || !contactInfo) {
    return next(
      new ErrorResponse('Dati obbligatori mancanti', 400)
    );
  }
  
  // Se l'utente è autenticato, assegna l'onboarding a lui
  if (req.user) {
    req.body.onboarding = {
      ...req.body.onboarding,
      assignedTo: req.user.id,
      status: 'new',
      startDate: Date.now()
    };
  }
  
  // Genera checklist predefinita in base al tipo di azienda
  const checklist = Client.generateChecklist(companyType);
  
  // Aggiungi checklist alla richiesta
  req.body.onboarding = {
    ...req.body.onboarding,
    checklist
  };
  
  // Crea il cliente
  const client = await Client.create(req.body);
  
  res.status(201).json({
    success: true,
    data: client
  });
});

/**
 * @desc    Aggiorna i dati di un cliente esistente
 * @route   PUT /api/clients/:id
 * @access  Private (admin, manager)
 * @param   {Object} req - Express request object
 * @param   {Object} req.params - URL parameters
 * @param   {string} req.params.id - ID del cliente
 * @param   {Object} req.body - Dati da aggiornare
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 * @returns {Object} - Cliente aggiornato con dati completi
 */
exports.updateClient = asyncHandler(async (req, res, next) => {
  let client = await Client.findById(req.params.id);
  
  if (!client) {
    return next(
      new ErrorResponse(`Cliente non trovato con id ${req.params.id}`, 404)
    );
  }
  
  // Aggiorna il cliente (con validazione)
  client = await Client.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: client
  });
});

/**
 * @desc    Elimina un cliente
 * @route   DELETE /api/clients/:id
 * @access  Private (solo admin)
 * @param   {Object} req - Express request object
 * @param   {Object} req.params - URL parameters
 * @param   {string} req.params.id - ID del cliente
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 * @returns {Object} - Conferma eliminazione
 */
exports.deleteClient = asyncHandler(async (req, res, next) => {
  const client = await Client.findById(req.params.id);
  
  if (!client) {
    return next(
      new ErrorResponse(`Cliente non trovato con id ${req.params.id}`, 404)
    );
  }
  
  // Nota: In produzione, spesso è meglio "soft delete" con un flag isDeleted
  await client.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Aggiorna lo stato di onboarding di un cliente
 * @route   PUT /api/clients/:id/onboarding/status
 * @access  Private (admin, manager, operator)
 * @param   {Object} req - Express request object
 * @param   {Object} req.params - URL parameters
 * @param   {string} req.params.id - ID del cliente
 * @param   {Object} req.body - Request body
 * @param   {string} req.body.status - Nuovo stato ('new', 'in_progress', 'completed')
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 * @returns {Object} - Cliente aggiornato
 */
exports.updateOnboardingStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  
  if (!status || !['new', 'in_progress', 'completed'].includes(status)) {
    return next(
      new ErrorResponse('Fornire uno stato valido', 400)
    );
  }
  
  const client = await Client.findById(req.params.id);
  
  if (!client) {
    return next(
      new ErrorResponse(`Cliente non trovato con id ${req.params.id}`, 404)
    );
  }
  
  // Prepara oggetto di aggiornamento
  const updateData = { 'onboarding.status': status };
  
  // Se lo stato è 'completed', registra la data di completamento
  if (status === 'completed') {
    updateData['onboarding.completedDate'] = Date.now();
  }
  
  // Aggiorna il cliente
  const updatedClient = await Client.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true }
  );
  
  res.status(200).json({
    success: true,
    data: updatedClient
  });
});

/**
 * @desc    Ottiene la checklist documenti di un cliente
 * @route   GET /api/clients/:id/checklist
 * @access  Private
 * @param   {Object} req - Express request object
 * @param   {Object} req.params - URL parameters
 * @param   {string} req.params.id - ID del cliente
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 * @returns {Object} - Array della checklist documenti
 */
exports.getChecklist = asyncHandler(async (req, res, next) => {
  const client = await Client.findById(req.params.id);
  
  if (!client) {
    return next(
      new ErrorResponse(`Cliente non trovato con id ${req.params.id}`, 404)
    );
  }
  
  res.status(200).json({
    success: true,
    data: client.onboarding.checklist || []
  });
});

/**
 * @desc    Aggiorna stato di un elemento della checklist
 * @route   PUT /api/clients/:id/checklist/:itemId
 * @access  Private (admin, manager, operator)
 * @param   {Object} req - Express request object
 * @param   {Object} req.params - URL parameters
 * @param   {string} req.params.id - ID del cliente
 * @param   {string} req.params.itemId - ID dell'elemento checklist
 * @param   {Object} req.body - Request body
 * @param   {string} req.body.status - Nuovo stato ('pending', 'uploaded', 'verified', 'rejected')
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 * @returns {Object} - Checklist aggiornata
 */
exports.updateChecklistItem = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const { id, itemId } = req.params;
  
  if (!status || !['pending', 'uploaded', 'verified', 'rejected'].includes(status)) {
    return next(
      new ErrorResponse('Fornire uno stato valido', 400)
    );
  }
  
  const client = await Client.findById(id);
  
  if (!client) {
    return next(
      new ErrorResponse(`Cliente non trovato con id ${id}`, 404)
    );
  }
  
  // Trova l'elemento della checklist
  const checklistItem = client.onboarding.checklist.id(itemId);
  
  if (!checklistItem) {
    return next(
      new ErrorResponse(`Elemento checklist non trovato con id ${itemId}`, 404)
    );
  }
  
  // Aggiorna lo stato e i timestamp in base allo stato
  checklistItem.status = status;
  
  if (status === 'uploaded') {
    checklistItem.uploadedAt = Date.now();
  }
  
  if (status === 'verified') {
    checklistItem.verifiedAt = Date.now();
  }
  
  await client.save();
  
  // Verifica se tutti gli elementi obbligatori sono verificati
  // Se sì, può essere opportuno aggiornare lo stato di onboarding
  const isComplete = client.isOnboardingComplete();
  
  if (isComplete && client.onboarding.status !== 'completed') {
    client.onboarding.status = 'completed';
    client.onboarding.completedDate = Date.now();
    await client.save();
  }
  
  res.status(200).json({
    success: true,
    data: client.onboarding.checklist
  });
});

/**
 * @desc    Genera procedura personalizzata per cliente tramite AI
 * @route   POST /api/clients/:id/procedure
 * @access  Private (admin, manager)
 * @param   {Object} req - Express request object
 * @param   {Object} req.params - URL parameters
 * @param   {string} req.params.id - ID del cliente
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 * @returns {Object} - Procedura generata e riferimento cliente
 */
exports.generateClientProcedure = asyncHandler(async (req, res, next) => {
  // Recupera il cliente dal database
  const client = await Client.findById(req.params.id);
  
  if (!client) {
    return next(
      new ErrorResponse(`Cliente non trovato con id ${req.params.id}`, 404)
    );
  }
  
  // Estrae i dati necessari per generare la procedura
  const clientData = {
    name: client.name,
    companyType: client.companyType,
    fiscalCode: client.fiscalCode,
    vatNumber: client.vatNumber,
    services: client.services
  };
  
  // Chiama il servizio AI per generare la procedura
  const result = await aiService.generateProcedure(clientData);
  
  if (!result.success) {
    return next(
      new ErrorResponse('Errore nella generazione della procedura', 500)
    );
  }
  
  // Salva la procedura generata nel cliente
  client.operatingProcedure = result.procedure;
  await client.save();
  
  // Risponde con la procedura generata
  res.status(200).json({
    success: true,
    data: {
      clientId: client._id,
      procedure: result.procedure
    }
  });
});