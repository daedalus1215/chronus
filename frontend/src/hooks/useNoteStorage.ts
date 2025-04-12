import { useMemo } from 'react';
import { IndexedDBStorage } from '../infrastructure/storage/indexed-db.storage';
import { RemoteStorageAdapter } from '../adapters/remote-storage.adapter';
import { useSyncService } from '../core/services/sync.service';
import { WithSyncMetadata } from '../core/ports/storage.port';

export type Note = {
  id?: number;
  name: string;
  userId: string;
  memo?: {
    id?: number;
    description: string;
  };
  tags?: Array<{
    id: string;
    name: string;
  }>;
};

export const useNoteStorage = (userId: string) => {
  const localStore = useMemo(
    () => new IndexedDBStorage<Note>('chronus-db', 'notes'),
    []
  );

  const remoteStore = useMemo(
    () =>
      new RemoteStorageAdapter<Note>({
        baseUrl: '/api',
        endpoint: 'notes',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }),
    []
  );

  const syncService = useSyncService<Note>({
    localStore,
    remoteStore,
    entityName: 'notes'
  });

  const createNote = async (note: Omit<Note, 'id' | 'userId'>): Promise<WithSyncMetadata<Note>> => {
    return syncService.create({
      ...note,
      userId
    });
  };

  const updateNote = async (
    id: number,
    note: Partial<Omit<Note, 'id' | 'userId'>>
  ): Promise<WithSyncMetadata<Note>> => {
    return syncService.update(id, note);
  };

  return {
    ...syncService,
    createNote,
    updateNote
  };
}; 