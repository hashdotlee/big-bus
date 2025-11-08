# Multi-stage build for optimized production image

# Development stage
FROM node:18-alpine AS development

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY src ./src

# Expose port
EXPOSE 3003

# Development command will be provided by docker-compose
CMD ["pnpm", "run", "start:dev"]

# Build stage
FROM node:18-alpine AS build

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml* ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

RUN pnpm install --frozen-lockfile

COPY src ./src

RUN pnpm run build

# Production stage
FROM node:18-alpine AS production

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod && pnpm store prune

# Copy built application from build stage
COPY --from=build /app/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

USER nestjs

EXPOSE 3003

CMD ["node", "dist/main"]
