FROM node:14
WORKDIR /app/services/analytics
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "server.js"]