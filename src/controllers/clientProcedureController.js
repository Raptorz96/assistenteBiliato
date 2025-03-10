// src/controllers/clientProcedureController.js

// @desc    Update task status in client procedure
// @route   PUT /api/clientprocedures/:id/tasks/:taskId
// @access  Private
exports.updateTaskStatus = async (req, res) => {
    try {
      const { id, taskId } = req.params;
      const { status, notes, attachments } = req.body;
      
      // Trova la procedura del cliente
      const clientProcedure = await ClientProcedure.findById(id);
      if (!clientProcedure) {
        return res.status(404).json({
          success: false,
          error: 'Client procedure not found'
        });
      }
      
      // Trova il task specifico
      const taskIndex = clientProcedure.tasks.findIndex(task => task._id.toString() === taskId);
      if (taskIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Task not found in this procedure'
        });
      }
      
      // Aggiorna lo stato del task
      if (status) {
        clientProcedure.tasks[taskIndex].status = status;
        
        // Se completato, imposta la data di completamento
        if (status === 'completed') {
          clientProcedure.tasks[taskIndex].completedDate = new Date();
        } else {
          // Se non completato, rimuovi la data di completamento
          clientProcedure.tasks[taskIndex].completedDate = null;
        }
      }
      
      // Aggiorna le note se fornite
      if (notes) {
        clientProcedure.tasks[taskIndex].notes = notes;
      }
      
      // Aggiungi allegati se forniti
      if (attachments && Array.isArray(attachments)) {
        attachments.forEach(docId => {
          if (!clientProcedure.tasks[taskIndex].attachments.find(att => att.documentId.toString() === docId)) {
            clientProcedure.tasks[taskIndex].attachments.push({
              documentId: docId,
              uploadedAt: new Date()
            });
          }
        });
      }
      
      // Verifica se tutti i task sono completati per aggiornare lo stato generale
      if (clientProcedure.isComplete()) {
        clientProcedure.status = 'completed';
      }
      
      // Salva le modifiche
      await clientProcedure.save();
      
      // Popola i dati necessari per la risposta
      await clientProcedure.populate([
        { path: 'clientId', select: 'name' },
        { path: 'tasks.assignedTo', select: 'firstName lastName' },
        { path: 'tasks.attachments.documentId', select: 'filename originalName' }
      ]);
      
      res.status(200).json({
        success: true,
        data: {
          clientProcedure,
          task: clientProcedure.tasks[taskIndex],
          progress: clientProcedure.getProgressPercentage()
        }
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  };