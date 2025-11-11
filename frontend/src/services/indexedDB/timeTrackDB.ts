import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { CreateTimeTrackRequest } from '../../pages/HomePage/hooks/useCreateTimeTrack/createTimeTrack/types/createTimeTrackRequest';

//@TODO: Get this out of this `service` folder. 
interface TimeTrackDBSchema extends DBSchema {
  'pending-time-tracks': {
    key: number;
    value: {
      data: CreateTimeTrackRequest;
      createdAt: number;
    };
  };
}

const DB_NAME = 'chronus-offline-db';
const STORE_NAME = 'pending-time-tracks';

class TimeTrackDB {
  private db: Promise<IDBPDatabase<TimeTrackDBSchema>>;

  constructor() {
    this.db = openDB<TimeTrackDBSchema>(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
        }
      },
    });
  }

  async addPendingTimeTrack(data: CreateTimeTrackRequest) {
    const db = await this.db;
    return db.add(STORE_NAME, {
      data,
      createdAt: Date.now()
    });
  }

  async getPendingTimeTracks() {
    const db = await this.db;
    return db.getAll(STORE_NAME);
  }

  async removePendingTimeTrack(id: number) {
    const db = await this.db;
    return db.delete(STORE_NAME, id);
  }
}

export const timeTrackDB = new TimeTrackDB(); 