# Fase de Build
FROM node:18-alpine AS builder

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos package.json e package-lock.json (ou yarn.lock)
# para instalar as dependências
COPY package.json ./
COPY package-lock.json ./
# Se você usa yarn, COMENTE a linha acima e DESCOMENTE a linha abaixo:
# COPY yarn.lock ./

# Instala as dependências do projeto
RUN npm install
# Se você usa yarn, COMENTE a linha acima e DESCOMENTE a linha abaixo:
# RUN yarn install --frozen-lockfile

# Copia o restante do código da aplicação
COPY . .

# Constrói a aplicação (gera os arquivos estáticos na pasta 'dist')
# Certifique-se de que este comando corresponde ao seu script de build no package.json
RUN npm run build
# Se você usa yarn, COMENTE a linha acima e DESCOMENTE a linha abaixo:
# RUN yarn build

# --- Fase de Produção (Servir os arquivos estáticos) ---
FROM nginx:alpine

# Copia os arquivos estáticos gerados na fase de build para o diretório de serviço do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia uma configuração customizada do Nginx (se você tiver uma)
# Para um SPA, uma configuração simples para servir index.html para todas as rotas é necessária.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta que o Nginx vai usar para servir a aplicação
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
