FROM node:18-alpine AS base
WORKDIR /app

# Copy package files
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN npm ci --only=production

# Build shared package
COPY packages/shared ./packages/shared
RUN npm run build -w packages/shared

# Copy backend source
COPY packages/backend ./packages/backend

# Generate Prisma client
RUN npx prisma generate --schema=./packages/backend/prisma/schema.prisma

# Build backend
RUN npm run build -w packages/backend

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY --from=base --chown=nodejs:nodejs /app/packages/backend/dist ./dist
COPY --from=base --chown=nodejs:nodejs /app/packages/backend/node_modules ./node_modules
COPY --from=base --chown=nodejs:nodejs /app/packages/backend/prisma ./prisma

USER nodejs

EXPOSE 4000

CMD ["node", "dist/index.js"]