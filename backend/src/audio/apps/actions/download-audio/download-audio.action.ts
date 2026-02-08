import { Controller, Get, Param, ParseIntPipe, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';
import { AudioService } from 'src/audio/domain/services/audio.service';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { DownloadAudioResponder } from './download-audio.responder';

@Controller('audio')
@UseGuards(JwtAuthGuard)
export class DownloadAudioAction {
  constructor(private readonly audioService: AudioService, private readonly downloadAudioResponder: DownloadAudioResponder) { }

  @Get('download/:audioId')
  @ProtectedAction({
    tag: 'audio',
    summary: 'Download a specific audio file - Downloads the audio file identified by audioId. Verifies user owns the associated note.',
  })
  async execute(
    @GetAuthUser('userId') userId: number,
    @Param('audioId', ParseIntPipe) audioId: number,
    @Res() res: Response
  ) {
    this.downloadAudioResponder.apply(await this.audioService.downloadAudioById(audioId, userId), res);
  }
}
