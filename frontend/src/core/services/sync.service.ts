import { StoragePort, WithSyncMetadata } from '../ports/storage.port';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useCallback } from 'react';

export type SyncConfig<T> = {
  localStore: StoragePort<WithSyncMetadata<T>>;
  remoteStore: StoragePort<T>;
  entityName: string;
};

export const useSyncService = <T extends { id?: number }>(config: SyncConfig<T>) => {
  const isOnline = useOnlineStatus();

  const sync = useCallback(async (): Promise<void> => {
    const pendingItems = await config.localStore.query(
      item => item._syncStatus === 'pending'
    );

    for (const item of pendingItems) {
      try {
        if (item.id) {
          await config.remoteStore.update(item.id, item);
        } else {
          const created = await config.remoteStore.create(item);
          await config.localStore.update(item._localId!, {
            ...created,
            _syncStatus: 'synced',
            _lastModified: Date.now()
          } as WithSyncMetadata<T>);
        }
      } catch (error) {
        console.error(`Failed to sync ${config.entityName}:`, error);
        await config.localStore.update(item._localId!, {
          ...item,
          _syncStatus: 'error'
        } as WithSyncMetadata<T>);
      }
    }
  }, [config]);

  const create = useCallback(async (item: T): Promise<WithSyncMetadata<T>> => {
    if (isOnline) {
      const remoteItem = await config.remoteStore.create(item);
      return config.localStore.create({
        ...remoteItem,
        _syncStatus: 'synced',
        _lastModified: Date.now()
      } as WithSyncMetadata<T>);
    }

    return config.localStore.create({
      ...item,
      _syncStatus: 'pending',
      _lastModified: Date.now()
    } as WithSyncMetadata<T>);
  }, [isOnline, config]);

  const update = useCallback(async (id: number, item: Partial<T>): Promise<WithSyncMetadata<T>> => {
    if (isOnline) {
      const remoteItem = await config.remoteStore.update(id, item);
      return config.localStore.update(id, {
        ...remoteItem,
        _syncStatus: 'synced',
        _lastModified: Date.now()
      } as WithSyncMetadata<T>);
    }

    return config.localStore.update(id, {
      ...item,
      _syncStatus: 'pending',
      _lastModified: Date.now()
    } as WithSyncMetadata<T>);
  }, [isOnline, config]);

  const remove = useCallback(async (id: number): Promise<void> => {
    if (isOnline) {
      await config.remoteStore.delete(id);
    }
    await config.localStore.delete(id);
  }, [isOnline, config]);

  return {
    sync,
    create,
    update,
    delete: remove,
    isOnline
  };
}; 