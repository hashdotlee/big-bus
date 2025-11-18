import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;
  private context?: string;

  constructor() {
    this.logger = this.createLogger();
  }

  setContext(context: string) {
    this.context = context;
  }

  private createLogger(): winston.Logger {
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json(),
    );

    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, context, trace, ...meta }) => {
        const ctx = context ? `[${context}]` : '';
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
        return `${timestamp} ${level} ${ctx} ${message} ${metaStr}`;
      }),
    );

    const transports: winston.transport[] = [
      // Console transport
      new winston.transports.Console({
        format: consoleFormat,
      }),
    ];

    // Only add file transports if not in test environment
    if (process.env.NODE_ENV !== 'test') {
      // Error logs
      transports.push(
        new DailyRotateFile({
          dirname: 'logs',
          filename: 'error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          format: logFormat,
          maxSize: '20m',
          maxFiles: '14d',
          zippedArchive: true,
        }),
      );

      // Combined logs
      transports.push(
        new DailyRotateFile({
          dirname: 'logs',
          filename: 'combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          format: logFormat,
          maxSize: '20m',
          maxFiles: '14d',
          zippedArchive: true,
        }),
      );
    }

    return winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      transports,
      exceptionHandlers: [
        new winston.transports.File({ filename: 'logs/exceptions.log' }),
      ],
      rejectionHandlers: [
        new winston.transports.File({ filename: 'logs/rejections.log' }),
      ],
    });
  }

  log(message: any, context?: string) {
    this.logger.info(message, { context: context || this.context });
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(message, {
      context: context || this.context,
      trace,
    });
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, { context: context || this.context });
  }

  debug(message: any, context?: string) {
    this.logger.debug(message, { context: context || this.context });
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(message, { context: context || this.context });
  }

  // Additional production-grade methods
  info(message: any, meta?: any, context?: string) {
    this.logger.info(message, { ...meta, context: context || this.context });
  }

  http(message: any, meta?: any, context?: string) {
    this.logger.http(message, { ...meta, context: context || this.context });
  }

  // Structured logging methods
  logRequest(req: any, context?: string) {
    this.logger.info('Incoming request', {
      context: context || this.context,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  }

  logResponse(req: any, res: any, responseTime: number, context?: string) {
    this.logger.info('Outgoing response', {
      context: context || this.context,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
    });
  }

  logError(error: Error, context?: string) {
    this.logger.error('Error occurred', {
      context: context || this.context,
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
  }

  logMetric(metric: string, value: number, unit?: string, context?: string) {
    this.logger.info('Metric', {
      context: context || this.context,
      metric,
      value,
      unit,
    });
  }
}
