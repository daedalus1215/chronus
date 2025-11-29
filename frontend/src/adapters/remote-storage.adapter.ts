import { StoragePort } from '../core/ports/storage.port';

export type RemoteStorageConfig = {
  baseUrl: string;
  endpoint: string;
  headers?: Record<string, string>;
};

export class RemoteStorageAdapter<
  T extends { id?: number },
> implements StoragePort<T> {
  private config: RemoteStorageConfig;

  constructor(config: RemoteStorageConfig) {
    this.config = config;
  }

  private getUrl(id?: number): string {
    const base = `${this.config.baseUrl}/${this.config.endpoint}`;
    return id ? `${base}/${id}` : base;
  }

  private async request<R>(
    method: string,
    url: string,
    body?: unknown
  ): Promise<R> {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async create(item: T): Promise<T> {
    return this.request<T>('POST', this.getUrl(), item);
  }

  async update(id: number, item: Partial<T>): Promise<T> {
    return this.request<T>('PATCH', this.getUrl(id), item);
  }

  async delete(id: number): Promise<void> {
    await this.request<void>('DELETE', this.getUrl(id));
  }

  async findById(id: number): Promise<T | null> {
    try {
      return await this.request<T>('GET', this.getUrl(id));
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async findAll(): Promise<T[]> {
    return this.request<T[]>('GET', this.getUrl());
  }

  async query(predicate: (item: T) => boolean): Promise<T[]> {
    const items = await this.findAll();
    return items.filter(predicate);
  }
}
