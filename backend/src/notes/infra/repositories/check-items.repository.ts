import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckItem } from 'src/check-items/domain/entities/check-item.entity';

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
      noteId,
    });
  }
}
