import * as Joi from 'joi';

export interface AppConfigOptions {
  port?: number;
  environment?: string;
  serviceName?: string;
  apiPrefix?: string;
  corsOrigins?: string[];
  rateLimit?: {
    ttl: number;
    limit: number;
  };
}

export const appConfigSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  PORT: Joi.number().default(3000),
  SERVICE_NAME: Joi.string().required(),
  API_PREFIX: Joi.string().default('api'),
  CORS_ORIGINS: Joi.string().default('*'),
  RATE_LIMIT_TTL: Joi.number().default(60),
  RATE_LIMIT_MAX: Joi.number().default(100),
});

export class AppConfig {
  static getConfig(): AppConfigOptions {
    return {
      port: parseInt(process.env.PORT || '3000', 10),
      environment: process.env.NODE_ENV || 'development',
      serviceName: process.env.SERVICE_NAME || 'big-bus-service',
      apiPrefix: process.env.API_PREFIX || 'api',
      corsOrigins: process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',')
        : ['*'],
      rateLimit: {
        ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
        limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
      },
    };
  }

  static validateConfig() {
    const { error } = appConfigSchema.validate(process.env, {
      allowUnknown: true,
      abortEarly: false,
    });

    if (error) {
      throw new Error(`App configuration validation failed: ${error.message}`);
    }
  }

  static isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  static isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  static isTest(): boolean {
    return process.env.NODE_ENV === 'test';
  }
}
