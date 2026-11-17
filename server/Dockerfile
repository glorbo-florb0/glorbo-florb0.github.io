# Build context is the repository root (see docker-compose.yml) so the API can be seeded
# from the same src/data/content.json the website uses.
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app

COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY server/server.js server/put-content.js ./
COPY src/data/content.json ./seed-data.json

USER node
EXPOSE 3000
CMD ["node", "server.js"]
