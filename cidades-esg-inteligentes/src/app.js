const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const indicadoresRoutes = require('./routes/indicadores');
const cidadesRoutes = require('./routes/cidades');
const healthRoutes = require('./routes/health');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/indicadores', indicadoresRoutes);
app.use('/api/cidades', cidadesRoutes);

app.get('/', (req, res) => {
  res.json({
    projeto: 'Cidades ESG Inteligentes',
    versao: process.env.APP_VERSION || '1.0.0',
    ambiente: process.env.NODE_ENV || 'development',
    descricao: 'API para monitoramento de indicadores ESG em cidades'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ erro: 'Erro interno do servidor', mensagem: err.message });
});

module.exports = app;
