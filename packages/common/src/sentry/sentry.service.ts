import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SentryService {
  constructor() {
    this.initSentry();
  }

  private initSentry() {
    const dsn = process.env.SENTRY_DSN;
    const environment = process.env.NODE_ENV || 'development';
    const serviceName = process.env.SERVICE_NAME || 'unknown-service';

    if (!dsn) {
      console.warn('Sentry DSN not configured. Error tracking disabled.');
      return;
    }

    Sentry.init({
      dsn,
      environment,
      integrations: [
        nodeProfilingIntegration(),
      ],
      // Performance Monitoring
      tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
      // Profiling
      profilesSampleRate: environment === 'production' ? 0.1 : 1.0,
      // Release tracking
      release: process.env.APP_VERSION || 'unknown',
      // Service identification
      serverName: serviceName,
      // Additional options
      beforeSend(event) {
        // Filter out sensitive data
        if (event.request?.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
        }
        return event;
      },
    });

    console.log(`Sentry initialized for ${serviceName} in ${environment} environment`);
  }

  captureException(exception: any, context?: string) {
    Sentry.captureException(exception, {
      tags: { context },
    });
  }

  captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
    Sentry.captureMessage(message, level);
  }

  setUser(user: { id: string; email?: string; username?: string }) {
    Sentry.setUser(user);
  }

  setContext(name: string, context: Record<string, any>) {
    Sentry.setContext(name, context);
  }

  addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
    Sentry.addBreadcrumb(breadcrumb);
  }

  async flush(timeout = 2000): Promise<boolean> {
    return Sentry.flush(timeout);
  }
}
