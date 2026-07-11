import {
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';
import { AudioService } from 'src/audio/domain/services/audio.service';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { DeleteAudioSwagger } from './delete-audio.swagger';

@Controller('audio')
@UseGuards(JwtAuthGuard)
export class DeleteAudioAction {
  constructor(private readonly audioService: AudioService) {}

  @Delete(':audioId')
  @ProtectedAction(DeleteAudioSwagger)
  async execute(
    @GetAuthUser('userId') userId: number,
    @Param('audioId', ParseIntPipe) audioId: number
  ) {
    await this.audioService.deleteAudio(audioId, userId);
    return { success: true };
  }
}
