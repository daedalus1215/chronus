import { openDB, DBSchema, IDBPDatabase } from 'idb';

export type Note = {
  id: number;
  name: string;
  userId: string;
  isMemo: boolean;
  content?: string;
  createdAt: string;
  updatedAt: string;
};

interface NoteDBSchema extends DBSchema {
  notes: {
    key: number;
    value: Note;
    indexes: {
      'by-user': string;
      'by-updated': string;
    };
  };
  'pending-note-changes': {
    key: number;
    value: {
      type: 'create' | 'update' | 'delete';
      data: Partial<Note>;
      timestamp: number;
    };
  };
}

class NoteDB {
  private db: Promise<IDBPDatabase<NoteDBSchema>>;

  constructor() {
    this.db = openDB<NoteDBSchema>('chronus-notes-db', 1, {
      upgrade(db) {
        // Store for cached notes
        const noteStore = db.createObjectStore('notes', {
          keyPath: 'id',
        });
        noteStore.createIndex('by-user', 'userId');
        noteStore.createIndex('by-updated', 'updatedAt');

        // Store for pending changes when offline
        db.createObjectStore('pending-note-changes', {
          keyPath: 'id',
          autoIncrement: true,
        });
      },
    });
  }

  // Cache notes from server
  async cacheNotes(notes: Note[]) {
    const db = await this.db;
    const tx = db.transaction('notes', 'readwrite');
    await Promise.all([...notes.map(note => tx.store.put(note)), tx.done]);
  }

  // Get cached notes
  async getCachedNotes(userId: string): Promise<Note[]> {
    const db = await this.db;
    return db.getAllFromIndex('notes', 'by-user', userId);
  }

  // Add a new note while offline
  async addPendingNote(note: Partial<Note>) {
    const db = await this.db;
    return db.add('pending-note-changes', {
      type: 'create',
      data: note,
      timestamp: Date.now(),
    });
  }

  // Update a note while offline
  async addPendingUpdate(noteId: number, changes: Partial<Note>) {
    const db = await this.db;
    return db.add('pending-note-changes', {
      type: 'update',
      data: { id: noteId, ...changes },
      timestamp: Date.now(),
    });
  }

  // Get all pending changes
  async getPendingChanges() {
    const db = await this.db;
    return db.getAll('pending-note-changes');
  }

  // Remove a pending change after sync
  async removePendingChange(id: number) {
    const db = await this.db;
    return db.delete('pending-note-changes', id);
  }

  // Update a cached note
  async updateCachedNote(noteId: number, changes: Partial<Note>) {
    const db = await this.db;
    const note = await db.get('notes', noteId);
    if (note) {
      await db.put('notes', {
        ...note,
        ...changes,
        updatedAt: new Date().toISOString(),
      });
    }
  }
}

export const noteDB = new NoteDB();
