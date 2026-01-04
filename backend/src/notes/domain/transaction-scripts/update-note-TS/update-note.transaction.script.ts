import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateNoteDto } from 'src/notes/apps/dtos/requests/update-note.dto';
import { NoteMemoTagRepository } from '../../../infra/repositories/note-memo-tag.repository';
import { Note } from '../../entities/notes/note.entity';
import { UpdateNoteParamsToEntityConverter } from './update-note-params-to-entity.converter';
import { UpdateNoteParams } from './update-note.params';

@Injectable()
export class UpdateNoteTransactionScript {
  constructor(
    private readonly noteRepository: NoteMemoTagRepository,
    private readonly updateNoteParamsToEntityConverter: UpdateNoteParamsToEntityConverter
  ) {}

  async apply(
    id: number,
    updateNoteDto: UpdateNoteDto,
    userId: number
  ): Promise<Note> {
    const note = await this.noteRepository.findById(id, userId);

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    // Convert DTO to Params (domain layer boundary)
    const updateNoteParams: UpdateNoteParams = {
      name: updateNoteDto.name,
      description: updateNoteDto.description,
      tags: updateNoteDto.tags,
    };

    return await this.noteRepository.save(
      this.updateNoteParamsToEntityConverter.apply(updateNoteParams, note)
    );
  }
}
