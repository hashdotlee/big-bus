import * as Joi from 'joi';
import * as dotenv from 'dotenv';
import * as path from 'path';

export interface EnvValidatorOptions {
  schema: Joi.ObjectSchema;
  envFilePath?: string;
  throwOnError?: boolean;
}

export class EnvValidator {
  /**
   * Load environment variables from .env file
   */
  static loadEnvFile(filePath?: string): void {
    const envPath = filePath || path.resolve(process.cwd(), '.env');
    dotenv.config({ path: envPath });
  }

  /**
   * Validate environment variables against a Joi schema
   */
  static validate(options: EnvValidatorOptions): { [key: string]: any } {
    const { schema, envFilePath, throwOnError = true } = options;

    // Load .env file if path is provided
    if (envFilePath) {
      this.loadEnvFile(envFilePath);
    }

    // Validate environment variables
    const { error, value } = schema.validate(process.env, {
      allowUnknown: true,
      abortEarly: false,
    });

    if (error) {
      const errorMessage = `Environment validation failed:\n${error.details
        .map((detail) => `  - ${detail.message}`)
        .join('\n')}`;

      if (throwOnError) {
        throw new Error(errorMessage);
      } else {
        console.error(errorMessage);
      }
    }

    return value;
  }

  /**
   * Get required environment variable with type checking
   */
  static getRequired(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return value;
  }

  /**
   * Get optional environment variable with default value
   */
  static get(key: string, defaultValue?: string): string | undefined {
    return process.env[key] || defaultValue;
  }

  /**
   * Get environment variable as number
   */
  static getNumber(key: string, defaultValue?: number): number | undefined {
    const value = process.env[key];
    if (!value) {
      return defaultValue;
    }
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new Error(`Environment variable ${key} is not a valid number`);
    }
    return parsed;
  }

  /**
   * Get environment variable as boolean
   */
  static getBoolean(key: string, defaultValue?: boolean): boolean | undefined {
    const value = process.env[key];
    if (!value) {
      return defaultValue;
    }
    return value.toLowerCase() === 'true' || value === '1';
  }

  /**
   * Get environment variable as array (comma-separated)
   */
  static getArray(key: string, defaultValue?: string[]): string[] | undefined {
    const value = process.env[key];
    if (!value) {
      return defaultValue;
    }
    return value.split(',').map((item) => item.trim());
  }

  /**
   * Check if all required environment variables are set
   */
  static checkRequired(keys: string[]): void {
    const missing = keys.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}`
      );
    }
  }
}
