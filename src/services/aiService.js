const axios = require('axios');

/**
 * Servizio per interagire con l'API Claude per generare contenuti
 */
class AIService {
  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY;
    this.apiUrl = 'https://api.anthropic.com/v1/messages';
    this.model = process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229';
    
    // Verifica se la configurazione API è presente
    if (process.env.NODE_ENV === 'production' && !this.apiKey) {
      console.warn('ATTENZIONE: ANTHROPIC_API_KEY non configurata. Le funzionalità AI non saranno disponibili in produzione.');
    }
  }

  /**
   * Genera una procedura personalizzata per un cliente
   * @param {Object} clientData - Dati del cliente necessari per generare la procedura
   * @returns {Promise<Object>} Risultato con procedura generata
   */
  async generateProcedure(clientData) {
    try {
      // Log per debugging
      console.log('Generazione procedura per cliente:', clientData.name);
      
      // Se in ambiente di test/sviluppo o senza API key, ritorna una procedura mock
      if ((process.env.NODE_ENV === 'development' && !this.apiKey) || !this.apiKey) {
        console.log('Utilizzando procedura mock (modalità sviluppo o API key mancante)');
        return {
          success: true,
          procedure: this._generateMockProcedure(clientData)
        };
      }

      // Costruisci il prompt per Claude
      const prompt = this._buildPromptForProcedure(clientData);
      
      // Chiama API Claude
      const response = await this._callClaudeAPI(prompt);
      
      // Estrai la procedura dalla risposta
      const procedure = this._extractProcedureFromResponse(response);
      
      return {
        success: true,
        procedure
      };
    } catch (error) {
      console.error('Errore nella generazione della procedura:', error);
      return {
        success: false,
        error: error.message || 'Errore nella generazione della procedura'
      };
    }
  }

  /**
   * Genera un documento basato su un template e dati cliente
   * @param {string} templateType - Tipo di documento da generare
   * @param {Object} data - Dati per compilare il documento
   * @returns {Promise<Object>} Documento generato
   */
  async generateDocument(templateType, data) {
    try {
      // Log per debugging
      console.log(`Generazione documento di tipo "${templateType}"`);
      
      // Usa documento mock in development o se non c'è API key
      if ((process.env.NODE_ENV === 'development' && !this.apiKey) || !this.apiKey) {
        console.log('Utilizzando documento mock (modalità sviluppo o API key mancante)');
        return {
          success: true,
          content: this._generateMockDocument(templateType, data)
        };
      }

      // Costruisci il prompt per Claude
      const prompt = this._buildPromptForDocument(templateType, data);
      
      // Chiama API Claude
      const response = await this._callClaudeAPI(prompt);
      
      return {
        success: true,
        content: response
      };
    } catch (error) {
      console.error('Errore nella generazione del documento:', error);
      return {
        success: false,
        error: error.message || 'Errore nella generazione del documento'
      };
    }
  }

  /**
   * Chiama l'API Claude
   * @param {string} prompt - Il prompt da inviare a Claude
   * @returns {Promise<string>} - La risposta testuale di Claude
   * @private
   */
  async _callClaudeAPI(prompt) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          max_tokens: 4000,
          messages: [
            { role: 'user', content: prompt }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
          }
        }
      );
      
      // Estrai il testo della risposta dalla struttura dell'API
      if (response.data && response.data.content && response.data.content.length > 0) {
        return response.data.content[0].text;
      }
      
      throw new Error('Formato di risposta non valido dall\'API Claude');
    } catch (error) {
      console.error('Errore nella chiamata API Claude:', error.response?.data || error.message);
      throw new Error(`Errore nella chiamata API Claude: ${error.message}`);
    }
  }

  /**
   * Costruisce il prompt per la generazione della procedura
   * @param {Object} clientData - Dati del cliente
   * @returns {string} Prompt formattato
   * @private
   */
  _buildPromptForProcedure(clientData) {
    return `
    Sei un assistente specializzato per studi commercialisti in Italia. Genera una procedura operativa dettagliata per un nuovo cliente con le seguenti caratteristiche:
    
    Nome: ${clientData.name}
    Tipo: ${clientData.companyType}
    Partita IVA: ${clientData.vatNumber || 'Non disponibile'}
    Codice Fiscale: ${clientData.fiscalCode || 'Non disponibile'}
    Servizi richiesti: ${clientData.services ? clientData.services.join(', ') : 'Servizi standard'}
    
    Genera una procedura completa con:
    1. Nome della procedura
    2. Descrizione
    3. Elenco delle attività da svolgere in ordine cronologico
    4. Per ogni attività:
       - Nome dell'attività
       - Descrizione dettagliata
       - Tempistica (in giorni dall'inizio)
       - Ruolo responsabile (admin, manager, operator)
       - Documenti richiesti
       - Passaggi dettagliati per completare l'attività
    
    La procedura deve essere specifica per il tipo di azienda del cliente e i servizi richiesti.
    Formatta la risposta in JSON con la seguente struttura:
    
    {
      "name": "Nome Procedura",
      "description": "Descrizione dettagliata",
      "tasks": [
        {
          "name": "Nome Attività",
          "description": "Descrizione",
          "dueOffset": 7,
          "assignedRole": "operator",
          "requiredDocuments": ["Documento 1", "Documento 2"],
          "steps": [
            { "name": "Passo 1", "description": "Descrizione", "order": 1 },
            { "name": "Passo 2", "description": "Descrizione", "order": 2 }
          ]
        }
      ]
    }
    `;
  }

  /**
   * Costruisce il prompt per la generazione di un documento
   * @param {string} templateType - Tipo di documento
   * @param {Object} data - Dati per compilare il documento
   * @returns {string} Prompt formattato
   * @private
   */
  _buildPromptForDocument(templateType, data) {
    let prompt = `Sei un assistente specializzato nella generazione di documenti professionali per studi commercialisti. `;
    
    switch (templateType) {
      case 'welcome':
        prompt += `Genera una lettera di benvenuto professionale per un nuovo cliente dello studio commercialista.
        Dati del cliente:
        Nome: ${data.clientName}
        Tipo: ${data.clientType}
        Data inizio collaborazione: ${data.startDate}
        Servizi richiesti: ${data.services ? data.services.join(', ') : 'Standard'}
        
        La lettera deve:
        - Essere formale ma cordiale
        - Ringraziare il cliente per la fiducia
        - Riassumere brevemente i servizi concordati
        - Spiegare il processo di onboarding
        - Indicare i prossimi passi
        - Fornire i contatti dello studio
        `;
        break;
        
      case 'contract':
        prompt += `Genera un contratto di servizi professionali tra lo studio commercialista e il cliente.
        Dati del cliente:
        Nome: ${data.clientName}
        Tipo: ${data.clientType}
        Partita IVA: ${data.vatNumber || 'Non disponibile'}
        Codice Fiscale: ${data.fiscalCode || 'Non disponibile'}
        
        Servizi richiesti: ${data.services ? data.services.join(', ') : 'Standard'}
        Compenso: ${data.fee || 'Da definire'}
        Durata: ${data.duration || 'Annuale con rinnovo tacito'}
        
        Il contratto deve includere:
        - Intestazione con dati delle parti
        - Oggetto del contratto
        - Dettaglio dei servizi
        - Durata e rinnovo
        - Compensi e modalità di pagamento
        - Obblighi delle parti
        - Clausole standard (riservatezza, risoluzione, foro competente)
        `;
        break;
        
      case 'privacy':
        prompt += `Genera un'informativa sulla privacy per un nuovo cliente dello studio commercialista.
        Dati del cliente:
        Nome: ${data.clientName}
        Tipo: ${data.clientType}
        
        L'informativa deve:
        - Essere conforme al GDPR
        - Spiegare quali dati vengono raccolti e per quali finalità
        - Indicare i diritti del cliente riguardo ai propri dati
        - Specificare i tempi di conservazione dei dati
        - Indicare eventuali trasferimenti a terze parti
        - Includere le modalità per revocare il consenso
        `;
        break;
        
      default:
        prompt += `Genera un documento professionale per il cliente.
        Dati del cliente:
        Nome: ${data.clientName}
        Tipo: ${data.clientType}
        
        Il documento deve essere formale e professionale, con un linguaggio chiaro e preciso.
        `;
    }
    
    return prompt;
  }

  /**
   * Estrae la procedura JSON dalla risposta testuale
   * @param {string} response - Risposta testuale dall'API
   * @returns {Object} Procedura strutturata
   * @private
   */
  _extractProcedureFromResponse(response) {
    try {
      // Cerca di estrarre un blocco JSON dalla risposta
      const jsonRegex = /\{[\s\S]*\}/;
      const match = response.match(jsonRegex);
      
      if (match) {
        const jsonStr = match[0];
        return JSON.parse(jsonStr);
      } else {
        // Se non riesce a estrarre JSON, restituisci la risposta come testo
        return {
          name: 'Procedura generata',
          description: 'Procedura generata da AI (impossibile estrarre JSON)',
          tasks: [
            {
              name: 'Revisione manuale richiesta',
              description: 'La risposta AI richiede una revisione manuale',
              content: response,
              dueOffset: 1,
              assignedRole: 'manager'
            }
          ]
        };
      }
    } catch (error) {
      console.error('Errore nel parsing della risposta JSON:', error);
      return {
        name: 'Errore procedura',
        description: 'Si è verificato un errore nel parsing della procedura',
        error: error.message,
        rawResponse: response
      };
    }
  }

  /**
   * Genera una procedura mock per test/sviluppo
   * @param {Object} clientData - Dati del cliente
   * @returns {Object} Procedura mock
   * @private
   */
  _generateMockProcedure(clientData) {
    const mockProcedureName = `Procedura Onboarding - ${clientData.name} (${clientData.companyType})`;
    
    let tasks = [];
    
    // Task base comuni a tutti i tipi di cliente
    tasks.push({
      name: 'Raccolta dati anagrafici',
      description: 'Raccogliere e verificare i dati anagrafici del cliente',
      dueOffset: 1,
      assignedRole: 'operator',
      requiredDocuments: ['Documento identità', 'Codice fiscale'],
      steps: [
        { name: 'Verifica documento', description: 'Verificare la validità del documento d\'identità', order: 1 },
        { name: 'Verifica CF', description: 'Verificare la corrispondenza del codice fiscale', order: 2 }
      ]
    });
    
    // Task specifici per tipo di azienda
    switch(clientData.companyType) {
      case 'Individual':
        tasks.push({
          name: 'Verifica regime fiscale',
          description: 'Verificare il regime fiscale applicabile al libero professionista',
          dueOffset: 3,
          assignedRole: 'manager',
          requiredDocuments: ['Dichiarazione dei redditi precedente', 'Partita IVA'],
          steps: [
            { name: 'Analisi redditi', description: 'Analizzare la dichiarazione dei redditi precedente', order: 1 },
            { name: 'Consulenza regime', description: 'Proporre il regime fiscale più conveniente', order: 2 }
          ]
        });
        break;
        
      case 'Corporation':
      case 'LLC':
        tasks.push({
          name: 'Analisi statuto societario',
          description: 'Verificare lo statuto e i documenti societari',
          dueOffset: 3,
          assignedRole: 'manager',
          requiredDocuments: ['Statuto societario', 'Visura camerale'],
          steps: [
            { name: 'Verifica conformità', description: 'Verificare la conformità dello statuto alla normativa vigente', order: 1 },
            { name: 'Identificazione criticità', description: 'Identificare eventuali criticità o opportunità di miglioramento', order: 2 }
          ]
        });
        
        tasks.push({
          name: 'Setup contabilità societaria',
          description: 'Configurare il sistema contabile per la società',
          dueOffset: 5,
          assignedRole: 'operator',
          requiredDocuments: ['Piano dei conti', 'Bilancio anno precedente'],
          steps: [
            { name: 'Configurazione software', description: 'Configurare il software gestionale', order: 1 },
            { name: 'Importazione dati', description: 'Importare i dati contabili esistenti', order: 2 }
          ]
        });
        break;
        
      case 'Partnership':
        tasks.push({
          name: 'Verifica patti parasociali',
          description: 'Analizzare i patti tra soci e le quote societarie',
          dueOffset: 3,
          assignedRole: 'manager',
          requiredDocuments: ['Atto costitutivo', 'Patti parasociali'],
          steps: [
            { name: 'Analisi quote', description: 'Analizzare la distribuzione delle quote', order: 1 },
            { name: 'Verifica governance', description: 'Verificare le regole di governance', order: 2 }
          ]
        });
        break;
    }
    
    // Task finale comune a tutti
    tasks.push({
      name: 'Pianificazione fiscale annuale',
      description: 'Preparare un piano fiscale annuale personalizzato',
      dueOffset: 10,
      assignedRole: 'manager',
      requiredDocuments: ['Documenti contabili', 'Previsioni economiche'],
      steps: [
        { name: 'Analisi situazione', description: 'Analizzare la situazione fiscale attuale', order: 1 },
        { name: 'Sviluppo strategia', description: 'Sviluppare una strategia fiscale ottimale', order: 2 },
        { name: 'Presentazione piano', description: 'Presentare il piano al cliente', order: 3 }
      ]
    });
    
    return {
      name: mockProcedureName,
      description: `Procedura operativa standard per clienti di tipo ${clientData.companyType}. Generata automaticamente in ambiente di sviluppo.`,
      tasks: tasks
    };
  }

  /**
   * Genera un documento mock per test/sviluppo
   * @param {string} templateType - Tipo di documento
   * @param {Object} data - Dati per il documento
   * @returns {string} Documento mock
   * @private
   */
  _generateMockDocument(templateType, data) {
    switch (templateType) {
      case 'welcome':
        return `
Studio Commercialista Biliato
Via Roma, 123 - Milano
Tel. 02 12345678
Email: info@studiobiliato.it

Milano, ${new Date().toLocaleDateString('it-IT')}

Gentile ${data.clientName},

siamo lieti di darle il benvenuto come cliente del nostro Studio Commercialista Biliato.

Desideriamo ringraziarla per la fiducia accordataci e confermarle che il nostro team è a sua completa disposizione per assisterla in tutte le attività concordate:
${data.services ? '- ' + data.services.join('\n- ') : '- Servizi di consulenza fiscale standard'}

Nei prossimi giorni riceverà una comunicazione dal nostro collaboratore che le è stato assegnato, che la guiderà attraverso il processo di onboarding e raccolta della documentazione necessaria.

Restiamo a disposizione per qualsiasi chiarimento o necessità.

Cordiali saluti,
Dott. Biliato
Studio Commercialista Biliato
        `;
        
      case 'contract':
        return `
CONTRATTO DI PRESTAZIONE DI SERVIZI PROFESSIONALI

TRA
Studio Commercialista Biliato, con sede in Via Roma 123, Milano, P.IVA 12345678901, nella persona del suo legale rappresentante Dott. Biliato, di seguito denominato "Studio"

E
${data.clientName}, ${data.clientType === 'Individual' ? 'Codice Fiscale' : 'con sede in'} ${data.fiscalCode || data.address || 'Via da definire'}, ${data.clientType !== 'Individual' ? 'P.IVA ' + (data.vatNumber || 'da definire') : ''}, di seguito denominato "Cliente"

PREMESSO CHE
- Il Cliente necessita di servizi di consulenza fiscale e contabile;
- Lo Studio dispone delle competenze professionali necessarie;

SI CONVIENE E STIPULA QUANTO SEGUE

Art. 1 - OGGETTO DEL CONTRATTO
Lo Studio si impegna a fornire al Cliente i seguenti servizi professionali:
${data.services ? '- ' + data.services.join('\n- ') : '- Servizi di consulenza fiscale standard'}

Art. 2 - DURATA
Il presente contratto ha durata ${data.duration || 'annuale con tacito rinnovo'}.

Art. 3 - COMPENSI
Per i servizi di cui all'art. 1, il Cliente corrisponderà allo Studio un compenso pari a €${data.fee || '[DA DEFINIRE]'}.

(Documento di esempio generato automaticamente per test)
        `;
        
      default:
        return `Documento di esempio generato automaticamente per tipo "${templateType}" in ambiente di sviluppo.
        
Cliente: ${data.clientName}
Tipo: ${data.clientType}
Data: ${new Date().toLocaleDateString('it-IT')}

Questo è un documento mock utilizzato per test.`;
    }
  }
}

module.exports = new AIService();