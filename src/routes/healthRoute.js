const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API funzionante', 
    timestamp: new Date() 
  });
});

module.exports = router;