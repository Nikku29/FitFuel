
import * as Sentry from "@sentry/react";

export const initSentry = () => {
  Sentry.init({
    dsn: "https://your-dsn-here.ingest.sentry.io/project-id", // Replace with your actual DSN
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
};

export const logError = (error: Error, context?: any) => {
  console.error('Error logged to Sentry:', error);
  Sentry.captureException(error, {
    extra: context,
  });
};

export const logEvent = (eventName: string, data?: any) => {
  Sentry.addBreadcrumb({
    message: eventName,
    data,
    level: 'info',
  });
};
