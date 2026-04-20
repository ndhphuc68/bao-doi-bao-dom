FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

ENV HOST=0.0.0.0
ENV PORT=3002
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3002
EXPOSE 3002

CMD ["node", ".output/server/index.mjs"]

