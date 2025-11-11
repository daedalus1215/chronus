export type StoragePort<T> = {
  create: (item: T) => Promise<T>;
  update: (id: number, item: Partial<T>) => Promise<T>;
  delete: (id: number) => Promise<void>;
  findById: (id: number) => Promise<T | null>;
  findAll: () => Promise<T[]>;
  query: (predicate: (item: T) => boolean) => Promise<T[]>;
};

export type SyncStatus = 'pending' | 'synced' | 'error';

export type WithSyncMetadata<T> = T & {
  _syncStatus: SyncStatus;
  _lastModified: number;
  _localId?: number;
}; 