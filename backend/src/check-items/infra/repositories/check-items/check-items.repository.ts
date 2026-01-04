import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckItem } from '../../../domain/entities/check-item.entity';
import { CheckItemsHydrator } from './check-items.hydrator';

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
      .select('checkItem.*')
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
      .select('checkItem.*')
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
      .select('checkItem.*')
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

  async getMinOrderByNoteId(noteId: number): Promise<number> {
    const result = await this.checkItemRepository
      .createQueryBuilder('checkItem')
      .select('MIN(checkItem.order)', 'minOrder')
      .where('checkItem.note_id = :noteId', { noteId })
      .getRawOne();

    return result?.minOrder ?? 0;
  }
}
