# Guia de Início Rápido - RPG System

Escolha seu caminho baseado no seu ambiente:

## 🎯 Qual Opção Escolher?

```
┌─────────────────────────────────────────────────────┐
│  Você tem Docker instalado?                        │
└───────────────┬─────────────────────────────────────┘
                │
        ┌───────┴───────┐
        │               │
       SIM             NÃO
        │               │
        ▼               ▼
┌───────────────┐  ┌────────────────┐
│  OPÇÃO DOCKER │  │  OPÇÃO MANUAL  │
└───────────────┘  └────────────────┘
```

---

## 🐳 Opção Docker

### ✅ Vantagens
- Setup com um único comando
- Todos os serviços incluídos (API, DB, Kafka)
- Ambiente idêntico em qualquer máquina
- Isolamento completo

### ⚠️ Desvantagens
- Requer ~4-8GB RAM
- Startup mais lento (~30-60s)
- Requer Docker instalado

### 🚀 Como Usar

```bash
# 1. Clone os repositórios
git clone <rpg-system-infra>
git clone <rpg-system-api>

# 2. Entre na pasta de infraestrutura
cd rpg-system-infra

# 3. Suba tudo
docker-compose up
```

**Pronto!** Acesse: http://localhost:3000

### 📖 Documentação Completa
[Ver Guia Docker Completo](DOCKER_SETUP.md)

---

## 💻 Opção Manual

### ✅ Vantagens
- Usa menos recursos (~2GB RAM)
- Startup rápido (~10s)
- Debugging direto
- Não precisa de Docker

### ⚠️ Desvantagens
- Mais passos para configurar
- Precisa instalar serviços separadamente
- Pode variar entre sistemas operacionais

### 🚀 Como Usar

```bash
# 1. Clone os repositórios
git clone <rpg-system-infra>
git clone <rpg-system-api>

# 2. Entre na pasta de infraestrutura
cd rpg-system-infra

# 3. Inicie os serviços
npm start
```

O script vai:
1. Configurar todos os `.env` automaticamente
2. Mostrar instruções para serviços externos (PostgreSQL, etc)
3. Iniciar a aplicação

### 📖 Documentação Completa
[Ver Guia Manual Completo](MANUAL_SETUP.md)

---

## 📊 Comparação Lado a Lado

| Critério | Docker 🐳 | Manual 💻 |
|----------|-----------|-----------|
| **Comando inicial** | `docker-compose up` | `npm start` |
| **RAM necessária** | 4-8GB | 2GB |
| **Tempo de startup** | 30-60s | 10s |
| **Serviços incluídos** | ✅ Tudo | ⚠️ Só Node.js |
| **Setup de .env** | ✅ Automático | ✅ Automático |
| **PostgreSQL** | ✅ Incluído | ❌ Instalar separado |
| **Kafka** | ✅ Incluído | ❌ Instalar separado |
| **Hot reload** | ✅ Sim | ✅ Sim |
| **Debugging** | ⚠️ Requer config | ✅ Nativo |
| **Isolamento** | ✅ Completo | ❌ Compartilhado |
| **Portabilidade** | ✅ Funciona igual | ⚠️ Varia por SO |

---

## 🎓 Recomendações

### Use Docker se:
- ✅ Sua máquina tem ≥8GB RAM
- ✅ Quer ambiente completo rapidamente
- ✅ Trabalha em equipe (consistência)
- ✅ Vai usar todos os serviços (Kafka, etc)

### Use Manual se:
- ✅ Sua máquina tem <8GB RAM
- ✅ Quer desenvolvimento mais rápido
- ✅ Foco em apenas um serviço
- ✅ Prefere debugging direto
- ✅ Não tem/quer Docker

---

## 🔄 Posso Trocar Depois?

**Sim!** Seus arquivos `.env` funcionam em ambas as opções.

### De Manual para Docker:
```bash
# Pare os serviços manuais (Ctrl+C)
docker-compose up
```

### De Docker para Manual:
```bash
# Pare os containers
docker-compose down

# Inicie manualmente
npm start
```

---

## 🆘 Precisa de Ajuda?

- **Docker:** [Guia Docker Completo](DOCKER_SETUP.md)
- **Manual:** [Guia Manual Completo](MANUAL_SETUP.md)
- **Setup de .env:** [README Principal](../README.md#setup-de-env)

---

## 📝 Próximos Passos

Depois de escolher e configurar:

1. ✅ Verifique se a API está rodando: `curl http://localhost:3000/health`
2. ✅ Leia a documentação da API
3. ✅ Configure seu editor/IDE
4. ✅ Comece a desenvolver! 🚀
