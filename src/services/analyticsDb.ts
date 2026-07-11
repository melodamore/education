import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';

export interface AnalyticsRecord {
  chapterId: string;
  totalAttempts: number;
  errorCount: number;
  timeSpentSeconds: number;
  lastAccessed: number; // timestamp
}

interface AnalyticsDB extends DBSchema {
  analytics: {
    key: string;
    value: AnalyticsRecord;
  };
}

const DB_NAME = 'ethiolearn_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<AnalyticsDB>> | null = null;

export const getDB = (): Promise<IDBPDatabase<AnalyticsDB>> => {
  if (!dbPromise) {
    dbPromise = openDB<AnalyticsDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('analytics')) {
          db.createObjectStore('analytics', { keyPath: 'chapterId' });
        }
      },
    });
  }
  return dbPromise;
};

export const updateAnalytics = async (
  chapterId: string,
  updates: Partial<Omit<AnalyticsRecord, 'chapterId'>>
): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction('analytics', 'readwrite');
  const store = tx.objectStore('analytics');

  let record = await store.get(chapterId);

  if (!record) {
    record = {
      chapterId,
      totalAttempts: 0,
      errorCount: 0,
      timeSpentSeconds: 0,
      lastAccessed: Date.now(),
    };
  }

  const updatedRecord = { ...record, ...updates, lastAccessed: Date.now() };
  await store.put(updatedRecord);
  await tx.done;
};

export const getAnalytics = async (chapterId: string): Promise<AnalyticsRecord | undefined> => {
  const db = await getDB();
  return db.get('analytics', chapterId);
};

export const getAllAnalytics = async (): Promise<AnalyticsRecord[]> => {
  const db = await getDB();
  return db.getAll('analytics');
};
