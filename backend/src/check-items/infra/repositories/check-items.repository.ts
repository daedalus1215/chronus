import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckItem } from '../../domain/entities/check-item.entity';

@Injectable()
export class CheckItemsRepository {
  constructor(
    @InjectRepository(CheckItem)
    private readonly checkItemRepository: Repository<CheckItem>
  ) {}

  async save(checkItem: CheckItem): Promise<CheckItem> {
    return this.checkItemRepository.save(checkItem);
  }

  async findByNoteId(noteId: number): Promise<CheckItem[]> {
    return this.checkItemRepository.findBy({
      noteId: noteId,
    });
  }

  async findById(id: number): Promise<CheckItem | null> {
    return this.checkItemRepository.findOne({ where: { id } });
  }

  async delete(id: number): Promise<void> {
    await this.checkItemRepository.delete(id);
  }

  async update(id: number, updates: Partial<CheckItem>): Promise<CheckItem> {
    await this.checkItemRepository.update(id, updates);
    return this.findById(id);
  }

  async findByIdWithNoteValidation(id: number, userId: number): Promise<CheckItem | null> {
    // Use raw SQL to avoid cross-domain entity relationships
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

    // Map raw result back to CheckItem entity
    const checkItem = new CheckItem();
    checkItem.id = result.id;
    checkItem.name = result.name;
    checkItem.doneDate = result.done_date;
    checkItem.archiveDate = result.archived_date;
    checkItem.noteId = result.note_id;
    checkItem.createdAt = result.created_at;
    checkItem.updatedAt = result.updated_at;

    return checkItem;
  }

  async findByIdWithNoteValidationForUpdate(id: number, userId: number): Promise<CheckItem | null> {
    // Use raw SQL to avoid cross-domain entity relationships
    const result = await this.checkItemRepository
      .createQueryBuilder('checkItem')
      .select('checkItem.*')
      .addSelect('note.user_id', 'noteUserId')
      .innerJoin('notes', 'note', 'note.id = checkItem.note_id')
      .where('checkItem.id = :id', { id })
      .andWhere('note.user_id = :userId', { userId })
      .getRawOne();

    if (!result) return null;

    // Map raw result back to CheckItem entity
    const checkItem = new CheckItem();
    checkItem.id = result.id;
    checkItem.name = result.name;
    checkItem.doneDate = result.done_date;
    checkItem.archiveDate = result.archived_date;
    checkItem.noteId = result.note_id;
    checkItem.createdAt = result.created_at;
    checkItem.updatedAt = result.updated_at;

    return checkItem;
  }
} 