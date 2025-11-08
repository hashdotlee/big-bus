# Multi-stage build for optimized production image

# Development stage
FROM node:18-alpine AS development

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json ./
COPY pnpm-lock.yaml* ./

# Copy shared packages
COPY packages ./packages

# Copy service package.json
COPY services/auth/package*.json ./services/auth/
COPY services/auth/tsconfig*.json ./services/auth/
COPY services/auth/nest-cli.json ./services/auth/

# Install dependencies (without frozen-lockfile for development flexibility)
RUN pnpm install --filter @big-bus/auth-service...

# Copy source code
COPY services/auth/src ./services/auth/src

WORKDIR /app/services/auth

# Expose port
EXPOSE 3001

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

# Copy shared packages
COPY packages ./packages

# Copy service files
COPY services/auth ./services/auth

# Install dependencies
RUN pnpm install --filter @big-bus/auth-service...

WORKDIR /app/services/auth

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

# Copy shared packages
COPY packages ./packages

# Copy service package.json
COPY services/auth/package*.json ./services/auth/

# Install only production dependencies
RUN pnpm install --filter @big-bus/auth-service... --prod

# Copy built application from build stage
COPY --from=build /app/services/auth/dist ./services/auth/dist

WORKDIR /app/services/auth

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3001

CMD ["node", "dist/main"]
