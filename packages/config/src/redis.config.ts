import * as Joi from 'joi';

export interface RedisConfigOptions {
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  retryAttempts?: number;
  retryDelay?: number;
  maxRetriesPerRequest?: number;
  enableReadyCheck?: boolean;
  enableOfflineQueue?: boolean;
}

export const redisConfigSchema = Joi.object({
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().optional().allow(''),
  REDIS_DB: Joi.number().default(0),
  REDIS_KEY_PREFIX: Joi.string().optional().allow(''),
  REDIS_RETRY_ATTEMPTS: Joi.number().default(3),
  REDIS_RETRY_DELAY: Joi.number().default(1000),
});

export class RedisConfig {
  static createConfig(options?: RedisConfigOptions) {
    const {
      host = process.env.REDIS_HOST || 'localhost',
      port = parseInt(process.env.REDIS_PORT || '6379', 10),
      password = process.env.REDIS_PASSWORD || undefined,
      db = parseInt(process.env.REDIS_DB || '0', 10),
      keyPrefix = process.env.REDIS_KEY_PREFIX || undefined,
      retryAttempts = parseInt(process.env.REDIS_RETRY_ATTEMPTS || '3', 10),
      retryDelay = parseInt(process.env.REDIS_RETRY_DELAY || '1000', 10),
      maxRetriesPerRequest = 3,
      enableReadyCheck = true,
      enableOfflineQueue = true,
    } = options || {};

    return {
      host,
      port,
      password: password || undefined,
      db,
      keyPrefix,
      retryStrategy: (times: number) => {
        if (times > retryAttempts) {
          return null;
        }
        return Math.min(times * retryDelay, 3000);
      },
      maxRetriesPerRequest,
      enableReadyCheck,
      enableOfflineQueue,
    };
  }

  static validateConfig() {
    const { error } = redisConfigSchema.validate(process.env, {
      allowUnknown: true,
      abortEarly: false,
    });

    if (error) {
      throw new Error(`Redis configuration validation failed: ${error.message}`);
    }
  }

  static getConnectionString(options?: Partial<RedisConfigOptions>): string {
    const host = options?.host || process.env.REDIS_HOST || 'localhost';
    const port = options?.port || parseInt(process.env.REDIS_PORT || '6379', 10);
    const password = options?.password || process.env.REDIS_PASSWORD;
    const db = options?.db || parseInt(process.env.REDIS_DB || '0', 10);

    if (password) {
      return `redis://:${password}@${host}:${port}/${db}`;
    }
    return `redis://${host}:${port}/${db}`;
  }
}
