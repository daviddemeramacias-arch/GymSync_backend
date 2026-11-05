# ─── Stage: development ──────────────────────────────────────
FROM node:20-alpine AS development

WORKDIR /app

RUN apk add --no-cache python3 make g++ \
    && npm install -g ts-node nodemon

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]

# ─── Stage: build ────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# ─── Stage: production ───────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./

RUN mkdir -p logs uploads && \
    addgroup -g 1001 -S nodejs && \
    adduser -S gymsync -u 1001 && \
    chown -R gymsync:nodejs /app

USER gymsync
EXPOSE 3000
CMD ["node", "dist/main.js"]
