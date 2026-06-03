// utils/errorHandler.ts
import { Platform } from 'react-native';
import { offlineStorage } from '../services/OfflineStorage';

export interface ErrorDetails {
  error: string;
  message?: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  platform: string;
  version?: string;
  userId?: string;
  context?: Record<string, any>;
  [key: string]: any; // Allow additional properties
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorQueue: ErrorDetails[] = [];
  private isSending: boolean = false;
  private maxRetries = 3;

  private constructor() {
    this.loadErrorQueue();
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  private async loadErrorQueue(): Promise<void> {
    const savedQueue = await offlineStorage.get<ErrorDetails[]>('error_queue');
    if (savedQueue) {
      this.errorQueue = savedQueue;
    }
  }

  private async saveErrorQueue(): Promise<void> {
    await offlineStorage.set('error_queue', this.errorQueue);
  }

  async reportError(errorType: string, details: Partial<ErrorDetails>): Promise<void> {
    const errorDetails: ErrorDetails = {
      error: errorType,
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      version: '1.0.0', // Get from app config
      ...details,
    };

    // Add to queue
    this.errorQueue.push(errorDetails);
    await this.saveErrorQueue();

    // Try to send immediately if online
    await this.sendErrors();
  }

  private async sendErrors(retryCount = 0): Promise<void> {
    if (this.isSending || this.errorQueue.length === 0) {
      return;
    }

    this.isSending = true;

    try {
      const errorsToSend = [...this.errorQueue];
      this.errorQueue = [];

      // In production, send to your error tracking service
      if (__DEV__) {
        console.log('Sending errors:', errorsToSend);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        // await yourErrorTrackingService.send(errorsToSend);
      }

      console.log(`Successfully sent ${errorsToSend.length} errors`);
    } catch (error) {
      console.error('Failed to send errors:', error);
      
      // Restore errors to queue
      this.errorQueue = [...this.errorQueue];
      await this.saveErrorQueue();

      // Retry logic
      if (retryCount < this.maxRetries) {
        setTimeout(() => {
          this.sendErrors(retryCount + 1);
        }, Math.pow(2, retryCount) * 1000); // Exponential backoff
      }
    } finally {
      this.isSending = false;
    }
  }

  clearErrors(): void {
    this.errorQueue = [];
    this.saveErrorQueue();
  }

  getErrorCount(): number {
    return this.errorQueue.length;
  }
}

export const reportError = (errorType: string, details: Partial<ErrorDetails> = {}) => {
  const handler = ErrorHandler.getInstance();
  return handler.reportError(errorType, details);
};

// Global error handler for uncaught errors
export const setupGlobalErrorHandler = (): void => {
  const originalErrorHandler = ErrorUtils.getGlobalHandler();

  ErrorUtils.setGlobalHandler((error, isFatal) => {
    // Report the error
    reportError('global_uncaught', {
      error: error.toString(),
      stack: error.stack,
      message: error.message,
      context: { isFatal: isFatal?.toString() }, // Put isFatal in context
    });

    // Call original handler
    if (originalErrorHandler) {
      originalErrorHandler(error, isFatal);
    }

    // For fatal errors, you might want to show an error screen
    if (isFatal) {
      // Navigate to error screen or show alert
      console.error('Fatal error occurred:', error);
    }
  });
};