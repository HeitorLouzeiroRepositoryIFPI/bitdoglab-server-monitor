FROM node:20-alpine

WORKDIR /app

# Copiar package.json e package-lock.json (se existir)
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar os arquivos do projeto
COPY . .

# Build para produção 
RUN npm run build

# Instalar servidor estático para servir o conteúdo buildado
RUN npm install -g serve

# Expor porta
EXPOSE 3000

# Executar o servidor em modo de desenvolvimento
CMD ["npm", "start"]