import { Controller, Get, Param } from '@nestjs/common';
import { NoteTagRepository } from 'src/notes/infra/repositories/note-tag.repository';

@Controller('notes')
export class getNoteNamesByUserIdAction {
  constructor(private readonly noteRepository: NoteTagRepository) {}

  @Get(':userId/names')
  async apply(@Param('userId') userId: string): Promise<{name:string, id:number}[]> {
    return await this.noteRepository.getNoteNamesByUserId(userId);
  }
}
