FROM node:14
WORKDIR /app/services/data-simulator
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "server.js"]