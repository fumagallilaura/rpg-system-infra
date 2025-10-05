# Como Commitar - Guia Rápido

## 📁 Estrutura Final

```
rpg-system-infra/
├── .dockerignore              # Arquivos ignorados no Docker
├── .env.example               # Template de variáveis (COMMITAR)
├── .gitignore                 # Arquivos ignorados no Git
├── docker-compose.yml         # Configuração Docker completa
├── Dockerfile                 # Build da imagem
├── LICENSE                    # Licença do projeto
├── package.json               # Scripts npm
├── README.md                  # Documentação principal
│
├── docs/                      # Documentação detalhada
│   ├── CLOUD_MIGRATION.md     # Como migrar para nuvem
│   ├── DEBUGGING_GUIDE.md     # Como debugar localmente
│   ├── DOCKER_SETUP.md        # Guia Docker completo
│   ├── MANUAL_SETUP.md        # Guia setup manual
│   └── QUICK_START.md         # Guia de decisão
│
└── scripts/                   # Scripts de automação
    ├── setup.js               # Setup principal de .env
    └── manual/
        └── start-all.js       # Inicia serviços manualmente
```

## 🚀 Como Commitar

### 1. Verificar o que mudou

```bash
cd rpg-system-infra
git status
```

### 2. Ver diferenças

```bash
# Ver todas as mudanças
git diff

# Ver mudanças em arquivo específico
git diff README.md
```

### 3. Adicionar arquivos

```bash
# Adicionar tudo
git add .

# Ou adicionar seletivamente
git add README.md
git add docker-compose.yml
git add scripts/
git add docs/
```

### 4. Commitar

```bash
git commit -m "feat: setup automático de ambiente com Docker e modo manual

- Adiciona docker-compose.yml com setup automático de .env
- Adiciona Kafka UI para debugging (localhost:8080)
- Cria scripts de setup multiplataforma (Windows, macOS, Linux)
- Adiciona modo manual para máquinas com poucos recursos
- Documenta migração para nuvem e debugging local
- Adiciona guias completos para Docker e Manual

Closes #issue-number"
```

### 5. Push

```bash
# Primeira vez (cria branch)
git push -u origin main

# Próximas vezes
git push
```

## 📝 Mensagens de Commit (Conventional Commits)

### Formato
```
<tipo>(<escopo>): <descrição curta>

<descrição longa (opcional)>

<footer (opcional)>
```

### Tipos Comuns
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Apenas documentação
- `style`: Formatação, sem mudança de código
- `refactor`: Refatoração de código
- `test`: Adiciona ou corrige testes
- `chore`: Tarefas de manutenção

### Exemplos

```bash
# Feature nova
git commit -m "feat(docker): adiciona Kafka UI para debugging"

# Correção
git commit -m "fix(setup): corrige merge de variáveis extras no .env"

# Documentação
git commit -m "docs: adiciona guia de migração para nuvem"

# Múltiplas mudanças
git commit -m "feat: implementa infraestrutura completa

- Adiciona docker-compose com todos os serviços
- Cria scripts de setup automático
- Documenta duas opções: Docker e Manual
- Adiciona guias de debugging e cloud migration"
```

## 🔍 Verificar Antes de Commitar

```bash
# 1. Certifique-se de que .env NÃO está sendo commitado
git status | grep .env
# Deve mostrar apenas .env.example

# 2. Verifique se .gitignore está correto
cat .gitignore

# 3. Teste se tudo funciona
docker-compose up
# Ctrl+C para parar

# 4. Verifique se não tem arquivos desnecessários
git status
```

## ⚠️ NUNCA Commitar

- ❌ `.env` (contém secrets!)
- ❌ `node_modules/`
- ❌ Arquivos de IDE (`.vscode/`, `.idea/`)
- ❌ Logs
- ❌ Builds temporários

## ✅ SEMPRE Commitar

- ✅ `.env.example` (template)
- ✅ `docker-compose.yml`
- ✅ Scripts (`scripts/`)
- ✅ Documentação (`docs/`, `README.md`)
- ✅ `.gitignore`
- ✅ `package.json`

## 🌿 Workflow com Branches

### Criar feature branch

```bash
# Criar e mudar para nova branch
git checkout -b feature/kafka-ui

# Fazer mudanças...
git add .
git commit -m "feat: adiciona Kafka UI"

# Push da branch
git push -u origin feature/kafka-ui
```

### Merge para main

```bash
# Voltar para main
git checkout main

# Atualizar main
git pull origin main

# Fazer merge
git merge feature/kafka-ui

# Push
git push origin main

# Deletar branch (opcional)
git branch -d feature/kafka-ui
```

## 🔄 Comandos Úteis

```bash
# Ver histórico
git log --oneline --graph

# Desfazer último commit (mantém mudanças)
git reset --soft HEAD~1

# Desfazer mudanças em arquivo
git checkout -- arquivo.js

# Ver quem mudou o quê
git blame arquivo.js

# Buscar em commits
git log --grep="kafka"

# Ver mudanças de um commit específico
git show abc123
```

## 📦 Exemplo Completo

```bash
# 1. Verificar status
cd rpg-system-infra
git status

# 2. Adicionar tudo
git add .

# 3. Commitar
git commit -m "feat: infraestrutura completa com Docker e modo manual

Implementa sistema de setup automático que funciona em:
- Docker (recomendado): docker-compose up
- Manual (máquinas fracas): npm start

Features:
- Setup automático de .env com merge inteligente
- Kafka UI para debugging (localhost:8080)
- Suporte a Windows, macOS e Linux
- Documentação completa para cada modo
- Guias de debugging e migração para nuvem

Estrutura:
- docker-compose.yml: orquestra todos os serviços
- scripts/setup.js: configura .env automaticamente
- scripts/manual/start-all.js: modo sem Docker
- docs/: guias completos

Testado em macOS com Docker Desktop"

# 4. Push
git push -u origin main
```

## 🎓 Dicas

1. **Commits pequenos e frequentes** são melhores que um commit gigante
2. **Mensagens descritivas** ajudam o time a entender o que mudou
3. **Teste antes de commitar** - garante que não quebrou nada
4. **Use branches** para features grandes
5. **Revise suas mudanças** antes de commitar (`git diff`)

## 🆘 Problemas Comuns

### "Commitei .env por engano!"

```bash
# Remove do Git mas mantém local
git rm --cached .env

# Adiciona ao .gitignore se ainda não está
echo ".env" >> .gitignore

# Commita a remoção
git commit -m "fix: remove .env do repositório"
git push
```

### "Quero desfazer o último commit"

```bash
# Desfaz commit mas mantém mudanças
git reset --soft HEAD~1

# Desfaz commit e mudanças (CUIDADO!)
git reset --hard HEAD~1
```

### "Conflito no merge"

```bash
# Ver arquivos em conflito
git status

# Editar arquivos e resolver conflitos
# Procure por <<<<<<, ======, >>>>>>

# Marcar como resolvido
git add arquivo-resolvido.js

# Finalizar merge
git commit
```
