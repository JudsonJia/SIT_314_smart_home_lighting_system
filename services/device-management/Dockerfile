FROM node:14
WORKDIR /app/services/device-management
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "server.js"]