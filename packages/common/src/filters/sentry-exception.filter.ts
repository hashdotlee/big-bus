import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/node';

@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Only report 5xx errors to Sentry
    if (status >= 500) {
      Sentry.withScope((scope) => {
        scope.setSDKProcessingMetadata({
          request: {
            method: request.method,
            url: request.url,
            headers: request.headers,
          },
        });
        scope.setContext('request', {
          method: request.method,
          url: request.url,
          params: request.params,
          query: request.query,
          ip: request.ip,
        });
        if (request.user) {
          scope.setUser({
            id: (request.user as any).id,
            email: (request.user as any).email,
          });
        }
        Sentry.captureException(exception);
      });
    }

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: typeof message === 'string' ? message : (message as any).message,
    };

    response.status(status).json(errorResponse);
  }
}
