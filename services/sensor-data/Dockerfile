FROM node:14    
WORKDIR /app/services/sensor-data
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "server.js"]