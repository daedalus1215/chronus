import { Controller, Patch, Param, Body } from '@nestjs/common';
import { TagService } from '../../../domain/services/tag.service';
import { AddTagToNoteDto } from '../../dtos/requests/add-tag-to-note.dto';
import { NoteResponseDto } from '../../../../notes/apps/dtos/responses/note.response.dto';
import { ProtectedAction } from 'src/time-tracks/apps/decorators/protected-action.decorator';
import { AddTagToNoteSwagger } from './swagger/add-tag-to-note.swagger';
import { GetAuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';
import { Tag } from 'src/tags/domain/entities/tag.entity';

@Controller('notes')
export class AddTagToNoteAction {
  constructor(private readonly tagService: TagService) {}

  @Patch(':id/add-tag')
  @ProtectedAction(AddTagToNoteSwagger)
  async apply(
    @Param('id') id: string,
    @Body() body: Partial<AddTagToNoteDto>,
    @GetAuthUser('userId') userId: string
  ): Promise<Tag> {
    return this.tagService.addTagToNote({
      noteId: parseInt(id, 10),
      userId,
      ...body,
    });
  }
} 