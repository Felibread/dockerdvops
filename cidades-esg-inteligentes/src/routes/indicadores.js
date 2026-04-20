const express = require('express');
const router = express.Router();

const indicadores = [
  {
    id: 1,
    cidadeId: 1,
    cidade: 'São Paulo',
    categoria: 'Ambiental',
    nome: 'Emissão de CO2',
    valor: 4.2,
    unidade: 'toneladas/habitante/ano',
    meta: 3.0,
    atingido: false,
    ano: 2024
  },
  {
    id: 2,
    cidadeId: 1,
    cidade: 'São Paulo',
    categoria: 'Social',
    nome: 'Índice de Educação',
    valor: 0.78,
    unidade: 'IDH-E',
    meta: 0.85,
    atingido: false,
    ano: 2024
  },
  {
    id: 3,
    cidadeId: 2,
    cidade: 'Curitiba',
    categoria: 'Ambiental',
    nome: 'Cobertura Arbórea',
    valor: 32.4,
    unidade: '%',
    meta: 30.0,
    atingido: true,
    ano: 2024
  },
  {
    id: 4,
    cidadeId: 2,
    cidade: 'Curitiba',
    categoria: 'Governança',
    nome: 'Transparência Fiscal',
    valor: 87.5,
    unidade: 'pontos (0-100)',
    meta: 80.0,
    atingido: true,
    ano: 2024
  },
  {
    id: 5,
    cidadeId: 3,
    cidade: 'Florianópolis',
    categoria: 'Ambiental',
    nome: 'Energia Renovável',
    valor: 68.2,
    unidade: '% da matriz energética',
    meta: 70.0,
    atingido: false,
    ano: 2024
  },
];

// GET /api/indicadores
router.get('/', (req, res) => {
  const { categoria, cidadeId, atingido } = req.query;
  let resultado = [...indicadores];

  if (categoria) resultado = resultado.filter(i => i.categoria.toLowerCase() === categoria.toLowerCase());
  if (cidadeId) resultado = resultado.filter(i => i.cidadeId === parseInt(cidadeId));
  if (atingido !== undefined) resultado = resultado.filter(i => i.atingido === (atingido === 'true'));

  res.json({ total: resultado.length, indicadores: resultado });
});

// GET /api/indicadores/:id
router.get('/:id', (req, res) => {
  const indicador = indicadores.find(i => i.id === parseInt(req.params.id));
  if (!indicador) return res.status(404).json({ erro: 'Indicador não encontrado' });
  res.json(indicador);
});

// GET /api/indicadores/resumo/geral
router.get('/resumo/geral', (req, res) => {
  const total = indicadores.length;
  const atingidos = indicadores.filter(i => i.atingido).length;
  const categorias = [...new Set(indicadores.map(i => i.categoria))];

  res.json({
    totalIndicadores: total,
    metasAtingidas: atingidos,
    metasPendentes: total - atingidos,
    taxaSucesso: `${((atingidos / total) * 100).toFixed(1)}%`,
    categorias
  });
});

module.exports = router;
