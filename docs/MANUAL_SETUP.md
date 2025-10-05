# Guia de Setup Manual - RPG System

Para máquinas com poucos recursos ou desenvolvimento local sem Docker.

## 🎯 Quando Usar Setup Manual?

- ✅ Máquina com poucos recursos (< 8GB RAM)
- ✅ Não quer instalar Docker
- ✅ Desenvolvimento focado em apenas um serviço
- ✅ Debugging mais direto
- ✅ Startup mais rápido

## 📋 Pré-requisitos

### Obrigatórios
- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**

### Opcionais (dependendo do que vai desenvolver)
- **PostgreSQL** (se precisar de banco de dados)
- **Redis** (se precisar de cache)
- **Kafka** (se precisar de mensageria)

## 🚀 Início Rápido

### Opção 1: Script Automático (Recomendado)

```bash
cd rpg-system-infra
node scripts/manual/start-all.js
```

Isso automaticamente:
1. ✅ Configura todos os `.env` files
2. ✅ Inicia os serviços Node.js
3. ✅ Mostra instruções para serviços externos

### Opção 2: Passo a Passo Manual

#### 1. Setup dos Arquivos .env

```bash
# Na pasta rpg-system-infra
npm run setup

# Ou manualmente para cada projeto
node scripts/setup.js
node scripts/setup.js ../rpg-system-api
node scripts/setup.js ../rpg-system-core
```

#### 2. Instalar Dependências

```bash
# rpg-system-api
cd ../rpg-system-api
npm install

# rpg-system-core (se necessário)
cd ../rpg-system-core
npm install
```

#### 3. Iniciar Serviços Externos

**PostgreSQL:**
```bash
# Opção 1: Docker (recomendado)
docker run -d \
  --name rpg_postgres \
  -p 5432:5432 \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin \
  -e POSTGRES_DB=rpg_system \
  postgres:15-alpine

# Opção 2: Instalação local
# macOS: brew install postgresql
# Linux: apt install postgresql
# Windows: Baixe de postgresql.org
```

**Redis (opcional):**
```bash
# Docker
docker run -d --name rpg_redis -p 6379:6379 redis:alpine

# Local
# macOS: brew install redis
# Linux: apt install redis
```

**Kafka (opcional):**
```bash
# Use docker-compose apenas para Kafka
docker-compose up -d kafka zookeeper
```

#### 4. Iniciar Aplicação

```bash
cd rpg-system-api
npm run start:dev
```

## 📁 Estrutura de Arquivos

```
rpg-system-infra/
├── scripts/
│   ├── setup.js              # Script principal de setup
│   ├── manual/
│   │   ├── setup.js          # Cópia do setup para uso manual
│   │   └── start-all.js      # Inicia todos os serviços
│   └── docker/
│       └── ...               # Scripts relacionados ao Docker
├── .env.example              # Template de variáveis
└── .env                      # Suas configurações (gerado)

rpg-system-api/
├── src/
├── .env.example              # Template
├── .env                      # Suas configurações (gerado)
└── package.json
```

## 🔧 Configuração de .env

### rpg-system-infra/.env.example

```bash
# NPM Token para GitHub Packages
NPM_TOKEN=seu_token_github_aqui

# PostgreSQL (se usar local)
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
POSTGRES_DB=rpg_system
```

### rpg-system-api/.env.example

```bash
# Database (ajuste o host se necessário)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rpg_system
DB_USER=admin
DB_PASSWORD=admin

# API
API_PORT=3000
NODE_ENV=development

# NPM Token
NPM_TOKEN=seu_token_github_aqui
```

## 🎯 Fluxo de Trabalho

### Desenvolvimento Diário

```bash
# 1. Inicie serviços externos (PostgreSQL, etc)
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=admin postgres:15-alpine

# 2. Inicie a aplicação
cd rpg-system-api
npm run start:dev

# 3. Desenvolva normalmente
# Hot reload está ativo!

# 4. Para parar: Ctrl+C
```

### Múltiplos Serviços

Se precisar rodar múltiplos serviços Node.js simultaneamente:

```bash
# Terminal 1: API
cd rpg-system-api
npm run start:dev

# Terminal 2: Outro serviço
cd rpg-system-outro
npm run start:dev
```

**Dica:** Use `tmux` ou `screen` para gerenciar múltiplos terminais.

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"

**Solução:**
```bash
# Verifique se PostgreSQL está rodando
docker ps | grep postgres
# ou
psql -h localhost -U admin -d rpg_system

# Se não estiver, inicie:
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=admin postgres:15-alpine
```

### Erro: "Port 3000 already in use"

**Solução:**
```bash
# Encontre o processo
lsof -i :3000

# Mate o processo
kill -9 <PID>

# Ou mude a porta no .env
echo "API_PORT=3001" >> .env
```

### Erro: "NPM_TOKEN not found"

**Solução:**
```bash
# Execute o setup novamente
npm run setup

# Edite o .env e adicione seu token
nano .env
```

## 💡 Dicas

### 1. Use nodemon para Hot Reload

Já está configurado no `package.json`:
```json
{
  "scripts": {
    "start:dev": "nodemon src/index.js"
  }
}
```

### 2. Logs Coloridos

```bash
# Instale pino-pretty para logs bonitos
npm install -g pino-pretty

# Use com sua aplicação
npm run start:dev | pino-pretty
```

### 3. Debugger do VS Code

Crie `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/src/index.js",
      "envFile": "${workspaceFolder}/.env"
    }
  ]
}
```

### 4. Banco de Dados GUI

Use ferramentas visuais:
- **DBeaver** (free, multiplataforma)
- **pgAdmin** (PostgreSQL específico)
- **TablePlus** (macOS, pago)

## 📊 Comparação: Manual vs Docker

| Aspecto | Manual | Docker |
|---------|--------|--------|
| **RAM necessária** | ~2GB | ~4-8GB |
| **Startup** | ~10s | ~30-60s |
| **Hot reload** | ✅ Nativo | ✅ Via volumes |
| **Debugging** | ✅ Direto | ⚠️ Requer config |
| **Isolamento** | ❌ Compartilha SO | ✅ Containers isolados |
| **Portabilidade** | ⚠️ Depende do SO | ✅ Funciona igual em todos |
| **Setup inicial** | ⚠️ Mais passos | ✅ Um comando |

## 🔄 Migrando para Docker

Quando sua máquina melhorar ou quiser usar Docker:

```bash
# Pare os serviços manuais (Ctrl+C)

# Use Docker
docker-compose up
```

Seus `.env` files já estarão configurados! ✅

## 📚 Próximos Passos

- [Guia Docker](DOCKER_SETUP.md) - Se quiser migrar para Docker
- [README Principal](../README.md) - Visão geral do projeto
- [Documentação da API](../../rpg-system-api/README.md) - Detalhes da API
