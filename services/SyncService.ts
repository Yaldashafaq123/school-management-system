// services/SyncService.ts
import { offlineStorage } from './OfflineStorage';

interface CachedCourses {
  data: any;
  timestamp: number;
  [key: string]: any;
}

interface PendingSubmission {
  id: string | number;
  [key: string]: any;
}

export class SyncService {
  private static instance: SyncService;
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private syncInProgress: boolean = false;

  private constructor() {}

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  async syncAll(): Promise<void> {
    if (this.syncInProgress || !offlineStorage.isOnline()) {
      return;
    }

    this.syncInProgress = true;
    try {
      // Process offline queue
      await offlineStorage.processQueue();

      // Sync user progress
      await this.syncProgress();

      // Sync course data
      await this.syncCourseData();

      // Sync assignments
      await this.syncAssignments();

      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncProgress(): Promise<void> {
    const localProgress = await offlineStorage.get('user_progress');
    if (localProgress) {
      // Upload progress to server
      console.log('Syncing progress...');
      // await api.updateProgress(localProgress);
      
      // Clear local cache after successful sync
      await offlineStorage.remove('user_progress');
    }
  }

  private async syncCourseData(): Promise<void> {
    const cachedCourses = await offlineStorage.get<CachedCourses>('cached_courses');
    if (cachedCourses && cachedCourses.timestamp) {
      // Check if cache is stale
      const cacheAge = Date.now() - cachedCourses.timestamp;
      if (cacheAge > 3600000) { // 1 hour
        console.log('Refreshing cached courses...');
        // await api.refreshCourses();
      }
    }
  }

  private async syncAssignments(): Promise<void> {
    const pendingSubmissions = await offlineStorage.get<PendingSubmission[]>('pending_submissions');
    if (pendingSubmissions && Array.isArray(pendingSubmissions)) {
      console.log(`Syncing ${pendingSubmissions.length} pending submissions...`);
      
      for (const submission of pendingSubmissions) {
        try {
          // await api.submitAssignment(submission);
          console.log('Submission synced:', submission.id);
        } catch (error) {
          console.error('Failed to sync submission:', error);
        }
      }
      
      // Clear after successful sync
      await offlineStorage.remove('pending_submissions');
    }
  }

  startAutoSync(interval: number = 300000): void { // 5 minutes
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      if (offlineStorage.isOnline()) {
        await this.syncAll();
      }
    }, interval);
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async forceSync(): Promise<void> {
    await this.syncAll();
  }

  async saveProgressLocally(progress: any): Promise<void> {
    await offlineStorage.set('user_progress', progress);
    
    // Add to offline queue for later sync
    await offlineStorage.addToQueue({
      id: `progress_${Date.now()}`,
      type: 'UPDATE_PROGRESS',
      payload: progress,
      timestamp: Date.now(),
    });
  }

  async saveSubmissionLocally(submission: PendingSubmission): Promise<void> {
    const pendingSubmissions = await offlineStorage.get<PendingSubmission[]>('pending_submissions') || [];
    pendingSubmissions.push(submission);
    await offlineStorage.set('pending_submissions', pendingSubmissions);
    
    await offlineStorage.addToQueue({
      id: `submission_${submission.id}`,
      type: 'SUBMIT_ASSIGNMENT',
      payload: submission,
      timestamp: Date.now(),
    });
  }
}

export const syncService = SyncService.getInstance();