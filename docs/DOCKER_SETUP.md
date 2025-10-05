# Guia Docker - RPG System

## 🚀 Início Rápido

### Primeira Vez (Setup Completo)

```bash
# 1. Clone os repositórios
git clone <rpg-system-infra>
git clone <rpg-system-api>
git clone <rpg-system-core>

# 2. Entre na pasta de infraestrutura
cd rpg-system-infra

# 3. Crie os arquivos .env.example em cada projeto
# (veja seção "Configuração de .env" abaixo)

# 4. Suba tudo com um único comando
docker-compose up
```

Pronto! 🎉 Todos os serviços estarão rodando.

**O que acontece automaticamente:**
1. Container `setup` executa e cria/atualiza todos os `.env`
2. Aguarda o setup completar com sucesso
3. Sobe API, PostgreSQL, Kafka e Zookeeper
4. Tudo pronto para desenvolvimento!

## 📋 Comandos Disponíveis

### Gerenciamento de Containers

```bash
# Subir containers (setup automático incluído!)
docker-compose up

# Subir containers em background
docker-compose up -d

# Subir containers e forçar rebuild das imagens
docker-compose up --build

# Parar containers
docker-compose down

# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f api
docker-compose logs -f postgres
docker-compose logs -f setup  # Ver logs do setup
```

### Gerenciamento de .env

```bash
# Setup manual dos .env (se necessário)
npm run setup

# Setup de um projeto específico
node scripts/setup.js ../rpg-system-api
```

## 🔧 Configuração de .env

### rpg-system-infra/.env.example

```bash
# NPM Token para GitHub Packages
NPM_TOKEN=seu_token_github_aqui

# PostgreSQL
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
POSTGRES_DB=rpg_system
```

### rpg-system-api/.env.example

```bash
# Database
DB_HOST=postgres
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
# Manhã - Subir ambiente
docker-compose up -d

# Durante o dia - Ver logs se necessário
docker-compose logs -f

# Fim do dia - Parar containers
docker-compose down
```

### Quando Atualizar Dependências

```bash
# Rebuild das imagens
npm run docker:up:build
```

### Quando Adicionar Novas Variáveis de Ambiente

```bash
# 1. Adicione no .env.example do projeto
echo "NEW_VAR=valor" >> ../rpg-system-api/.env.example

# 2. Execute o setup (vai adicionar ao .env preservando valores existentes)
npm run setup

# 3. Reinicie os containers
npm run docker:down
npm run docker:up
```

## 🐛 Troubleshooting

### Erro: "NPM_TOKEN not found"

**Solução:**
```bash
# Verifique se o .env existe
ls -la .env

# Se não existir, execute o setup
npm run setup

# Edite o .env e adicione seu token
nano .env  # ou seu editor preferido
```

### Erro: "Port already in use"

**Solução:**
```bash
# Veja o que está usando a porta
lsof -i :3000  # ou :5432, :9092, etc.

# Pare o processo ou mude a porta no docker-compose.yml
```

### Containers não iniciam

**Solução:**
```bash
# Veja os logs
npm run docker:logs

# Reconstrua as imagens
npm run docker:down
npm run docker:up:build
```

### Banco de dados vazio após restart

**Solução:**
O volume `postgres_data` persiste os dados. Se quiser limpar:
```bash
# Remove containers e volumes
docker-compose down -v

# Sobe novamente
npm run docker:up
```

## 📊 Serviços e Portas

| Serviço | Porta Host | Porta Container | Descrição |
|---------|------------|-----------------|-----------|
| API | 3000 | 3000 | RPG System API |
| PostgreSQL | 5432 | 5432 | Banco de dados |
| Kafka | 9092 | 9092 | Message broker |
| Zookeeper | 2181 | 2181 | Kafka coordinator |

## 🔍 Acessando os Serviços

### API
```bash
curl http://localhost:3000/health
```

### PostgreSQL
```bash
# Via psql
psql -h localhost -p 5432 -U admin -d rpg_system

# Via Docker
docker exec -it rpg_postgres psql -U admin -d rpg_system
```

### Kafka
```bash
# Listar tópicos
docker exec -it kafka kafka-topics --list --bootstrap-server localhost:9092
```

## 💡 Dicas

### Hot Reload

O código da API é montado como volume, então mudanças no código local são refletidas automaticamente no container (hot reload).

### Logs Coloridos

```bash
# Instale o ccze para logs coloridos
brew install ccze  # macOS
apt install ccze   # Linux

# Use com docker-compose
docker-compose logs -f | ccze -A
```

### Executar Comandos no Container

```bash
# Entrar no container da API
docker exec -it rpg_api sh

# Executar comando direto
docker exec -it rpg_api npm run test
```

## 🎓 Entendendo o Fluxo

```
docker-compose up
    ↓
1. Inicia container 'setup' (node:20-alpine)
   ├─ Monta volumes dos projetos
   ├─ Executa setup.js para rpg-system-infra
   ├─ Executa setup.js para rpg-system-api
   ├─ Executa setup.js para rpg-system-core
   └─ Finaliza com sucesso
    ↓
2. Container 'setup' completa (depends_on)
    ↓
3. Inicia containers de infraestrutura
   ├─ postgres (banco de dados)
   ├─ zookeeper (kafka coordinator)
   └─ kafka (message broker)
    ↓
4. Aguarda infraestrutura estar pronta
    ↓
5. Inicia container 'api'
   ├─ Lê .env files (já configurados!)
   ├─ Constrói imagem (se necessário)
   ├─ Inicia aplicação
   └─ Hot reload ativo
    ↓
✅ Ambiente completo rodando!
```

**Vantagens dessa abordagem:**
- ✅ Um único comando: `docker-compose up`
- ✅ Setup automático antes de tudo
- ✅ Garante ordem correta de inicialização
- ✅ Container de setup não fica rodando (restart: "no")
- ✅ Funciona em qualquer máquina sem setup manual
