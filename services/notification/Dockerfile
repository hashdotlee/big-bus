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
COPY services/notification/package*.json ./services/notification/
COPY services/notification/tsconfig*.json ./services/notification/
COPY services/notification/nest-cli.json ./services/notification/

# Install dependencies (without frozen-lockfile for development flexibility)
RUN pnpm install --filter @big-bus/notification-service...

# Copy source code
COPY services/notification/src ./services/notification/src

WORKDIR /app/services/notification

# Expose port
EXPOSE 3005

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
COPY services/notification ./services/notification

# Install dependencies
RUN pnpm install --filter @big-bus/notification-service...

WORKDIR /app/services/notification

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
COPY services/notification/package*.json ./services/notification/

# Install only production dependencies
RUN pnpm install --filter @big-bus/notification-service... --prod

# Copy built application from build stage
COPY --from=build /app/services/notification/dist ./services/notification/dist

# Copy email templates if they exist
COPY --from=build /app/services/notification/src/common/templates ./services/notification/src/common/templates 2>/dev/null || true

WORKDIR /app/services/notification

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3005

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3005/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/main"]
