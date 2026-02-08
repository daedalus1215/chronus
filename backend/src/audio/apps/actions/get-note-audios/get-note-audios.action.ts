import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';
import { AudioService } from 'src/audio/domain/services/audio.service';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';

@Controller('audio')
@UseGuards(JwtAuthGuard)
export class GetNoteAudiosAction {
  constructor(private readonly audioService: AudioService) {}

  @Get('note/:noteId')
  @ProtectedAction({
    tag: 'audio',
    summary: 'Get all audio files for a note - Returns a list of all audio metadata associated with the specified note',
  })
  async execute(
    @Param('noteId') noteId: string,
    @GetAuthUser('userId') userId: number
  ) {
    const noteIdNum = parseInt(noteId, 10);
    const audios = await this.audioService.getNoteAudios(noteIdNum);
    return { audios };
  }
}
