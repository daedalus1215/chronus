import { Injectable, NotFoundException } from '@nestjs/common';
import { NoteMemoTagRepository } from '../../infra/repositories/note-memo-tag.repository';

@Injectable()
export class UpdateNoteTimestampTransactionScript {
  constructor(private readonly noteRepository: NoteMemoTagRepository) {}

  async apply(id: number, userId: number): Promise<void> {
    const result = await this.noteRepository.updateNoteTimestamp(id, userId);
    if (result.affected === 0) {
      throw new NotFoundException('Note not found');
    }
  }
}
