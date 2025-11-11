import { useMemo } from 'react';
import { RemoteStorageAdapter } from '../adapters/remote-storage.adapter';

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

  const createNote = async (note: Omit<Note, 'id' | 'userId'>): Promise<Note> => {
    return remoteStore.create({
      ...note,
      userId
    });
  };

  const updateNote = async (
    id: number,
    note: Partial<Omit<Note, 'id' | 'userId'>>
  ): Promise<Note> => {
    return remoteStore.update(id, note);
  };

  return {
    createNote,
    updateNote
  };
}; 