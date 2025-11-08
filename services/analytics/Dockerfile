FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Build stage
FROM base AS builder
WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages ./packages
COPY services/analytics ./services/analytics

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the service
RUN pnpm --filter @big-bus/analytics-service build

# Production stage
FROM base AS runner
WORKDIR /app

# Install production dependencies only
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages ./packages
COPY services/analytics/package.json ./services/analytics/
RUN pnpm install --filter @big-bus/analytics-service --prod --frozen-lockfile

# Copy built files
COPY --from=builder /app/services/analytics/dist ./services/analytics/dist
COPY --from=builder /app/packages ./packages

WORKDIR /app/services/analytics

EXPOSE 3006

CMD ["node", "dist/main.js"]
