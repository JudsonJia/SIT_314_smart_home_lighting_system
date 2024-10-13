FROM node:14
WORKDIR /app/services/scheduling
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "server.js"]