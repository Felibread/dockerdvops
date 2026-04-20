const request = require('supertest');
const app = require('../app');

describe('Health Check', () => {
  test('GET /api/health - deve retornar status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
  });

  test('GET /api/health/ready - deve retornar status ready', async () => {
    const res = await request(app).get('/api/health/ready');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ready');
  });
});

describe('Cidades', () => {
  test('GET /api/cidades - deve retornar lista de cidades', async () => {
    const res = await request(app).get('/api/cidades');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('cidades');
    expect(Array.isArray(res.body.cidades)).toBe(true);
    expect(res.body.cidades.length).toBeGreaterThan(0);
  });

  test('GET /api/cidades/:id - deve retornar cidade por ID', async () => {
    const res = await request(app).get('/api/cidades/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('nome');
    expect(res.body.id).toBe(1);
  });

  test('GET /api/cidades/:id - deve retornar 404 para cidade inexistente', async () => {
    const res = await request(app).get('/api/cidades/9999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('erro');
  });

  test('GET /api/cidades?estado=PR - deve filtrar por estado', async () => {
    const res = await request(app).get('/api/cidades?estado=PR');
    expect(res.statusCode).toBe(200);
    expect(res.body.cidades.every(c => c.estado === 'PR')).toBe(true);
  });
});

describe('Indicadores ESG', () => {
  test('GET /api/indicadores - deve retornar lista de indicadores', async () => {
    const res = await request(app).get('/api/indicadores');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('indicadores');
    expect(Array.isArray(res.body.indicadores)).toBe(true);
    expect(res.body.total).toBeGreaterThan(0);
  });

  test('GET /api/indicadores?categoria=Ambiental - deve filtrar por categoria', async () => {
    const res = await request(app).get('/api/indicadores?categoria=Ambiental');
    expect(res.statusCode).toBe(200);
    expect(res.body.indicadores.every(i => i.categoria === 'Ambiental')).toBe(true);
  });

  test('GET /api/indicadores/resumo/geral - deve retornar resumo', async () => {
    const res = await request(app).get('/api/indicadores/resumo/geral');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('totalIndicadores');
    expect(res.body).toHaveProperty('metasAtingidas');
    expect(res.body).toHaveProperty('taxaSucesso');
  });

  test('GET /api/indicadores/:id - deve retornar 404 para indicador inexistente', async () => {
    const res = await request(app).get('/api/indicadores/9999');
    expect(res.statusCode).toBe(404);
  });
});

describe('Root endpoint', () => {
  test('GET / - deve retornar info do projeto', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('projeto');
    expect(res.body.projeto).toContain('ESG');
  });
});
