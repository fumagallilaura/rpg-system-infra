# Guia de Migração para Nuvem

## 🎯 O Que Muda Entre Local e Produção?

### Resumo Executivo
**90% do código não muda!** Apenas configurações e infraestrutura.

---

## 📊 Comparação Detalhada

### 1. Variáveis de Ambiente

#### Local (Docker Compose)
```bash
# .env
DB_HOST=postgres                    # Nome do serviço no docker-compose
DB_PORT=5432
DB_NAME=rpg_system
DB_USER=admin
DB_PASSWORD=admin

KAFKA_BROKER=kafka:29092            # Nome do serviço interno
REDIS_HOST=redis
```

#### Produção (AWS)
```bash
# .env (via AWS Secrets Manager ou Parameter Store)
DB_HOST=rpg-prod.abc123.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=rpg_system
DB_USER=rpg_admin
DB_PASSWORD=<secret-from-aws-secrets-manager>

KAFKA_BROKER=b-1.rpg-msk.xyz.kafka.us-east-1.amazonaws.com:9092
REDIS_HOST=rpg-cache.abc.cache.amazonaws.com
```

---

### 2. Infraestrutura

#### Local
```yaml
# docker-compose.yml
services:
  api:
    build: .
    ports:
      - "3000:3000"
  
  postgres:
    image: postgres:15-alpine
  
  kafka:
    image: confluentinc/cp-kafka
```

#### Produção (Kubernetes)
```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rpg-api
spec:
  replicas: 10                    # ← 10 instâncias!
  template:
    spec:
      containers:
      - name: api
        image: your-registry/rpg-api:v1.2.3
        env:
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: host
```

**Serviços Gerenciados (não precisa configurar):**
- AWS RDS (PostgreSQL)
- AWS MSK (Kafka)
- AWS ElastiCache (Redis)

---

### 3. Código da Aplicação

#### ✅ NÃO MUDA (99% do código)

```javascript
// src/database.js
// Funciona IGUAL em local e produção!
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,        // ← Só muda a variável
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

module.exports = pool;
```

```javascript
// src/kafka-producer.js
// Funciona IGUAL em local e produção!
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'rpg-api',
  brokers: [process.env.KAFKA_BROKER],  // ← Só muda a variável
});

const producer = kafka.producer();
```

#### ⚠️ PODE MUDAR (configurações específicas)

```javascript
// src/kafka-producer.js (produção)
const kafka = new Kafka({
  clientId: 'rpg-api',
  brokers: [process.env.KAFKA_BROKER],
  ssl: true,                              // ← SSL em produção
  sasl: {                                 // ← Autenticação
    mechanism: 'aws',
    authorizationIdentity: process.env.AWS_ACCESS_KEY,
  },
});
```

---

## 🔄 Fluxo de Deploy

### Desenvolvimento Local
```
┌─────────────────┐
│ Seu Computador  │
│                 │
│ docker-compose  │
│    up           │
│                 │
│ ├─ API          │
│ ├─ PostgreSQL   │
│ ├─ Kafka        │
│ └─ Redis        │
└─────────────────┘
```

### Produção na Nuvem
```
┌──────────────────────────────────────────────────┐
│                    AWS Cloud                     │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌────────────────────────────────────────┐     │
│  │         ECS/EKS (Kubernetes)           │     │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐  │     │
│  │  │API │ │API │ │API │ │API │ │API │  │     │
│  │  │ 1  │ │ 2  │ │ 3  │ │ 4  │ │ 5  │  │     │
│  │  └────┘ └────┘ └────┘ └────┘ └────┘  │     │
│  └────────────────────────────────────────┘     │
│           ↓           ↓           ↓             │
│  ┌─────────────┐ ┌──────────┐ ┌───────────┐   │
│  │   AWS RDS   │ │ AWS MSK  │ │ElastiCache│   │
│  │ (PostgreSQL)│ │ (Kafka)  │ │  (Redis)  │   │
│  └─────────────┘ └──────────┘ └───────────┘   │
└──────────────────────────────────────────────────┘
```

---

## 🛠️ Checklist de Migração

### Fase 1: Preparação
- [ ] Criar conta AWS/GCP/Azure
- [ ] Configurar VPC e redes
- [ ] Provisionar RDS (PostgreSQL)
- [ ] Provisionar MSK (Kafka)
- [ ] Provisionar ElastiCache (Redis)
- [ ] Configurar secrets (AWS Secrets Manager)

### Fase 2: Containerização
- [ ] Build da imagem Docker
- [ ] Push para registry (ECR, Docker Hub)
- [ ] Testar imagem localmente

### Fase 3: Deploy
- [ ] Criar cluster Kubernetes/ECS
- [ ] Aplicar manifests/configs
- [ ] Configurar Load Balancer
- [ ] Configurar DNS
- [ ] Configurar SSL/TLS

### Fase 4: Observabilidade
- [ ] Configurar logs (CloudWatch, ELK)
- [ ] Configurar métricas (Prometheus, Datadog)
- [ ] Configurar alertas
- [ ] Configurar tracing (Jaeger, X-Ray)

---

## 💰 Custos Estimados

### Local (Desenvolvimento)
```
💵 Custo: $0/mês
📊 Recursos: Seu computador
```

### Produção (AWS - Exemplo)
```
💵 Custo estimado: $200-500/mês (baixo tráfego)

Breakdown:
- ECS/EKS (Kubernetes):    $70/mês
- RDS (PostgreSQL):        $50/mês
- MSK (Kafka):            $100/mês
- ElastiCache (Redis):     $30/mês
- Load Balancer:           $20/mês
- Networking/Data:         $30/mês
```

**Escala maior (100k usuários):**
```
💵 Custo estimado: $2000-5000/mês

- Mais instâncias da API
- RDS maior
- Kafka com mais brokers
- CDN (CloudFront)
- WAF (segurança)
```

---

## 🎯 Estratégias de Deploy

### 1. Blue-Green Deployment
```
┌─────────────────────────────────────┐
│  Load Balancer                      │
└───────────┬─────────────────────────┘
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌────────┐      ┌────────┐
│ Blue   │      │ Green  │
│ (v1.0) │      │ (v2.0) │
│ 100%   │      │   0%   │
└────────┘      └────────┘

Deploy v2.0 → Testa → Muda tráfego:

┌────────┐      ┌────────┐
│ Blue   │      │ Green  │
│ (v1.0) │      │ (v2.0) │
│   0%   │      │ 100%   │
└────────┘      └────────┘
```

### 2. Canary Deployment
```
Deploy gradual:

v1.0: 100% → 90% → 50% → 10% → 0%
v2.0:   0% → 10% → 50% → 90% → 100%

Se v2.0 tem problemas, rollback rápido!
```

---

## 🔍 Debugging: Local vs Produção

### Local (Fácil!)
```bash
# Breakpoints funcionam direto
# VS Code attach to container
docker exec -it rpg_api sh
npm run debug

# Logs em tempo real
docker-compose logs -f api

# Kafka UI local
http://localhost:8080
```

### Produção (Mais complexo)
```bash
# Logs centralizados
aws logs tail /aws/ecs/rpg-api --follow

# Métricas
CloudWatch Dashboards

# Debugging remoto
kubectl port-forward pod/rpg-api-xyz 9229:9229
# Attach VS Code remote debugger

# Kafka
AWS MSK Console ou Kafka UI deployado
```

---

## 📝 Exemplo Prático de Migração

### Passo 1: Código Local
```javascript
// config/database.js
module.exports = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  // ...
};
```

### Passo 2: Build Docker
```bash
docker build -t rpg-api:1.0.0 .
docker tag rpg-api:1.0.0 your-registry/rpg-api:1.0.0
docker push your-registry/rpg-api:1.0.0
```

### Passo 3: Deploy Kubernetes
```bash
# Criar secrets
kubectl create secret generic db-credentials \
  --from-literal=host=rpg-prod.rds.amazonaws.com \
  --from-literal=password=super-secret

# Deploy
kubectl apply -f kubernetes/deployment.yaml

# Verificar
kubectl get pods
kubectl logs -f rpg-api-xyz
```

### Passo 4: Configurar DNS
```bash
# Route53 ou CloudFlare
api.rpg-system.com → Load Balancer IP
```

---

## 🎓 Resumo

| Aspecto | Local | Produção |
|---------|-------|----------|
| **Código** | ✅ Mesmo | ✅ Mesmo |
| **Configuração** | .env local | AWS Secrets |
| **Infraestrutura** | Docker Compose | Kubernetes |
| **Banco de Dados** | Container | AWS RDS |
| **Kafka** | Container | AWS MSK |
| **Escala** | 1 instância | N instâncias |
| **Custo** | $0 | $200-5000/mês |
| **Debugging** | Fácil | Requer ferramentas |
| **Deploy** | `docker-compose up` | CI/CD pipeline |

**Mensagem chave:** Seu código não muda! Só configurações e onde roda.
