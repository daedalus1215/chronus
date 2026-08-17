import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoteVersion } from '../../domain/entities/notes/note-version.entity';

@Injectable()
export class NoteVersionRepository {
  constructor(
    @InjectRepository(NoteVersion)
    private readonly repository: Repository<NoteVersion>
  ) {}

  async create(
    noteId: number,
    versionNum: number,
    description: string
  ): Promise<NoteVersion> {
    const version = new NoteVersion();
    version.noteId = noteId;
    version.versionNum = versionNum;
    version.description = description;
    return this.repository.save(version);
  }

  async findByNoteId(noteId: number, userId: number): Promise<NoteVersion[]> {
    return this.repository
      .createQueryBuilder('nv')
      .innerJoin('notes', 'n', 'n.id = nv.note_id')
      .where('nv.note_id = :noteId', { noteId })
      .andWhere('n.user_id = :userId', { userId })
      .orderBy('nv.version_num', 'DESC')
      .getMany();
  }

  async findById(id: number, noteId: number, userId: number): Promise<NoteVersion | null> {
    return this.repository
      .createQueryBuilder('nv')
      .innerJoin('notes', 'n', 'n.id = nv.note_id')
      .where('nv.id = :id', { id })
      .andWhere('nv.note_id = :noteId', { noteId })
      .andWhere('n.user_id = :userId', { userId })
      .getOne();
  }

  async deleteOldestBeyond(noteId: number, keep: number): Promise<void> {
    // Delete oldest versions beyond the keep limit
    // First get the count to determine how many to delete
    const countResult = await this.repository
      .createQueryBuilder('nv')
      .select('COUNT(*)', 'count')
      .where('nv.note_id = :noteId', { noteId })
      .getRawOne();
    const totalCount = parseInt(countResult?.count ?? '0', 10);
    const evictCount = Math.max(0, totalCount - keep);
    
    if (evictCount > 0) {
      await this.repository.query(
        `DELETE FROM note_versions WHERE note_id = ? AND version_num IN (SELECT version_num FROM note_versions WHERE note_id = ? ORDER BY version_num ASC LIMIT ?)`,
        [noteId, noteId, evictCount]
      );
    }
  }

  async getLatestVersionNum(noteId: number): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('nv')
      .select('MAX(nv.version_num)', 'maxNum')
      .where('nv.note_id = :noteId', { noteId })
      .getRawOne();
    return (result?.maxNum ? parseInt(result.maxNum, 10) : 0);
  }

  async getLatestDescription(noteId: number): Promise<string | null> {
    const result = await this.repository
      .createQueryBuilder('nv')
      .select('nv.description', 'description')
      .where('nv.note_id = :noteId', { noteId })
      .orderBy('nv.version_num', 'DESC')
      .limit(1)
      .getRawOne();
    return result?.description ?? null;
  }

  async countByNoteId(noteId: number): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('nv')
      .select('COUNT(*)', 'count')
      .where('nv.note_id = :noteId', { noteId })
      .getRawOne();
    return parseInt(result?.count ?? '0', 10);
  }

  async saveMany(versions: NoteVersion[]): Promise<NoteVersion[]> {
    return this.repository.save(versions);
  }
}
