type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  requestId?: string;
  organizationId?: string;
  userId?: string;
  [key: string]: unknown;
}

interface LogEntry extends LogContext {
  timestamp: string;
  level: LogLevel;
  message: string;
}

class StructuredLogger {
  private baseContext: LogContext = {};

  setContext(context: LogContext) {
    this.baseContext = { ...this.baseContext, ...context };
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.baseContext,
      ...context,
    };

    // Prevent logging sensitive fields if they sneak into context
    const sanitize = (key: string, value: unknown) => {
      const sensitiveKeys = ['password', 'token', 'secret', 'key', 'credentials', 'cookie', 'session'];
      if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
        return '[REDACTED]';
      }
      return value;
    };

    const sanitizedEntry = JSON.parse(JSON.stringify(entry, sanitize));

    switch (level) {
      case 'debug':
        console.debug(JSON.stringify(sanitizedEntry));
        break;
      case 'info':
        console.info(JSON.stringify(sanitizedEntry));
        break;
      case 'warn':
        console.warn(JSON.stringify(sanitizedEntry));
        break;
      case 'error':
        console.error(JSON.stringify(sanitizedEntry));
        break;
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext) {
    this.log('error', message, context);
  }
}

export const logger = new StructuredLogger();
