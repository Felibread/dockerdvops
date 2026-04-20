const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Cidades ESG] Servidor rodando na porta ${PORT}`);
  console.log(`[Cidades ESG] Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[Cidades ESG] Versão: ${process.env.APP_VERSION || '1.0.0'}`);
});
