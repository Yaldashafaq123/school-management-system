// utils/performance.ts
import { Platform } from 'react-native';
import { reportError } from './errorHandler';

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private measurements: Map<string, number> = new Map();
  private thresholds: Map<string, number> = new Map();

  private constructor() {
    // Set default thresholds (in milliseconds)
    this.thresholds.set('screen_load', 1000);
    this.thresholds.set('api_call', 3000);
    this.thresholds.set('image_load', 500);
    this.thresholds.set('animation', 16); // 60fps
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMeasurement(key: string): void {
    this.measurements.set(key, Date.now());
  }

  endMeasurement(key: string): number {
    const startTime = this.measurements.get(key);
    if (!startTime) {
      console.warn(`No measurement started for key: ${key}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.measurements.delete(key);

    // Check threshold
    const threshold = this.thresholds.get(key);
    if (threshold && duration > threshold) {
      this.reportSlowPerformance(key, duration, threshold);
    }

    return duration;
  }

  private reportSlowPerformance(key: string, duration: number, threshold: number): void {
    const performanceData = {
      key,
      duration,
      threshold,
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
      memory: (performance as any).memory?.usedJSHeapSize,
    };

    console.warn(`Slow performance detected: ${key} took ${duration}ms (threshold: ${threshold}ms)`);
    
    // Report to analytics in production
    if (__DEV__) {
      reportError('slow_performance', performanceData);
    }
  }

  measureAsync<T>(key: string, promise: Promise<T>): Promise<T> {
    this.startMeasurement(key);
    return promise.finally(() => {
      this.endMeasurement(key);
    });
  }

  clearMeasurements(): void {
    this.measurements.clear();
  }
}

// Usage example
export const measurePerformance = async <T>(
  key: string,
  operation: () => Promise<T>
): Promise<T> => {
  const monitor = PerformanceMonitor.getInstance();
  return monitor.measureAsync(key, operation());
};