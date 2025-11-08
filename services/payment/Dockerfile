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
COPY services/payment/package*.json ./services/payment/
COPY services/payment/tsconfig*.json ./services/payment/
COPY services/payment/nest-cli.json ./services/payment/

# Install dependencies (without frozen-lockfile for development flexibility)
RUN pnpm install --filter @big-bus/payment-service...

# Copy source code
COPY services/payment/src ./services/payment/src

WORKDIR /app/services/payment

# Expose port
EXPOSE 3004

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
COPY services/payment ./services/payment

# Install dependencies
RUN pnpm install --filter @big-bus/payment-service...

WORKDIR /app/services/payment

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
COPY services/payment/package*.json ./services/payment/

# Install only production dependencies
RUN pnpm install --filter @big-bus/payment-service... --prod

# Copy built application from build stage
COPY --from=build /app/services/payment/dist ./services/payment/dist

WORKDIR /app/services/payment

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3004

CMD ["node", "dist/main"]
