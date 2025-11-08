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
COPY services/vehicle/package*.json ./services/vehicle/
COPY services/vehicle/tsconfig*.json ./services/vehicle/
COPY services/vehicle/nest-cli.json ./services/vehicle/

# Install dependencies (without frozen-lockfile for development flexibility)
RUN pnpm install --filter @big-bus/vehicle-service...

# Copy source code
COPY services/vehicle/src ./services/vehicle/src

WORKDIR /app/services/vehicle

# Expose port
EXPOSE 3003

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
COPY services/vehicle ./services/vehicle

# Install dependencies
RUN pnpm install --filter @big-bus/vehicle-service...

WORKDIR /app/services/vehicle

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
COPY services/vehicle/package*.json ./services/vehicle/

# Install only production dependencies
RUN pnpm install --filter @big-bus/vehicle-service... --prod

# Copy built application from build stage
COPY --from=build /app/services/vehicle/dist ./services/vehicle/dist

WORKDIR /app/services/vehicle

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3003

CMD ["node", "dist/main"]
