# ==================================================
# Stage 1: Builder
# ==================================================
FROM node:20-alpine AS builder

LABEL maintainer="Equipe ESG Inteligente"
LABEL description="Cidades ESG Inteligentes - API de Monitoramento"

WORKDIR /app

# Copiar apenas os arquivos de dependência primeiro (cache layer)
COPY package*.json ./

# Instalar dependências de produção e dev (para testes no build)
RUN npm ci --include=dev

# Copiar o restante do código
COPY src/ ./src/

# Executar testes durante o build
RUN npm test

# Remover dependências de dev após os testes
RUN npm prune --production

# ==================================================
# Stage 2: Production
# ==================================================
FROM node:20-alpine AS production

# Instalar apenas o necessário para produção
RUN apk add --no-cache dumb-init

# Criar usuário não-root por segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 -G nodejs

WORKDIR /app

# Copiar apenas os artefatos necessários do stage builder
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/src ./src
COPY --chown=appuser:nodejs package.json ./

# Usar usuário não-root
USER appuser

# Expor a porta da aplicação
EXPOSE 3000

# Health check interno do container
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

# Usar dumb-init como PID 1 para melhor gestão de sinais
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
