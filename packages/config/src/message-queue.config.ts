import * as Joi from 'joi';

export interface MessageQueueConfigOptions {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  vhost?: string;
  protocol?: string;
  heartbeat?: number;
  prefetchCount?: number;
}

export const messageQueueConfigSchema = Joi.object({
  MQ_HOST: Joi.string().default('localhost'),
  MQ_PORT: Joi.number().default(5672),
  MQ_USERNAME: Joi.string().default('guest'),
  MQ_PASSWORD: Joi.string().default('guest'),
  MQ_VHOST: Joi.string().default('/'),
  MQ_PROTOCOL: Joi.string().default('amqp'),
  MQ_HEARTBEAT: Joi.number().default(60),
  MQ_PREFETCH_COUNT: Joi.number().default(10),
});

export class MessageQueueConfig {
  static getConfig(): MessageQueueConfigOptions {
    return {
      host: process.env.MQ_HOST || 'localhost',
      port: parseInt(process.env.MQ_PORT || '5672', 10),
      username: process.env.MQ_USERNAME || 'guest',
      password: process.env.MQ_PASSWORD || 'guest',
      vhost: process.env.MQ_VHOST || '/',
      protocol: process.env.MQ_PROTOCOL || 'amqp',
      heartbeat: parseInt(process.env.MQ_HEARTBEAT || '60', 10),
      prefetchCount: parseInt(process.env.MQ_PREFETCH_COUNT || '10', 10),
    };
  }

  static validateConfig() {
    const { error } = messageQueueConfigSchema.validate(process.env, {
      allowUnknown: true,
      abortEarly: false,
    });

    if (error) {
      throw new Error(`Message Queue configuration validation failed: ${error.message}`);
    }
  }

  static getConnectionString(options?: Partial<MessageQueueConfigOptions>): string {
    const protocol = options?.protocol || process.env.MQ_PROTOCOL || 'amqp';
    const username = options?.username || process.env.MQ_USERNAME || 'guest';
    const password = options?.password || process.env.MQ_PASSWORD || 'guest';
    const host = options?.host || process.env.MQ_HOST || 'localhost';
    const port = options?.port || parseInt(process.env.MQ_PORT || '5672', 10);
    const vhost = options?.vhost || process.env.MQ_VHOST || '/';

    return `${protocol}://${username}:${password}@${host}:${port}${vhost}`;
  }

  static getRabbitMQOptions(options?: MessageQueueConfigOptions) {
    const config = options || this.getConfig();

    return {
      urls: [this.getConnectionString(config)],
      heartbeat: config.heartbeat,
      prefetchCount: config.prefetchCount,
    };
  }
}
