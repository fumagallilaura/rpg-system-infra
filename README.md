# RPG System Infrastructure

Infraestrutura e configuração para o projeto RPG System.

## 🚀 Início Rápido

**Novo no projeto?** [📖 Ver Guia de Início Rápido Completo](docs/QUICK_START.md)

Escolha a opção que melhor se adequa ao seu ambiente:

### Opção 1: Docker (Recomendado)
**Melhor para:** Ambiente completo, fácil setup, consistência entre máquinas

```bash
cd rpg-system-infra
docker-compose up
```

✅ Setup automático de `.env`  
✅ Todos os serviços (API, PostgreSQL, Kafka)  
✅ Um único comando

**[📖 Ver Guia Completo Docker](docs/DOCKER_SETUP.md)**

---

### Opção 2: Manual (Sem Docker)
**Melhor para:** Máquinas com poucos recursos, debugging direto, desenvolvimento focado

```bash
cd rpg-system-infra
node scripts/manual/start-all.js
```

✅ Menor uso de recursos (~2GB RAM)  
✅ Startup mais rápido  
✅ Debugging nativo

**[📖 Ver Guia Completo Manual](docs/MANUAL_SETUP.md)**

---

## 📋 Comparação Rápida

| Aspecto | Docker | Manual |
|---------|--------|--------|
| **Setup inicial** | `docker-compose up` | Vários passos |
| **RAM necessária** | ~4-8GB | ~2GB |
| **Startup** | ~30-60s | ~10s |
| **Serviços incluídos** | Tudo (API, DB, Kafka) | Apenas Node.js |
| **Isolamento** | ✅ Completo | ❌ Compartilhado |
| **Portabilidade** | ✅ Funciona igual em todos | ⚠️ Depende do SO |

---

## 🔧 Setup de .env (Ambas as Opções)

O setup de arquivos `.env` é automático em ambas as opções, mas você pode executar manualmente:

```bash
# Setup de todos os projetos
npm run setup

# Setup de um projeto específico
node scripts/setup.js ../rpg-system-api
```

O script automaticamente:
- ✅ Cria `.env` a partir do `.env.example`
- ✅ Preserva valores existentes ao atualizar
- ✅ Adiciona novas variáveis do template
- ✅ Detecta variáveis extras e avisa

## O Que o Setup Faz

O script de setup vai:
1. Procurar por arquivos `.env.example` neste projeto e projetos relacionados
2. Copiar cada `.env.example` para `.env` se ainda não existir
3. Pular arquivos que já existem para não sobrescrever sua configuração
4. Exibir mensagens úteis sobre o que foi criado ou pulado

**Depois de executar o setup:**
1. ✏️ Edite os arquivos `.env` com seus valores reais de configuração
2. 🔒 Nunca commite arquivos `.env` no git (eles contêm segredos!)
3. ⚠️ **NÃO delete arquivos `.env.example`** - eles servem como templates para outros desenvolvedores

## Configuração de Ambiente

### Criando Arquivos `.env.example`

Cada projeto deve ter um arquivo `.env.example` que serve como template. Este arquivo:
- ✅ **Deve ser commitado no git**
- ✅ Contém valores de exemplo/placeholder
- ✅ Documenta todas as variáveis de ambiente necessárias
- ✅ Ajuda novos desenvolvedores a configurar o ambiente
- ❌ **NÃO deve conter segredos ou credenciais reais**

Exemplo de estrutura:
```bash
# Configuração do Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nome_do_seu_banco

# API Keys (obtenha em: https://exemplo.com/api)
API_KEY=sua_chave_api_aqui

# Token NPM para pacotes privados
NPM_TOKEN=seu_token_github_aqui
```

### Usando Arquivos `.env`

O arquivo `.env` (criado a partir do `.env.example`):
- ❌ **NÃO deve ser commitado no git** (adicione ao `.gitignore`)
- ✅ Contém seus segredos e configurações reais
- ✅ É usado pela sua aplicação em tempo de execução
- ✅ É pessoal para cada desenvolvedor/ambiente

**Importante:** Sempre mantenha o `.env.example` atualizado quando adicionar novas variáveis de ambiente!

## 🖥️ Compatibilidade

### Scripts de Setup
Funcionam em **Windows, macOS e Linux**:
- ✅ **Windows** (CMD, PowerShell, Git Bash)
- ✅ **macOS** (Terminal, iTerm2, etc.)
- ✅ **Linux** (todas as distribuições)

**Requisito:** Node.js (versão 18 ou superior)

### Docker
Funciona em qualquer SO com Docker instalado:
- ✅ **Docker Desktop** (Windows, macOS)
- ✅ **Docker Engine** (Linux)

## 📁 Estrutura do Projeto

```
rpg-system-infra/
├── docs/
│   ├── DOCKER_SETUP.md       # Guia completo Docker
│   └── MANUAL_SETUP.md       # Guia completo Manual
├── scripts/
│   ├── setup.js              # Script principal de setup
│   ├── docker/
│   │   ├── docker-setup.js   # Setup + Docker compose
│   │   ├── docker-setup.sh   # Versão bash
│   │   └── entrypoint.sh     # Entrypoint dos containers
│   └── manual/
│       ├── setup.js          # Setup para uso manual
│       └── start-all.js      # Inicia todos os serviços
├── docker-compose.yml        # Configuração Docker
├── .env.example              # Template de variáveis
└── package.json              # Scripts npm
```

## Referência Rápida

### ⚠️ Regras Importantes para Arquivos `.env`

| Arquivo | Commitar no Git? | Propósito | Pode Deletar? |
|---------|------------------|-----------|---------------|
| `.env.example` | ✅ SIM | Template para outros devs | ❌ NÃO - Mantenha! |
| `.env` | ❌ NÃO | Seus segredos/config reais | ✅ Sim (regenere com setup) |

**Lembre-se:**
- `.env.example` = Template (commita isso!)
- `.env` = Seus segredos (nunca commita!)

## Usando em Outros Projetos

Para usar este sistema em outros projetos, simplesmente copie o script:

```bash
# Copie o script para seu projeto
cp scripts/setup.js ../seu-projeto/setup.js

# No seu projeto, crie um .env.example com suas variáveis
# Depois execute:
cd ../seu-projeto
node setup.js
```

Ou use diretamente sem copiar:
```bash
node rpg-system-infra/scripts/setup.js ../seu-projeto
```

## 📦 Requisitos

### Para Setup Manual
- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **PostgreSQL** (opcional - pode usar Docker só para isso)
- **Redis** (opcional)
- **Kafka** (opcional)

### Para Setup Docker
- **Docker** (versão 20 ou superior)
- **Docker Compose** (geralmente incluído no Docker Desktop)

## Licença

Veja o arquivo LICENSE para detalhes.