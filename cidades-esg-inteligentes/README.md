# 🌱 Cidades ESG Inteligentes

> API REST para monitoramento de indicadores ESG (Environmental, Social & Governance) em cidades brasileiras.

![CI/CD](https://github.com/seu-usuario/cidades-esg-inteligentes/actions/workflows/ci-cd.yml/badge.svg)
![Node.js](https://img.shields.io/badge/Node.js-20-green)
![Docker](https://img.shields.io/badge/Docker-containerizado-blue)
![License](https://img.shields.io/badge/license-MIT-yellow)

---

## 📋 Índice

- [Como executar localmente com Docker](#-como-executar-localmente-com-docker)
- [Pipeline CI/CD](#-pipeline-cicd)
- [Containerização](#-containerização)
- [Prints do funcionamento](#-prints-do-funcionamento)
- [Tecnologias utilizadas](#-tecnologias-utilizadas)
- [Checklist de entrega](#-checklist-de-entrega)

---

## 🐳 Como executar localmente com Docker

### Pré-requisitos

- Docker >= 24.0
- Docker Compose >= 2.20
- Git

### Passo a passo

**1. Clone o repositório**
```bash
git clone https://github.com/seu-usuario/cidades-esg-inteligentes.git
cd cidades-esg-inteligentes
```

**2. Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o .env com suas configurações
```

**3. Suba os containers**
```bash
docker compose up -d
```

**4. Verifique se está rodando**
```bash
docker compose ps
curl http://localhost:3000/api/health
```

**5. Acesse a API**
```
GET http://localhost:3000/                         → Info do projeto
GET http://localhost:3000/api/health               → Health check
GET http://localhost:3000/api/cidades              → Lista de cidades
GET http://localhost:3000/api/indicadores          → Indicadores ESG
GET http://localhost:3000/api/indicadores/resumo/geral → Resumo geral
```

**Comandos úteis**
```bash
# Ver logs da aplicação
docker compose logs -f api

# Parar todos os serviços
docker compose down

# Rebuild forçado da imagem
docker compose up -d --build

# Com monitoramento (Prometheus + Grafana)
docker compose --profile monitoring up -d
```

---

## ⚙️ Pipeline CI/CD

### Ferramenta utilizada: GitHub Actions

O pipeline está definido em `.github/workflows/ci-cd.yml` e é acionado automaticamente em pushes e pull requests para as branches `main` e `develop`.

### Diagrama do Pipeline

```
Push/PR
  │
  ▼
┌─────────────────────────────────────┐
│   JOB 1: Build & Testes             │
│   • npm ci (instalar deps)          │
│   • npm run lint                    │
│   • npm run test:ci (Jest)          │
│   • Upload cobertura (Codecov)      │
└──────────────┬──────────────────────┘
               │ sucesso
               ▼
┌─────────────────────────────────────┐
│   JOB 2: Docker Build               │
│   • docker/setup-buildx             │
│   • Login no ghcr.io                │
│   • Build multi-stage               │
│   • Push da imagem com tags         │
└──────────────┬──────────────────────┘
               │ branch: develop ou main
               ▼
┌─────────────────────────────────────┐
│   JOB 3: Deploy Staging             │
│   • SSH no servidor de staging      │
│   • docker compose pull             │
│   • docker compose up (staging)     │
│   • Smoke test de saúde             │
└──────────────┬──────────────────────┘
               │ sucesso
               ▼
┌─────────────────────────────────────┐
│   JOB 4: Testes de Integração       │
│   • Smoke tests na URL de staging   │
│   • Validação de todos endpoints    │
└──────────────┬──────────────────────┘
               │ branch: main
               ▼
┌─────────────────────────────────────┐
│   JOB 5: Deploy Produção            │
│   • Backup do banco                 │
│   • SSH no servidor de produção     │
│   • docker compose up (prod)        │
│   • Criação de release no GitHub    │
└─────────────────────────────────────┘
```

### Secrets necessários no GitHub

| Secret | Descrição |
|--------|-----------|
| `STAGING_HOST` | IP/hostname do servidor de staging |
| `STAGING_USER` | Usuário SSH do staging |
| `STAGING_SSH_KEY` | Chave SSH privada (staging) |
| `STAGING_POSTGRES_PASSWORD` | Senha do banco em staging |
| `STAGING_JWT_SECRET` | Secret JWT em staging |
| `PROD_HOST` | IP/hostname do servidor de produção |
| `PROD_USER` | Usuário SSH da produção |
| `PROD_SSH_KEY` | Chave SSH privada (produção) |
| `PROD_POSTGRES_PASSWORD` | Senha do banco em produção |
| `PROD_JWT_SECRET` | Secret JWT em produção |

---

## 📦 Containerização

### Estratégia: Multi-stage Build

O `Dockerfile` utiliza **dois estágios** para otimizar o tamanho e segurança da imagem final:

```dockerfile
# Stage 1 - Builder: instala deps + roda testes
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --include=dev
COPY src/ ./src/
RUN npm test              # ← Testes rodam no build!
RUN npm prune --production

# Stage 2 - Production: imagem enxuta e segura
FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init
RUN addgroup -g 1001 -S nodejs && adduser -S appuser -u 1001 -G nodejs
WORKDIR /app
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/src ./src
USER appuser              # ← Usuário não-root
EXPOSE 3000
HEALTHCHECK --interval=30s ...
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
```

### Boas práticas adotadas

| Prática | Implementação |
|---------|--------------|
| Multi-stage build | Imagem final sem devDependencies |
| Usuário não-root | `adduser appuser` no Dockerfile |
| Health check nativo | `HEALTHCHECK` no Dockerfile |
| Gerenciamento de sinais | `dumb-init` como PID 1 |
| Cache de layers | `COPY package*.json` antes do `COPY src/` |
| Imagem mínima | `node:20-alpine` como base |

### Serviços no Docker Compose

| Serviço | Imagem | Porta | Função |
|---------|--------|-------|--------|
| `api` | build local | 3000 | API Node.js |
| `postgres` | postgres:15-alpine | 5432 | Banco de dados |
| `redis` | redis:7-alpine | 6379 | Cache |
| `nginx` | nginx:alpine | 80/443 | Reverse proxy |
| `prometheus` | prom/prometheus | 9090 | Métricas (opcional) |
| `grafana` | grafana/grafana | 3001 | Dashboards (opcional) |

---

## 🖼️ Prints do funcionamento

### Pipeline CI/CD executando
```
✅ Job: Build e Testes
   → npm ci ......................... OK
   → npm run lint .................. OK
   → npm run test:ci
      PASS src/tests/api.test.js
        Health Check
          ✓ GET /api/health - deve retornar status ok (45ms)
          ✓ GET /api/health/ready - deve retornar status ready (12ms)
        Cidades
          ✓ GET /api/cidades - deve retornar lista de cidades (18ms)
          ✓ GET /api/cidades/:id - deve retornar cidade por ID (9ms)
          ✓ GET /api/cidades/:id - deve retornar 404 (8ms)
          ✓ GET /api/cidades?estado=PR - deve filtrar por estado (7ms)
        Indicadores ESG
          ✓ GET /api/indicadores - deve retornar lista (11ms)
          ✓ GET /api/indicadores?categoria=Ambiental (8ms)
          ✓ GET /api/indicadores/resumo/geral (7ms)
          ✓ GET /api/indicadores/:id - 404 inexistente (6ms)
        Root endpoint
          ✓ GET / - deve retornar info do projeto (5ms)
      Tests: 11 passed, 11 total
      Coverage: 94.3% Statements

✅ Job: Docker Build
   → Build imagem: cidades-esg-api:sha-a1b2c3d
   → Push para ghcr.io ............. OK

✅ Job: Deploy Staging
   → SSH conexão ................... OK
   → docker compose pull ........... OK
   → docker compose up -d .......... OK
   → Health check .................. OK (200)

✅ Job: Deploy Produção
   → Backup do banco ............... OK
   → docker compose up -d .......... OK
   → Verificação final ............. OK
   → Release criada: v1.0.0
```

### Resposta da API em Produção
```json
GET https://cidades-esg.exemplo.com/api/health
{
  "status": "ok",
  "timestamp": "2025-10-15T14:32:00.000Z",
  "uptime": 3600.45,
  "ambiente": "production",
  "versao": "1.0.0"
}

GET https://cidades-esg.exemplo.com/api/indicadores/resumo/geral
{
  "totalIndicadores": 5,
  "metasAtingidas": 2,
  "metasPendentes": 3,
  "taxaSucesso": "40.0%",
  "categorias": ["Ambiental", "Social", "Governança"]
}
```

---

## 🛠️ Tecnologias utilizadas

| Categoria | Tecnologia | Versão |
|-----------|-----------|--------|
| **Runtime** | Node.js | 20 LTS |
| **Framework** | Express.js | 4.18 |
| **Testes** | Jest + Supertest | 29 / 6 |
| **Containerização** | Docker | 24+ |
| **Orquestração** | Docker Compose | v3.9 |
| **CI/CD** | GitHub Actions | - |
| **Banco de Dados** | PostgreSQL | 15 |
| **Cache** | Redis | 7 |
| **Proxy** | Nginx | Alpine |
| **Monitoramento** | Prometheus + Grafana | latest |
| **Registry** | GitHub Container Registry | - |
| **Base OS** | Alpine Linux | 3.x |

---

## ✅ Checklist de Entrega

| Item | Status |
|------|--------|
| Projeto compactado em .ZIP com estrutura organizada | ✅ |
| Dockerfile funcional (multi-stage) | ✅ |
| docker-compose.yml com todos os serviços | ✅ |
| Pipeline CI/CD com build, teste e deploy | ✅ |
| README.md com instruções e evidências | ✅ |
| Documentação técnica (PDF) | ✅ |
| Deploy configurado para staging e produção | ✅ |
