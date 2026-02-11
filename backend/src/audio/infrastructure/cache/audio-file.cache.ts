import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface CachedAudioEntry {
  filePath: string;
  fileName: string;
  fileSize: number;
  format: string;
  cachedAt: number;
  lastAccessed: number;
  audioId: number;
}

@Injectable()
export class AudioFileCache implements OnModuleInit {
  private readonly logger = new Logger(AudioFileCache.name);
  private readonly cacheDir: string;
  private readonly maxCacheSizeBytes: number = 100 * 1024 * 1024; // 100MB
  private readonly cacheTtlMs: number = 24 * 60 * 60 * 1000; // 24 hours
  private cache: Map<number, CachedAudioEntry> = new Map();

  constructor() {
    // Use OS temp directory for cache (works on both mobile and desktop)
    this.cacheDir = path.join(os.tmpdir(), 'chronus-audio-cache');
  }

  async onModuleInit(): Promise<void> {
    // Ensure cache directory exists
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
      this.logger.log(`Created audio cache directory: ${this.cacheDir}`);
    }

    // Load existing cache entries on startup
    await this.loadExistingCache();

    // Start cleanup interval (every hour)
    setInterval(() => this.cleanup(), 60 * 60 * 1000);
  }

  private async loadExistingCache(): Promise<void> {
    try {
      const files = fs.readdirSync(this.cacheDir);
      for (const file of files) {
        const filePath = path.join(this.cacheDir, file);
        const stats = fs.statSync(filePath);

        if (stats.isFile()) {
          // Extract audioId from filename (format: {audioId}.{ext})
          const match = file.match(/^(\d+)\.(.+)$/);
          if (match) {
            const audioId = parseInt(match[1], 10);
            const format = match[2];
            const entry: CachedAudioEntry = {
              filePath,
              fileName: file,
              fileSize: stats.size,
              format,
              cachedAt: stats.mtimeMs,
              lastAccessed: stats.atimeMs,
              audioId,
            };
            this.cache.set(audioId, entry);
          }
        }
      }
      this.logger.log(`Loaded ${this.cache.size} cached audio files`);
    } catch (error) {
      this.logger.error('Failed to load existing cache', error);
    }
  }

  getCachePath(audioId: number, format: string): string {
    return path.join(this.cacheDir, `${audioId}.${format}`);
  }

  isCached(audioId: number): boolean {
    const entry = this.cache.get(audioId);
    if (!entry) return false;

    // Check if file still exists and is not expired
    if (!fs.existsSync(entry.filePath)) {
      this.cache.delete(audioId);
      return false;
    }

    const age = Date.now() - entry.cachedAt;
    if (age > this.cacheTtlMs) {
      this.deleteEntry(audioId);
      return false;
    }

    return true;
  }

  getEntry(audioId: number): CachedAudioEntry | undefined {
    const entry = this.cache.get(audioId);
    if (entry) {
      entry.lastAccessed = Date.now();
    }
    return entry;
  }

  async saveAudio(
    audioId: number,
    format: string,
    data: Buffer
  ): Promise<CachedAudioEntry> {
    // Check if we need to make room (LRU eviction)
    await this.ensureSpace(data.length);

    const filePath = this.getCachePath(audioId, format);
    const fileName = `${audioId}.${format}`;

    // Write file to cache
    fs.writeFileSync(filePath, data);

    const stats = fs.statSync(filePath);
    const entry: CachedAudioEntry = {
      filePath,
      fileName,
      fileSize: stats.size,
      format,
      cachedAt: Date.now(),
      lastAccessed: Date.now(),
      audioId,
    };

    this.cache.set(audioId, entry);
    this.logger.debug(
      `Cached audio file: ${fileName} (${this.formatBytes(stats.size)})`
    );

    return entry;
  }

  private async ensureSpace(requiredBytes: number): Promise<void> {
    const currentSize = this.getTotalCacheSize();

    if (currentSize + requiredBytes <= this.maxCacheSizeBytes) {
      return;
    }

    // Sort by last accessed (oldest first) and evict until we have space
    const entries = Array.from(this.cache.values()).sort(
      (a, b) => a.lastAccessed - b.lastAccessed
    );

    let freedSpace = 0;
    const spaceNeeded = currentSize + requiredBytes - this.maxCacheSizeBytes;

    for (const entry of entries) {
      if (freedSpace >= spaceNeeded) break;

      this.deleteEntry(entry.audioId);
      freedSpace += entry.fileSize;
    }

    this.logger.log(`Evicted ${this.formatBytes(freedSpace)} from cache`);
  }

  private deleteEntry(audioId: number): void {
    const entry = this.cache.get(audioId);
    if (entry) {
      try {
        if (fs.existsSync(entry.filePath)) {
          fs.unlinkSync(entry.filePath);
        }
      } catch (error) {
        this.logger.error(
          `Failed to delete cached file: ${entry.filePath}`,
          error
        );
      }
      this.cache.delete(audioId);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [audioId, entry] of this.cache.entries()) {
      const age = now - entry.cachedAt;
      if (age > this.cacheTtlMs) {
        this.deleteEntry(audioId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.log(`Cleaned up ${cleaned} expired cache entries`);
    }
  }

  private getTotalCacheSize(): number {
    let total = 0;
    for (const entry of this.cache.values()) {
      total += entry.fileSize;
    }
    return total;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getStats(): { totalEntries: number; totalSize: string } {
    return {
      totalEntries: this.cache.size,
      totalSize: this.formatBytes(this.getTotalCacheSize()),
    };
  }
}
