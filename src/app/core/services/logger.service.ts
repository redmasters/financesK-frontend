import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private readonly logLevel: LogLevel;
  private readonly enabledInProduction = false;

  constructor() {
    // Set log level based on environment
    this.logLevel = environment.production
      ? LogLevel.ERROR
      : LogLevel.DEBUG;
  }

  private shouldLog(level: LogLevel): boolean {
    // Don't log in production unless explicitly enabled
    if (environment.production && !this.enabledInProduction) {
      return level <= LogLevel.ERROR;
    }

    return level <= this.logLevel;
  }

  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = { ...data };

    // Remove or mask sensitive fields
    const sensitiveFields = ['token', 'password', 'email'];

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        if (field === 'token' && typeof sanitized[field] === 'string') {
          // Show only first 10 characters for tokens
          sanitized[field] = `${sanitized[field].substring(0, 10)}...`;
        } else if (field === 'email' && typeof sanitized[field] === 'string') {
          // Mask email but keep domain visible
          const emailParts = sanitized[field].split('@');
          if (emailParts.length === 2) {
            const maskedUser = emailParts[0].substring(0, 2) + '***';
            sanitized[field] = `${maskedUser}@${emailParts[1]}`;
          }
        } else {
          sanitized[field] = '[REDACTED]';
        }
      }
    });

    return sanitized;
  }

  error(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const sanitizedData = data ? this.sanitizeData(data) : undefined;
      console.error(`[AUTH-ERROR] ${message}`, sanitizedData);
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const sanitizedData = data ? this.sanitizeData(data) : undefined;
      console.warn(`[AUTH-WARN] ${message}`, sanitizedData);
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const sanitizedData = data ? this.sanitizeData(data) : undefined;
      console.info(`[AUTH-INFO] ${message}`, sanitizedData);
    }
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const sanitizedData = data ? this.sanitizeData(data) : undefined;
      console.log(`[AUTH-DEBUG] ${message}`, sanitizedData);
    }
  }

  // Authentication specific logging methods
  logAuthAttempt(username: string): void {
    this.info('Authentication attempt', { username });
  }

  logAuthSuccess(username: string): void {
    this.info('Authentication successful', { username });
  }

  logAuthFailure(username: string, error?: any): void {
    this.warn('Authentication failed', { username, error: error?.message || 'Unknown error' });
  }

  logRegistrationAttempt(username: string): void {
    this.info('Registration attempt', { username });
  }

  logRegistrationSuccess(username: string): void {
    this.info('Registration successful', { username });
  }

  logTokenValidation(isValid: boolean): void {
    this.debug('Token validation', { isValid });
  }

  logLogout(): void {
    this.info('User logout completed');
  }
}
