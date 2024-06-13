FROM node:latest

WORKDIR /app

COPY controllers ./controllers
COPY data ./data
COPY proto ./proto
COPY services ./services
COPY package.json package-lock.json server.js ./
COPY .env.production .env

RUN npm install --omit=dev

EXPOSE 3001

CMD ["node", "server.js"]