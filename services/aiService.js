// src/services/aiService.js
const { Client } = require('@anthropic-ai/sdk');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// Inizializza client Claude
const anthropic = new Client({
  apiKey: process.env.ANTHROPIC_API_KEY
});

exports.generateProcedure = asyncHandler(async (clientData) => {
  try {
    // Prepara i dati per il prompt
    const { name, companyType, services = [], fiscalCode, vatNumber } = clientData;
    
    // Costruisci il prompt per Claude
    const prompt = `
      Crea una procedura operativa dettagliata per l'onboarding del cliente "${name}", 
      che è una ${companyType}${fiscalCode ? ` con codice fiscale ${fiscalCode}` : ''}${vatNumber ? ` e partita IVA ${vatNumber}` : ''}.
      I servizi richiesti sono: ${services.length > 0 ? services.join(', ') : 'servizi base di consulenza fiscale'}.
      
      Includi nella procedura:
      1. Adempimenti iniziali e documenti da raccogliere
      2. Registrazioni fiscali necessarie (INPS, INAIL, Camera di Commercio, ecc.)
      3. Configurazione contabile iniziale
      4. Scadenze e adempimenti periodici
      5. Istruzioni operative per lo studio commercialista
      
      Formatta la risposta in sezioni ben strutturate e numerate, adatte per essere presentate a un cliente in Italia.
    `;
    
    // Chiama l'API Claude
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      system: "Sei un assistente specializzato in procedure fiscali e contabili per studi commercialisti in Italia. Conosci perfettamente le normative fiscali italiane, gli adempimenti per diversi tipi di società e le procedure di onboarding per nuovi clienti di uno studio professionale.",
      messages: [
        { role: 'user', content: prompt }
      ]
    });
    
    // Estrai il contenuto della risposta
    const procedure = response.content[0].text;
    
    return {
      success: true,
      procedure
    };
  } catch (error) {
    console.error('Errore nell\'utilizzo di Claude:', error);
    throw new ErrorResponse('Errore nella generazione della procedura', 500);
  }
});