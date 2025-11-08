import * as Joi from 'joi';
import { EnvValidator } from './env-validator';
import { DatabaseConfig, databaseConfigSchema } from './database.config';
import { RedisConfig, redisConfigSchema } from './redis.config';
import { AppConfig, appConfigSchema } from './app.config';
import { JwtConfig, jwtConfigSchema } from './jwt.config';
import { MessageQueueConfig, messageQueueConfigSchema } from './message-queue.config';

export interface ConfigLoaderOptions {
  validateDatabase?: boolean;
  validateRedis?: boolean;
  validateApp?: boolean;
  validateJwt?: boolean;
  validateMessageQueue?: boolean;
  customSchema?: Joi.ObjectSchema;
  envFilePath?: string;
}

export class ConfigLoader {
  /**
   * Load and validate all configurations
   */
  static loadAll(options: ConfigLoaderOptions = {}): void {
    const {
      validateDatabase = false,
      validateRedis = false,
      validateApp = true,
      validateJwt = false,
      validateMessageQueue = false,
      customSchema,
      envFilePath,
    } = options;

    // Load environment variables
    if (envFilePath) {
      EnvValidator.loadEnvFile(envFilePath);
    }

    // Build combined schema
    let combinedSchema = Joi.object();

    if (validateApp) {
      combinedSchema = combinedSchema.concat(appConfigSchema);
    }

    if (validateDatabase) {
      combinedSchema = combinedSchema.concat(databaseConfigSchema);
    }

    if (validateRedis) {
      combinedSchema = combinedSchema.concat(redisConfigSchema);
    }

    if (validateJwt) {
      combinedSchema = combinedSchema.concat(jwtConfigSchema);
    }

    if (validateMessageQueue) {
      combinedSchema = combinedSchema.concat(messageQueueConfigSchema);
    }

    if (customSchema) {
      combinedSchema = combinedSchema.concat(customSchema);
    }

    // Validate all configurations
    EnvValidator.validate({
      schema: combinedSchema,
      throwOnError: true,
    });
  }

  /**
   * Get all configurations as an object
   */
  static getAllConfigs() {
    return {
      app: AppConfig.getConfig(),
      database: {
        connectionString: DatabaseConfig.getConnectionString(),
      },
      redis: RedisConfig.createConfig(),
      jwt: JwtConfig.getConfig(),
      messageQueue: MessageQueueConfig.getConfig(),
    };
  }

  /**
   * Validate specific configuration
   */
  static validateConfig(type: 'app' | 'database' | 'redis' | 'jwt' | 'messageQueue'): void {
    switch (type) {
      case 'app':
        AppConfig.validateConfig();
        break;
      case 'database':
        DatabaseConfig.validateConfig();
        break;
      case 'redis':
        RedisConfig.validateConfig();
        break;
      case 'jwt':
        JwtConfig.validateConfig();
        break;
      case 'messageQueue':
        MessageQueueConfig.validateConfig();
        break;
      default:
        throw new Error(`Unknown config type: ${type}`);
    }
  }
}
