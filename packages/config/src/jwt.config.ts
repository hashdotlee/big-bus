import * as Joi from 'joi';

export interface JwtConfigOptions {
  secret?: string;
  expiresIn?: string;
  refreshSecret?: string;
  refreshExpiresIn?: string;
  algorithm?: string;
  issuer?: string;
}

export const jwtConfigSchema = Joi.object({
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  JWT_ALGORITHM: Joi.string().default('HS256'),
  JWT_ISSUER: Joi.string().default('big-bus'),
});

export class JwtConfig {
  static getConfig(): JwtConfigOptions {
    return {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      refreshSecret: process.env.JWT_REFRESH_SECRET,
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      algorithm: process.env.JWT_ALGORITHM || 'HS256',
      issuer: process.env.JWT_ISSUER || 'big-bus',
    };
  }

  static validateConfig() {
    const { error } = jwtConfigSchema.validate(process.env, {
      allowUnknown: true,
      abortEarly: false,
    });

    if (error) {
      throw new Error(`JWT configuration validation failed: ${error.message}`);
    }
  }

  static getAccessTokenConfig() {
    return {
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        algorithm: process.env.JWT_ALGORITHM || 'HS256',
        issuer: process.env.JWT_ISSUER || 'big-bus',
      },
    };
  }

  static getRefreshTokenConfig() {
    return {
      secret: process.env.JWT_REFRESH_SECRET,
      signOptions: {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        algorithm: process.env.JWT_ALGORITHM || 'HS256',
        issuer: process.env.JWT_ISSUER || 'big-bus',
      },
    };
  }
}
