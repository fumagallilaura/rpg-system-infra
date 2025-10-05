# -----------------------------------------------------------------------------
# Dockerfile para o Ambiente de Desenvolvimento do rpg-system-api
# -----------------------------------------------------------------------------

# Etapa 1: Define a imagem base
# Usamos a imagem oficial do Node.js v20, na versão 'alpine' por ser leve.
FROM node:20-alpine

# Etapa 2: Define o diretório de trabalho dentro do container
# Todos os comandos a seguir serão executados a partir deste diretório.
WORKDIR /usr/src/app

# Etapa 3: Declara o argumento para o Token do NPM
# Este argumento será passado pelo docker-compose durante o build da imagem.
# NUNCA coloque o token diretamente aqui.
ARG NPM_TOKEN

# Etapa 4: Cria o arquivo .npmrc DENTRO do container
# Este comando é executado uma única vez durante o build e configura o NPM
# do container para autenticar no GitHub Packages e buscar o pacote do escopo correto.
# A sua configuração de NPM local (da sua máquina) não é afetada.
RUN echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}" > .npmrc && \
    echo "@fumagallilaura:registry=https://npm.pkg.github.com/" >> .npmrc

# Etapa 5: Copia os manifestos de pacotes e instala as dependências
# Copiamos package*.json primeiro para aproveitar o cache do Docker.
# O `npm install` só será executado novamente se estes arquivos mudarem.
COPY package*.json ./
RUN npm install

# Etapa 6: Copia o resto do código-fonte
# Copia todo o conteúdo da pasta local para o diretório de trabalho do container.
COPY . .

# Etapa 7: Define o comando padrão
# Este comando será executado se o container for iniciado sem um comando específico.
# No nosso caso, o docker-compose irá sobrescrevê-lo para garantir o hot-reload.
CMD [ "npm", "run", "start:dev" ]