FROM node:14
WORKDIR /app/services/api-gateway
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "server.js"]