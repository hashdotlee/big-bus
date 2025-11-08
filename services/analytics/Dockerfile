# Multi-stage build for optimized production image

# Development stage
FROM node:18-alpine AS development

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json ./
COPY pnpm-lock.yaml* ./

# Copy service package.json
COPY services/analytics/package*.json ./services/analytics/
COPY services/analytics/tsconfig*.json ./services/analytics/
COPY services/analytics/nest-cli.json ./services/analytics/

# Install dependencies (without frozen-lockfile for development flexibility)
RUN pnpm install --filter @big-bus/analytics-service...

# Copy source code
COPY services/analytics/src ./services/analytics/src

WORKDIR /app/services/analytics

# Expose port
EXPOSE 3006

# Development command will be provided by docker-compose
CMD ["pnpm", "run", "start:dev"]

# Build stage
FROM node:18-alpine AS build

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json ./
COPY pnpm-lock.yaml* ./

# Copy service files
COPY services/analytics ./services/analytics

# Install dependencies
RUN pnpm install --filter @big-bus/analytics-service...

WORKDIR /app/services/analytics

RUN pnpm run build

# Production stage
FROM node:18-alpine AS production

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

WORKDIR /app

ENV NODE_ENV=production

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json ./
COPY pnpm-lock.yaml* ./

# Copy service package.json
COPY services/analytics/package*.json ./services/analytics/

# Install only production dependencies
RUN pnpm install --filter @big-bus/analytics-service... --prod

# Copy built application from build stage
COPY --from=build /app/services/analytics/dist ./services/analytics/dist

WORKDIR /app/services/analytics

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3006

CMD ["node", "dist/main"]
