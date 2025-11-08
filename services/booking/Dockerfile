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
COPY services/booking/package*.json ./services/booking/
COPY services/booking/tsconfig*.json ./services/booking/
COPY services/booking/nest-cli.json ./services/booking/

# Install dependencies (without frozen-lockfile for development flexibility)
RUN pnpm install --filter @big-bus/booking-service...

# Copy source code
COPY services/booking/src ./services/booking/src

WORKDIR /app/services/booking

# Expose port
EXPOSE 3002

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
COPY services/booking ./services/booking

# Install dependencies
RUN pnpm install --filter @big-bus/booking-service...

WORKDIR /app/services/booking

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
COPY services/booking/package*.json ./services/booking/

# Install only production dependencies
RUN pnpm install --filter @big-bus/booking-service... --prod

# Copy built application from build stage
COPY --from=build /app/services/booking/dist ./services/booking/dist

WORKDIR /app/services/booking

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3002

CMD ["node", "dist/main"]
