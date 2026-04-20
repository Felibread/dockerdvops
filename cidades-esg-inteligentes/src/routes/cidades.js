const express = require('express');
const router = express.Router();

const cidades = [
  { id: 1, nome: 'São Paulo', estado: 'SP', populacao: 12325232, regiao: 'Sudeste' },
  { id: 2, nome: 'Curitiba', estado: 'PR', populacao: 1948626, regiao: 'Sul' },
  { id: 3, nome: 'Florianópolis', estado: 'SC', populacao: 508826, regiao: 'Sul' },
  { id: 4, nome: 'Porto Alegre', estado: 'RS', populacao: 1484941, regiao: 'Sul' },
  { id: 5, nome: 'Belo Horizonte', estado: 'MG', populacao: 2521564, regiao: 'Sudeste' },
];

// GET /api/cidades
router.get('/', (req, res) => {
  const { regiao, estado } = req.query;
  let resultado = [...cidades];

  if (regiao) resultado = resultado.filter(c => c.regiao.toLowerCase() === regiao.toLowerCase());
  if (estado) resultado = resultado.filter(c => c.estado.toUpperCase() === estado.toUpperCase());

  res.json({ total: resultado.length, cidades: resultado });
});

// GET /api/cidades/:id
router.get('/:id', (req, res) => {
  const cidade = cidades.find(c => c.id === parseInt(req.params.id));
  if (!cidade) return res.status(404).json({ erro: 'Cidade não encontrada' });
  res.json(cidade);
});

module.exports = router;
