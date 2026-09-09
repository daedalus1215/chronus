import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckItem } from '../../../domain/entities/check-item.entity';
import { CheckItemsHydrator } from './check-items.hydrator';

export type SearchCheckItemResult = {
  noteId: number;
  noteName: string;
  checkItemId: number;
  checkItemName: string;
  checkItemStatus: 'ready' | 'in_progress' | 'review' | 'done';
  checkItemDescription: string | null;
  checkItemIsArchived: boolean;
};

/**
 * Normalises a SQL boolean across drivers.
 *
 * `pg` returns a real boolean; SQLite returned 1/0, and some drivers hand back 't' or '1'
 * as text. Reading a raw result means reading whatever the driver produced, so accept all
 * of them rather than assuming one.
 */
const isTruthy = (value: unknown): boolean =>
  value === true || value === 1 || value === '1' || value === 't';

@Injectable()
export class CheckItemsRepository {
  constructor(
    @InjectRepository(CheckItem)
    private readonly checkItemRepository: Repository<CheckItem>,
    private readonly hydrator: CheckItemsHydrator
  ) {}

  async save(checkItem: CheckItem): Promise<CheckItem> {
    return this.checkItemRepository.save(checkItem);
  }

  async saveMany(checkItems: CheckItem[]): Promise<CheckItem[]> {
    return this.checkItemRepository.save(checkItems);
  }

  async findByNoteId(noteId: number): Promise<CheckItem[]> {
    return this.checkItemRepository.find({
      where: { noteId },
      order: { order: 'ASC' },
    });
  }

  async findById(id: number): Promise<CheckItem | null> {
    return this.checkItemRepository.findOne({ where: { id } });
  }

  async delete(id: number): Promise<void> {
    await this.checkItemRepository.delete(id);
  }

  async deleteByNoteId(noteId: number): Promise<void> {
    await this.checkItemRepository.delete({ noteId });
  }

  async update(id: number, updates: Partial<CheckItem>): Promise<CheckItem> {
    await this.checkItemRepository.update(id, updates);
    return this.findById(id);
  }

  async findByIdWithNoteValidation(
    id: number,
    userId: number
  ): Promise<CheckItem | null> {
    const result = await this.checkItemRepository
      .createQueryBuilder('checkItem')
      // ⚠️ The alias MUST be quoted here. TypeORM rewrites `alias.property` into
      // `"alias"."column"` everywhere it recognises a property or column name, but `*` is
      // neither, so this string reaches Postgres verbatim. Unquoted, Postgres folds
      // `checkItem` to `checkitem`, which does not match the quoted alias it emitted in the
      // FROM clause: `missing FROM-clause entry for table "checkitem"` (42P01). SQLite was
      // case-insensitive and hid this. Same applies to the two other `.*` selects below.
      .select('"checkItem".*')
      .addSelect('note.user_id', 'noteUserId')
      .innerJoin('notes', 'note', 'note.id = checkItem.note_id')
      .where('checkItem.id = :id', { id })
      .andWhere('note.user_id = :userId', { userId })
      .andWhere('checkItem.archived_date IS NULL')
      .getRawOne();

    if (!result) return null;

    return this.hydrator.fromRawResult(result);
  }

  async findByIdWithNoteValidationForUpdate(
    id: number,
    noteId: number,
    userId: number
  ): Promise<CheckItem | null> {
    const result = await this.checkItemRepository
      .createQueryBuilder('checkItem')
      .select('"checkItem".*')
      .addSelect('note.user_id', 'noteUserId')
      .innerJoin('notes', 'note', 'note.id = checkItem.note_id')
      .where('checkItem.id = :id', { id })
      .andWhere('note.user_id = :userId', { userId })
      .getRawOne();

    if (!result) return null;

    return this.hydrator.fromRawResult(result);
  }

  async findByNoteIdWithUserValidation(
    noteId: number,
    userId: number
  ): Promise<CheckItem[]> {
    const results = await this.checkItemRepository
      .createQueryBuilder('checkItem')
      .select('"checkItem".*')
      .innerJoin('notes', 'note', 'note.id = checkItem.note_id')
      .where('checkItem.note_id = :noteId', { noteId })
      .andWhere('note.user_id = :userId', { userId })
      .orderBy('checkItem.order', 'ASC')
      .getRawMany();

    return this.hydrator.fromRawResults(results);
  }

  async getMaxOrderByNoteId(noteId: number): Promise<number> {
    const result = await this.checkItemRepository
      .createQueryBuilder('checkItem')
      .select('MAX(checkItem.order)', 'maxOrder')
      .where('checkItem.note_id = :noteId', { noteId })
      .getRawOne();

    return result?.maxOrder ?? -1;
  }

  async searchByQuery(
    userId: number,
    query: string,
    options?: { includeArchived?: boolean }
  ): Promise<SearchCheckItemResult[]> {
    const qb = this.checkItemRepository
      .createQueryBuilder('checkItem')
      .select('note.id', 'noteId')
      .addSelect('note.name', 'noteName')
      .addSelect('checkItem.id', 'checkItemId')
      .addSelect('checkItem.name', 'checkItemName')
      .addSelect('checkItem.status', 'checkItemStatus')
      .addSelect('checkItem.description', 'checkItemDescription')
      .addSelect('checkItem.archived_date IS NOT NULL', 'checkItemIsArchived')
      .innerJoin('notes', 'note', 'note.id = checkItem.note_id')
      .where('note.user_id = :userId', { userId })
      .andWhere(
        '(LOWER(checkItem.name) LIKE LOWER(:query) OR LOWER(checkItem.description) LIKE LOWER(:query))',
        { query: `%${query}%` }
      );

    if (!options?.includeArchived) {
      qb.andWhere('checkItem.archived_date IS NULL');
    }

    const raw = await qb.orderBy('note.updated_at', 'DESC').limit(20).getRawMany();

    return raw.map(row => ({
      noteId: parseInt(row.noteId, 10),
      noteName: row.noteName,
      checkItemId: parseInt(row.checkItemId, 10),
      checkItemName: row.checkItemName,
      checkItemStatus: row.checkItemStatus as 'ready' | 'in_progress' | 'review' | 'done',
      checkItemDescription: row.checkItemDescription ?? null,
      // ⚠️ Postgres returns a real boolean for `archived_date IS NOT NULL`; SQLite
      // returned 1/0. Comparing only against 1/'1' made every archived item read as NOT
      // archived once the database changed, with no error to notice.
      checkItemIsArchived: isTruthy(row.checkItemIsArchived),
    }));
  }

  async getMinOrderByNoteId(noteId: number): Promise<number> {
    const result = await this.checkItemRepository
      .createQueryBuilder('checkItem')
      .select('MIN(checkItem.order)', 'minOrder')
      .where('checkItem.note_id = :noteId', { noteId })
      .getRawOne();

    return result?.minOrder ?? 0;
  }
}
