# Guia de Debugging Local

## 🐛 Como Debugar Todo o Ecossistema

### Cenário: Acompanhar uma Requisição do Início ao Fim

```
Cliente → API → Kafka → Outro Serviço → PostgreSQL
  ↓       ↓       ↓          ↓            ↓
 [1]     [2]     [3]        [4]          [5]
```

Você pode colocar breakpoints em **cada etapa**!

---

## 🎯 Setup de Debugging

### 1. Debugging da API (Node.js)

#### Opção A: VS Code com Docker

**`.vscode/launch.json`** (na pasta rpg-system-api):
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Docker: Attach to API",
      "remoteRoot": "/usr/src/app",
      "localRoot": "${workspaceFolder}",
      "protocol": "inspector",
      "port": 9229,
      "restart": true,
      "sourceMaps": true
    }
  ]
}
```

**Modificar `docker-compose.yml`:**
```yaml
api:
  # ... resto da config
  ports:
    - "3000:3000"
    - "9229:9229"    # ← Porta de debug
  command: npm run start:debug  # ← Modo debug
```

**Adicionar script no `package.json`:**
```json
{
  "scripts": {
    "start:debug": "nodemon --inspect=0.0.0.0:9229 src/index.js"
  }
}
```

**Como usar:**
1. `docker-compose up`
2. VS Code → F5 (ou Debug → Start Debugging)
3. Coloque breakpoints no código
4. Faça uma requisição
5. VS Code para no breakpoint! 🎉

#### Opção B: Debugging Direto (sem Docker)

```bash
# Terminal 1: Inicie PostgreSQL e Kafka com Docker
docker-compose up postgres kafka zookeeper

# Terminal 2: Rode a API localmente em modo debug
cd rpg-system-api
npm run start:debug
```

**`.vscode/launch.json`:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API Local",
      "program": "${workspaceFolder}/src/index.js",
      "envFile": "${workspaceFolder}/.env",
      "console": "integratedTerminal"
    }
  ]
}
```

---

## 📊 Acompanhando Kafka

### Kafka UI (Interface Visual)

Adicione ao `docker-compose.yml`:

```yaml
services:
  # ... seus serviços existentes

  kafka-ui:
    container_name: kafka-ui
    image: provectuslabs/kafka-ui:latest
    ports:
      - "8080:8080"
    environment:
      KAFKA_CLUSTERS_0_NAME: local
      KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka:29092
      KAFKA_CLUSTERS_0_ZOOKEEPER: zookeeper:2181
    depends_on:
      - kafka
      - zookeeper
```

**Acesse:** http://localhost:8080

**O que você vê:**
- ✅ Todos os tópicos
- ✅ Mensagens em tempo real
- ✅ Consumers ativos
- ✅ Lag de consumo
- ✅ Configurações

### Exemplo de Uso

```javascript
// src/controllers/character.js
const { producer } = require('../kafka');

async function createCharacter(req, res) {
  const character = req.body;
  
  // 1. Salva no banco
  await db.query('INSERT INTO characters ...', character);
  console.log('✅ [1] Personagem salvo no banco');
  
  // 2. Publica evento no Kafka
  await producer.send({
    topic: 'character-created',
    messages: [
      { value: JSON.stringify(character) }
    ]
  });
  console.log('✅ [2] Evento publicado no Kafka');
  
  // 3. Breakpoint aqui! ←
  res.json({ success: true, character });
}
```

**No Kafka UI você verá:**
```
Topic: character-created
├─ Partition 0
│  └─ Message 1: {"name": "Gandalf", "class": "Wizard"}
└─ Consumers: notification-service (lag: 0)
```

---

## 🔍 Debugging Passo a Passo

### Exemplo Completo: Criar Personagem

#### 1. Cliente faz requisição
```bash
curl -X POST http://localhost:3000/api/characters \
  -H "Content-Type: application/json" \
  -d '{"name": "Aragorn", "class": "Ranger"}'
```

#### 2. API recebe (Breakpoint #1)
```javascript
// src/routes/characters.js
router.post('/characters', async (req, res) => {
  debugger; // ← Breakpoint aqui
  const character = req.body;
  // ...
});
```

**VS Code para aqui!**
- Inspecione `req.body`
- Veja headers, query params, etc.

#### 3. Valida com Core (Breakpoint #2)
```javascript
// rpg-system-core/src/character.js
function validateCharacter(data) {
  debugger; // ← Breakpoint aqui
  
  if (!data.name) throw new Error('Name required');
  // ...
  return true;
}
```

#### 4. Salva no PostgreSQL (Breakpoint #3)
```javascript
// src/database/characters.js
async function saveCharacter(character) {
  debugger; // ← Breakpoint aqui
  
  const result = await pool.query(
    'INSERT INTO characters (name, class) VALUES ($1, $2) RETURNING *',
    [character.name, character.class]
  );
  
  return result.rows[0];
}
```

**Inspecione:**
- Query SQL gerada
- Parâmetros
- Resultado do banco

#### 5. Publica no Kafka (Breakpoint #4)
```javascript
// src/kafka/producer.js
async function publishCharacterCreated(character) {
  debugger; // ← Breakpoint aqui
  
  await producer.send({
    topic: 'character-created',
    messages: [{ value: JSON.stringify(character) }]
  });
}
```

**Kafka UI mostra:**
- Mensagem chegando no tópico em tempo real!

#### 6. Serviço de Notificação Consome (Breakpoint #5)
```javascript
// notification-service/src/consumer.js
consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    debugger; // ← Breakpoint aqui
    
    const character = JSON.parse(message.value);
    console.log('Enviando notificação:', character);
    
    // Envia email, push notification, etc.
  }
});
```

---

## 🎮 Ferramentas Úteis

### 1. PostgreSQL GUI

**DBeaver (Free):**
```bash
# Conecte ao banco local
Host: localhost
Port: 5432
Database: rpg_system
User: admin
Password: admin
```

**Veja:**
- Tabelas em tempo real
- Execute queries manualmente
- Veja dados sendo inseridos

### 2. Kafka CLI

```bash
# Listar tópicos
docker exec -it kafka kafka-topics --list --bootstrap-server localhost:9092

# Criar tópico
docker exec -it kafka kafka-topics --create \
  --topic character-created \
  --bootstrap-server localhost:9092 \
  --partitions 3 \
  --replication-factor 1

# Consumir mensagens (ver em tempo real)
docker exec -it kafka kafka-console-consumer \
  --topic character-created \
  --bootstrap-server localhost:9092 \
  --from-beginning

# Produzir mensagem de teste
docker exec -it kafka kafka-console-producer \
  --topic character-created \
  --bootstrap-server localhost:9092
```

### 3. Logs em Tempo Real

```bash
# Todos os serviços
docker-compose logs -f

# Apenas API
docker-compose logs -f api

# Apenas Kafka
docker-compose logs -f kafka

# Com grep
docker-compose logs -f api | grep "ERROR"
```

### 4. Postman/Insomnia

Crie coleção de requests:
```
POST /api/characters
GET /api/characters/:id
POST /api/battles
GET /api/characters/:id/stats
```

Salve exemplos de payloads, headers, etc.

---

## 🎯 Workflow Completo de Debugging

### Cenário: Bug na criação de personagem

```bash
# 1. Suba o ambiente
docker-compose up

# 2. Abra Kafka UI
open http://localhost:8080

# 3. Abra DBeaver e conecte ao PostgreSQL

# 4. VS Code: Coloque breakpoints
#    - API: src/controllers/character.js
#    - Core: src/character-validator.js
#    - Kafka: src/kafka/producer.js

# 5. Start debugging (F5)

# 6. Faça requisição
curl -X POST http://localhost:3000/api/characters \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "class": "Warrior"}'

# 7. VS Code para no primeiro breakpoint
#    - Inspecione variáveis
#    - Step over/into/out
#    - Continue

# 8. Kafka UI mostra mensagem chegando

# 9. DBeaver: Refresh e veja registro no banco

# 10. Logs mostram o fluxo completo
```

---

## 💡 Dicas Pro

### 1. Logging Estruturado

```javascript
// Use pino ou winston
const logger = require('pino')();

logger.info({ 
  event: 'character_created',
  characterId: character.id,
  userId: req.user.id,
  timestamp: Date.now()
}, 'Character created successfully');
```

**Benefício:** Logs estruturados são fáceis de filtrar e analisar.

### 2. Correlation ID

```javascript
// Middleware para adicionar ID único em cada request
app.use((req, res, next) => {
  req.correlationId = uuidv4();
  res.setHeader('X-Correlation-ID', req.correlationId);
  next();
});

// Use em todos os logs
logger.info({ correlationId: req.correlationId }, 'Processing request');

// Passe para Kafka
await producer.send({
  topic: 'character-created',
  messages: [{
    headers: { correlationId: req.correlationId },
    value: JSON.stringify(character)
  }]
});
```

**Benefício:** Rastreie uma requisição por todo o sistema!

### 3. Health Checks

```javascript
// src/routes/health.js
router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: Date.now(),
    services: {
      database: await checkDatabase(),
      kafka: await checkKafka(),
      redis: await checkRedis()
    }
  };
  
  res.json(health);
});
```

**Acesse:** http://localhost:3000/health

---

## 🎓 Resumo

| Ferramenta | O Que Faz | URL/Comando |
|------------|-----------|-------------|
| **VS Code Debugger** | Breakpoints no código | F5 |
| **Kafka UI** | Ver tópicos e mensagens | http://localhost:8080 |
| **DBeaver** | Ver banco de dados | localhost:5432 |
| **Docker Logs** | Ver logs em tempo real | `docker-compose logs -f` |
| **Postman** | Testar APIs | - |

**Você consegue:**
- ✅ Colocar breakpoints em qualquer lugar
- ✅ Ver mensagens Kafka em tempo real
- ✅ Inspecionar banco de dados
- ✅ Acompanhar requisição do início ao fim
- ✅ Debugar múltiplos serviços simultaneamente

**Tudo local, tudo sob seu controle!** 🎯
