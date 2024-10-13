FROM node:14
WORKDIR /app/services/lighting-control
COPY package*.json ./
RUN npm install
COPY  . .
CMD ["node", "server.js"]