const isDevelopment = process.env.NODE_ENV === 'development';
const isClient = typeof window !== 'undefined';

// Client-side logger - only logs in development
export const clientLogger = {
  log: (...args: unknown[]) => {
    if (isDevelopment && isClient) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDevelopment && isClient) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    if (isDevelopment && isClient) {
      console.error(...args);
    }
  },
  info: (...args: unknown[]) => {
    if (isDevelopment && isClient) {
      console.info(...args);
    }
  },
  debug: (...args: unknown[]) => {
    if (isDevelopment && isClient) {
      console.debug(...args);
    }
  }
};

// Server-side logger - always logs (both development and production)
export const serverLogger = {
  log: (...args: unknown[]) => {
    if (!isClient) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (!isClient) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    if (!isClient) {
      console.error(...args);
    }
  },
  info: (...args: unknown[]) => {
    if (!isClient) {
      console.info(...args);
    }
  },
  debug: (...args: unknown[]) => {
    if (!isClient) {
      console.debug(...args);
    }
  }
};

// Default logger (backwards compatibility) - client-side only in dev
export const logger = clientLogger; 
