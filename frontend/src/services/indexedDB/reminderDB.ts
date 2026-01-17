import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { EventReminderResponseDto } from '../../api/dtos/calendar-events.dtos';
import { CreateEventReminderRequest } from '../../api/dtos/calendar-events.dtos';

interface ReminderDBSchema extends DBSchema {
  'pending-reminders': {
    key: number;
    value: {
      eventId: number;
      data: CreateEventReminderRequest;
      createdAt: number;
    };
  };
  'reminders': {
    key: number;
    value: {
      eventId: number;
      reminder: EventReminderResponseDto;
      updatedAt: number;
    };
  };
}

const DB_NAME = 'chronus-offline-db';
const PENDING_STORE = 'pending-reminders';
const REMINDERS_STORE = 'reminders';

class ReminderDB {
  private db: Promise<IDBPDatabase<ReminderDBSchema>>;

  constructor() {
    this.db = openDB<ReminderDBSchema>(DB_NAME, 2, {
      upgrade(db, oldVersion) {
        // Create pending reminders store
        if (!db.objectStoreNames.contains(PENDING_STORE)) {
          db.createObjectStore(PENDING_STORE, {
            keyPath: 'id',
            autoIncrement: true,
          });
        }

        // Create reminders store (for offline access)
        if (!db.objectStoreNames.contains(REMINDERS_STORE)) {
          const store = db.createObjectStore(REMINDERS_STORE, {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('eventId', 'eventId', { unique: false });
        }
      },
    });
  }

  /**
   * Add a pending reminder to sync when online.
   */
  async addPendingReminder(
    eventId: number,
    data: CreateEventReminderRequest
  ): Promise<number> {
    const db = await this.db;
    return db.add(PENDING_STORE, {
      eventId,
      data,
      createdAt: Date.now(),
    });
  }

  /**
   * Get all pending reminders.
   */
  async getPendingReminders() {
    const db = await this.db;
    return db.getAll(PENDING_STORE);
  }

  /**
   * Remove a pending reminder.
   */
  async removePendingReminder(id: number): Promise<void> {
    const db = await this.db;
    return db.delete(PENDING_STORE, id);
  }

  /**
   * Store a reminder locally for offline access.
   */
  async storeReminder(
    eventId: number,
    reminder: EventReminderResponseDto
  ): Promise<number> {
    const db = await this.db;
    return db.add(REMINDERS_STORE, {
      eventId,
      reminder,
      updatedAt: Date.now(),
    });
  }

  /**
   * Get reminders for an event.
   */
  async getRemindersForEvent(
    eventId: number
  ): Promise<EventReminderResponseDto[]> {
    const db = await this.db;
    const records = await db.getAllFromIndex(REMINDERS_STORE, 'eventId', eventId);
    return records.map(record => record.reminder);
  }

  /**
   * Remove a reminder.
   */
  async removeReminder(id: number): Promise<void> {
    const db = await this.db;
    return db.delete(REMINDERS_STORE, id);
  }

  /**
   * Remove all reminders for an event.
   */
  async removeRemindersForEvent(eventId: number): Promise<void> {
    const db = await this.db;
    const tx = db.transaction(REMINDERS_STORE, 'readwrite');
    const store = tx.objectStore(REMINDERS_STORE);
    const index = store.index('eventId');
    const records = await index.getAll(eventId);
    
    await Promise.all(records.map(record => store.delete(record.id)));
    await tx.done;
  }

  /**
   * Get all stored reminders.
   */
  async getAllReminders(): Promise<Array<{ eventId: number; reminder: EventReminderResponseDto }>> {
    const db = await this.db;
    return db.getAll(REMINDERS_STORE);
  }
}

export const reminderDB = new ReminderDB();
