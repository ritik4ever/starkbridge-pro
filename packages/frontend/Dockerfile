FROM node:18-alpine AS base
WORKDIR /app

# Copy package files
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN npm ci --only=production

# Build shared package
COPY packages/shared ./packages/shared
RUN npm run build -w packages/shared

# Build frontend
COPY packages/frontend ./packages/frontend
RUN npm run build -w packages/frontend

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=base /app/packages/frontend/public ./public
COPY --from=base --chown=nextjs:nodejs /app/packages/frontend/.next/standalone ./
COPY --from=base --chown=nextjs:nodejs /app/packages/frontend/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]