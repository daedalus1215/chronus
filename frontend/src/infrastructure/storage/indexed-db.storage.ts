import Dexie from 'dexie';
import { StoragePort, WithSyncMetadata } from '../../core/ports/storage.port';

export class IndexedDBStorage<T extends { id?: number }> implements StoragePort<
  WithSyncMetadata<T>
> {
  private db: Dexie;
  private table: Dexie.Table<WithSyncMetadata<T>, number>;

  constructor(dbName: string, tableName: string) {
    this.db = new Dexie(dbName);
    this.db.version(1).stores({
      [tableName]: '++id,_syncStatus,_lastModified',
    });
    this.table = this.db.table(tableName);
  }

  async create(item: T): Promise<WithSyncMetadata<T>> {
    const itemWithMetadata: WithSyncMetadata<T> = {
      ...item,
      _syncStatus: 'pending',
      _lastModified: Date.now(),
    };
    const id = await this.table.add(itemWithMetadata);
    return { ...itemWithMetadata, id };
  }

  async update(id: number, item: Partial<T>): Promise<WithSyncMetadata<T>> {
    const existing = await this.findById(id);
    if (!existing) throw new Error(`Item with id ${id} not found`);

    const updated: WithSyncMetadata<T> = {
      ...existing,
      ...item,
      _syncStatus: 'pending',
      _lastModified: Date.now(),
    };

    await this.table.update(id, updated);
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.table.delete(id);
  }

  async findById(id: number): Promise<WithSyncMetadata<T> | null> {
    return this.table.get(id) || null;
  }

  async findAll(): Promise<WithSyncMetadata<T>[]> {
    return this.table.toArray();
  }

  async query(
    predicate: (item: WithSyncMetadata<T>) => boolean
  ): Promise<WithSyncMetadata<T>[]> {
    const all = await this.findAll();
    return all.filter(predicate);
  }
}
