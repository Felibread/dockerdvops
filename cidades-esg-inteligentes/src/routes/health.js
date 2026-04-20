const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    ambiente: process.env.NODE_ENV || 'development',
    versao: process.env.APP_VERSION || '1.0.0'
  });
});

router.get('/ready', (req, res) => {
  res.json({ status: 'ready', timestamp: new Date().toISOString() });
});

module.exports = router;
