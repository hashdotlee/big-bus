import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as Joi from 'joi';

export interface DatabaseConfigOptions {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database: string;
  entitiesPath?: string;
  migrationsPath?: string;
  synchronize?: boolean;
  logging?: boolean;
  ssl?: boolean;
  maxConnections?: number;
  minConnections?: number;
}

export const databaseConfigSchema = Joi.object({
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().default('postgres'),
  DB_PASSWORD: Joi.string().default('postgres'),
  DB_DATABASE: Joi.string().required(),
  DB_SSL: Joi.boolean().default(false),
  DB_MAX_CONNECTIONS: Joi.number().default(10),
  DB_MIN_CONNECTIONS: Joi.number().default(2),
  DB_SYNCHRONIZE: Joi.boolean().default(false),
  DB_LOGGING: Joi.boolean().default(false),
});

export class DatabaseConfig {
  static createTypeOrmConfig(options: DatabaseConfigOptions): TypeOrmModuleOptions {
    const {
      host = process.env.DB_HOST || 'localhost',
      port = parseInt(process.env.DB_PORT || '5432', 10),
      username = process.env.DB_USERNAME || 'postgres',
      password = process.env.DB_PASSWORD || 'postgres',
      database,
      entitiesPath,
      migrationsPath,
      synchronize = process.env.DB_SYNCHRONIZE === 'true' || process.env.NODE_ENV !== 'production',
      logging = process.env.DB_LOGGING === 'true' || process.env.NODE_ENV === 'development',
      ssl = process.env.DB_SSL === 'true',
      maxConnections = parseInt(process.env.DB_MAX_CONNECTIONS || '10', 10),
      minConnections = parseInt(process.env.DB_MIN_CONNECTIONS || '2', 10),
    } = options;

    const config: TypeOrmModuleOptions = {
      type: 'postgres',
      host,
      port,
      username,
      password,
      database: process.env.DB_DATABASE || database,
      synchronize,
      logging,
      ssl: ssl ? { rejectUnauthorized: false } : false,
      extra: {
        max: maxConnections,
        min: minConnections,
      },
      ...(entitiesPath && { entities: [entitiesPath] }),
      ...(migrationsPath && {
        migrations: [migrationsPath],
        migrationsRun: false,
      }),
    };

    return config;
  }

  static validateConfig() {
    const { error } = databaseConfigSchema.validate(process.env, {
      allowUnknown: true,
      abortEarly: false,
    });

    if (error) {
      throw new Error(`Database configuration validation failed: ${error.message}`);
    }
  }

  static getConnectionString(options?: Partial<DatabaseConfigOptions>): string {
    const host = options?.host || process.env.DB_HOST || 'localhost';
    const port = options?.port || parseInt(process.env.DB_PORT || '5432', 10);
    const username = options?.username || process.env.DB_USERNAME || 'postgres';
    const password = options?.password || process.env.DB_PASSWORD || 'postgres';
    const database = options?.database || process.env.DB_DATABASE || 'postgres';
    const ssl = options?.ssl || process.env.DB_SSL === 'true';

    return `postgresql://${username}:${password}@${host}:${port}/${database}${ssl ? '?sslmode=require' : ''}`;
  }
}
