import { api } from './api.js';

interface QueuedItem {
  id: string;
  type: 'INCIDENT' | 'FLOOD' | 'ASSISTANCE' | 'SAFETY';
  payload: any;
  timestamp: string;
}

const STORAGE_KEY = 'namma_rescue_offline_queue_v1';

export class OfflineSyncManager {
  private queue: QueuedItem[] = [];
  private listeners: Set<(queueLength: number) => void> = new Set();

  constructor() {
    this.loadQueue();
    window.addEventListener('online', () => {
      console.log('🌐 Network restored, initiating auto-sync of queued reports...');
      this.syncAll();
    });
  }

  private loadQueue() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.queue = JSON.parse(saved);
      }
    } catch (e) {
      this.queue = [];
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save offline queue:', e);
    }
  }

  public enqueue(type: QueuedItem['type'], payload: any): string {
    const id = `offline-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.queue.push({
      id,
      type,
      payload,
      timestamp: new Date().toISOString()
    });
    this.saveQueue();
    return id;
  }

  public getPendingCount(): number {
    return this.queue.length;
  }

  public subscribe(cb: (queueLength: number) => void): () => void {
    this.listeners.add(cb);
    cb(this.queue.length);
    return () => this.listeners.delete(cb);
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => cb(this.queue.length));
  }

  public async syncAll(): Promise<{ synced: number; failed: number }> {
    if (!navigator.onLine || this.queue.length === 0) {
      return { synced: 0, failed: 0 };
    }

    let synced = 0;
    let failed = 0;
    const remaining: QueuedItem[] = [];

    for (const item of this.queue) {
      try {
        if (item.type === 'INCIDENT') {
          await api.createIncident(item.payload);
        } else if (item.type === 'FLOOD') {
          await api.createFloodReport(item.payload);
        } else if (item.type === 'ASSISTANCE') {
          await api.createAssistanceRequest(item.payload);
        } else if (item.type === 'SAFETY') {
          await api.submitSafetyCheckin(item.payload);
        }
        synced++;
      } catch (err) {
        console.error(`Failed to sync item ${item.id}:`, err);
        remaining.push(item);
        failed++;
      }
    }

    this.queue = remaining;
    this.saveQueue();
    return { synced, failed };
  }
}

export const offlineManager = new OfflineSyncManager();
