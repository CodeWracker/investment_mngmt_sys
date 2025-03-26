FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Carrega as variáveis de ambiente do .env (opcional, mas útil para dev local)
# Se você quiser usar o .env dentro do container (não recomendado para produção),
# você pode adicionar:
# COPY .env .env

CMD ["npm", "run", "dev"] 