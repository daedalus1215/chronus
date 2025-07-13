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
} 