import { Controller, Get, Param } from '@nestjs/common';
import { NoteMemoTagRepository } from 'src/notes/infra/repositories/note-memo-tag.repository';

@Controller('notes')
export class GetNoteNamesByUserIdAction {
  constructor(private readonly noteRepository: NoteMemoTagRepository) {}

  //@TODO: change to something like names/userId/:userId
  @Get(':userId/names')
  async apply(@Param('userId') userId: string): Promise<{name:string, id:number}[]> {
    return await this.noteRepository.getNoteNamesByUserId(userId);
  }
}
