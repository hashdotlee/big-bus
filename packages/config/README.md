# @big-bus/config

Configuration utilities package for Big Bus microservices.

## Features

- **Database Configuration**: PostgreSQL connection configuration with TypeORM support
- **Redis Configuration**: Redis connection configuration with retry logic
- **JWT Configuration**: JWT token configuration for authentication services
- **Message Queue Configuration**: RabbitMQ/AMQP configuration
- **App Configuration**: General application configuration
- **Environment Validation**: Joi-based environment variable validation
- **Config Loader**: Centralized configuration loading and validation

## Installation

```bash
npm install @big-bus/config
```

## Usage

### Database Configuration

```typescript
import { DatabaseConfig } from '@big-bus/config';

// Create TypeORM configuration
const dbConfig = DatabaseConfig.createTypeOrmConfig({
  database: 'my_database',
  entitiesPath: 'src/entities/**/*.entity.ts',
  migrationsPath: 'src/migrations/**/*.ts',
});

// Get connection string
const connectionString = DatabaseConfig.getConnectionString();

// Validate database configuration
DatabaseConfig.validateConfig();
```

### Redis Configuration

```typescript
import { RedisConfig } from '@big-bus/config';

// Create Redis configuration
const redisConfig = RedisConfig.createConfig({
  db: 1,
  keyPrefix: 'myapp:',
});

// Get connection string
const connectionString = RedisConfig.getConnectionString();
```

### JWT Configuration

```typescript
import { JwtConfig } from '@big-bus/config';

// Get JWT configuration
const jwtConfig = JwtConfig.getConfig();

// Get access token configuration for JWT module
const accessTokenConfig = JwtConfig.getAccessTokenConfig();

// Get refresh token configuration
const refreshTokenConfig = JwtConfig.getRefreshTokenConfig();
```

### App Configuration

```typescript
import { AppConfig } from '@big-bus/config';

// Get app configuration
const appConfig = AppConfig.getConfig();

// Check environment
if (AppConfig.isDevelopment()) {
  console.log('Running in development mode');
}
```

### Environment Validation

```typescript
import { EnvValidator } from '@big-bus/config';
import * as Joi from 'joi';

// Validate environment variables
const schema = Joi.object({
  API_KEY: Joi.string().required(),
  PORT: Joi.number().default(3000),
});

EnvValidator.validate({
  schema,
  envFilePath: '.env',
});

// Get environment variables with type checking
const apiKey = EnvValidator.getRequired('API_KEY');
const port = EnvValidator.getNumber('PORT', 3000);
const debug = EnvValidator.getBoolean('DEBUG', false);
```

### Config Loader

```typescript
import { ConfigLoader } from '@big-bus/config';

// Load and validate all configurations
ConfigLoader.loadAll({
  validateDatabase: true,
  validateRedis: true,
  validateApp: true,
  validateJwt: true,
});

// Get all configurations
const allConfigs = ConfigLoader.getAllConfigs();
```

## Environment Variables

### Database
- `DB_HOST`: Database host (default: localhost)
- `DB_PORT`: Database port (default: 5432)
- `DB_USERNAME`: Database username (default: postgres)
- `DB_PASSWORD`: Database password (default: postgres)
- `DB_DATABASE`: Database name (required)
- `DB_SSL`: Enable SSL (default: false)
- `DB_MAX_CONNECTIONS`: Maximum connections (default: 10)
- `DB_MIN_CONNECTIONS`: Minimum connections (default: 2)

### Redis
- `REDIS_HOST`: Redis host (default: localhost)
- `REDIS_PORT`: Redis port (default: 6379)
- `REDIS_PASSWORD`: Redis password (optional)
- `REDIS_DB`: Redis database number (default: 0)
- `REDIS_KEY_PREFIX`: Key prefix (optional)

### JWT
- `JWT_SECRET`: JWT secret (required)
- `JWT_EXPIRES_IN`: Access token expiration (default: 1h)
- `JWT_REFRESH_SECRET`: Refresh token secret (required)
- `JWT_REFRESH_EXPIRES_IN`: Refresh token expiration (default: 7d)

### App
- `NODE_ENV`: Environment (development/production/test/staging)
- `PORT`: Application port (default: 3000)
- `SERVICE_NAME`: Service name (required)
- `CORS_ORIGINS`: Allowed origins (default: *)

## License

MIT
